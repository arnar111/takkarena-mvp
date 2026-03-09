/**
 * One-time script to set kennitala for user 570
 * Run this with: npx ts-node scripts/set-kennitala-570.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: "takkarena-dd5d1.firebaseapp.com",
    projectId: "takkarena-dd5d1",
    storageBucket: "takkarena-dd5d1.appspot.com",
    messagingSenderId: "1076824376935",
    appId: "1:1076824376935:web:ab5f8c9d8d8c8d8d8d8d8d"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function setKennitalaForUser570() {
    try {
        const q = query(collection(db, "users"), where("staffId", "==", "570"));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            console.error("User 570 not found!");
            process.exit(1);
        }

        const userDoc = snapshot.docs[0];
        await updateDoc(doc(db, "users", userDoc.id), {
            kennitala: "1412922269"
        });

        console.log("✅ Successfully set kennitala for user 570");
        console.log("   User:", userDoc.data().name);
        console.log("   Kennitala: 1412922269");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
}

setKennitalaForUser570();
