// functions/setAdmin.js
// ADVERTENCIA: Esta función es solo para asignar el rol de administrador a la primera cuenta.
// DEBE SER ELIMINADA O DESHABILITADA INMEDIATAMENTE DESPUÉS DE SU USO.

const admin = require('firebase-admin');

// Inicialización de Firebase Admin SDK.
// Lee las credenciales del Service Account desde la variable de entorno de Netlify (FIREBASE_ADMIN_CONFIG)
if (!admin.apps.length) {
    try {
        const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CONFIG);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
    } catch (e) {
        console.error("Error al inicializar Firebase Admin SDK. ¿FIREBASE_ADMIN_CONFIG está configurada correctamente en Netlify?", e);
    }
}
const auth = admin.auth();

exports.handler = async (event, context) => {
    // 1. **CRÍTICO:** REEMPLAZA ESTE EMAIL con el correo de la cuenta que quieres convertir en Administrador.
    const adminEmail = 'tomaspro83xd@gmail.com'; 

    try {
        if (!adminEmail.includes('@')) {
            return { statusCode: 400, body: JSON.stringify({ error: "Por favor, edita el archivo setAdmin.js y proporciona un email válido." }) };
        }

        const user = await auth.getUserByEmail(adminEmail);

        // 2. Establecer el Custom Claim 'admin: true'
        await auth.setCustomUserClaims(user.uid, { admin: true });

        // Revocamos tokens anteriores para que el usuario obtenga el nuevo permiso inmediatamente al volver a iniciar sesión.
        await auth.revokeRefreshTokens(user.uid); 

        return {
            statusCode: 200,
            body: JSON.stringify({ message: `¡Éxito! El usuario ${adminEmail} (UID: ${user.uid}) ahora tiene permisos de administrador.`, uid: user.uid }),
        };

    } catch (error) {
        console.error("Error al asignar rol de admin:", error);
        let errorMessage = error.message;
        if (error.code === 'auth/user-not-found') {
            errorMessage = `Usuario no encontrado para el email: ${adminEmail}. Asegúrate de haberlo creado en Firebase Authentication primero.`;
        }

        return {
            statusCode: 500,
            body: JSON.stringify({ error: `Fallo al asignar el rol: ${errorMessage}` }),
        };
    }
};

// Después de desplegar en Netlify, navega a /.netlify/functions/setAdmin para ejecutarlo.
