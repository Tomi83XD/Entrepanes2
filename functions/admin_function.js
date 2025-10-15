// netlify/functions/admin_function.js
const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK (solo una vez)
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        })
    });
}

exports.handler = async (event, context) => {
    // Solo permitir POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Método no permitido' })
        };
    }

    try {
        // Obtener el token del header Authorization
        const authHeader = event.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'No autorizado - Token faltante' })
            };
        }

        const idToken = authHeader.split('Bearer ')[1];
        
        // Verificar el token y obtener los claims del usuario
        let decodedToken;
        try {
            decodedToken = await admin.auth().verifyIdToken(idToken);
        } catch (error) {
            console.error('Error al verificar token:', error);
            return {
                statusCode: 401,
                body: JSON.stringify({ error: 'Token inválido o expirado' })
            };
        }

        // Verificar que el usuario tiene el claim 'admin: true'
        if (!decodedToken.admin) {
            return {
                statusCode: 403,
                body: JSON.stringify({ error: 'Acceso prohibido - No eres administrador' })
            };
        }

        // Parsear el body de la solicitud
        const requestBody = JSON.parse(event.body);
        const { action } = requestBody;

        // Manejar diferentes acciones
        switch (action) {
            case 'update_price': {
                const { itemId, newPrice } = requestBody;

                // Validaciones
                if (!itemId || typeof newPrice !== 'number' || newPrice <= 0) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'Datos inválidos. Verifica itemId y newPrice.' })
                    };
                }

                // Actualizar el precio en Firestore
                await admin.firestore()
                    .collection('menu')
                    .doc(itemId)
                    .update({ price: newPrice });

                return {
                    statusCode: 200,
                    body: JSON.stringify({ 
                        message: `Precio actualizado a $${newPrice} exitosamente` 
                    })
                };
            }

            case 'add_product': {
                const { name, price } = requestBody;

                // Validaciones
                if (!name || typeof name !== 'string' || name.trim() === '') {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'El nombre del producto es requerido' })
                    };
                }

                if (typeof price !== 'number' || price <= 0) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'El precio debe ser un número positivo' })
                    };
                }

                // Agregar el nuevo producto a Firestore
                const docRef = await admin.firestore()
                    .collection('menu')
                    .add({
                        name: name.trim(),
                        price: price,
                        createdAt: admin.firestore.FieldValue.serverTimestamp()
                    });

                return {
                    statusCode: 200,
                    body: JSON.stringify({ 
                        message: `Producto "${name}" agregado exitosamente`,
                        productId: docRef.id
                    })
                };
            }

            case 'delete_product': {
                // Esta acción es opcional, por si quieres implementar eliminación más adelante
                const { itemId } = requestBody;

                if (!itemId) {
                    return {
                        statusCode: 400,
                        body: JSON.stringify({ error: 'itemId es requerido' })
                    };
                }

                await admin.firestore()
                    .collection('menu')
                    .doc(itemId)
                    .delete();

                return {
                    statusCode: 200,
                    body: JSON.stringify({ 
                        message: 'Producto eliminado exitosamente' 
                    })
                };
            }

            default:
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: `Acción desconocida: ${action}` })
                };
        }

    } catch (error) {
        console.error('Error en admin_function:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Error interno del servidor',
                details: error.message 
            })
        };
    }
};