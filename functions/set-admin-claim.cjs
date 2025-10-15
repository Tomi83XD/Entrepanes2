// functions/set-admin-claim.js

const admin = require("firebase-admin");
const serviceAccount = require("../serviceAccountKey.json"); // Asegurate que el path sea correcto

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const targetEmail = "tomaspro83xd@gmail.com";

admin.auth().getUserByEmail(targetEmail)
  .then((userRecord) => {
    const uid = userRecord.uid;
    return admin.auth().setCustomUserClaims(uid, { admin: true });
  })
  .then(() => {
    console.log(`✅ Rol de administrador asignado a ${targetEmail}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error al asignar el rol:", error);
    process.exit(1);
  });