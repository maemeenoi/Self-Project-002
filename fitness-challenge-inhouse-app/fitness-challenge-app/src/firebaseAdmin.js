import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"

// Initialize admin app if it hasn't been initialized
let adminApp

if (!getApps().length) {
  try {
    adminApp = initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    })
  } catch (error) {
    console.error("Firebase admin initialization error:", error)
  }
} else {
  adminApp = getApps()[0]
}

const adminDb = getFirestore(adminApp)

export { adminDb }
