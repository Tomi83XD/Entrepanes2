// Importaciones necesarias
const admin = require('firebase-admin');

// Inicializa Firebase Admin SDK (solo si aún no está inicializado)
if (!admin.apps.length) {
    // Aquí se carga tu clave de servicio de forma segura en Netlify
    // El proceso de Netlify inyecta las credenciales automáticamente,
    // o las toma de un archivo cargado.
    admin.initializeApp(); 
}

// Este es el punto de entrada (handler) que Netlify/Lambda busca
exports.handler = async function(event, context) {
    // 1. Verificar que la solicitud sea un método GET (o el que esperes)
    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Método no permitido." };
    }

    // 2. Obtener el correo electrónico de la query string
    const email = event.queryStringParameters.email;

    if (!email) {
        return { statusCode: 400, body: JSON.stringify({ message: "Se requiere el parámetro 'email'." }) };
    }

    try {
        // 3. Obtener el usuario por correo electrónico
        const user = await admin.auth().getUserByEmail(email);

        // 4. Asignar el custom claim "admin"
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });

        // 5. Devolver una respuesta exitosa
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
                message: `Successfully set custom claim 'admin: true' for UID: ${user.uid} with email: ${email}` 
            }),
        };

    } catch (error) {
        console.error("Error al setear el admin claim:", error);
        
        // Devolver un error
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: `Error: ${error.message}` }),
        };
    }
};
