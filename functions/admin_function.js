// Importaciones necesarias
const admin = require('firebase-admin');

// Inicializa Firebase Admin SDK (solo si aún no está inicializado)
if (!admin.apps.length) {
    // Verificar si la variable de entorno con la clave JSON está disponible.
    const serviceAccountJson = process.env.FIREBASE_ADMIN_CONFIG;

    if (serviceAccountJson) {
        try {
            // Parsear el JSON de la clave de servicio
            const serviceAccount = JSON.parse(serviceAccountJson);

            // Inicializar usando la clave explícita de Netlify
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount)
            });
        } catch (e) {
            console.error("ERROR: No se pudo parsear FIREBASE_ADMIN_CONFIG:", e);
            // Fallback a inicialización automática, aunque probablemente fallará sin Project ID
            admin.initializeApp();
        }
    } else {
        // Inicialización automática (solo si Netlify configura variables por defecto)
        admin.initializeApp();
    }
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
