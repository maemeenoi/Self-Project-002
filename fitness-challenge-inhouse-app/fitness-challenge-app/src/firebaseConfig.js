import { initializeApp, getApps } from "firebase/app"
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirestore, initializeFirestore } from "firebase/firestore"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Initialize Firebase
let firebaseApp
let auth
let db

try {
  if (!getApps().length) {
    console.log("Initializing Firebase...")
    firebaseApp = initializeApp(firebaseConfig)
    console.log("Firebase initialized successfully")

    // Initialize Auth with persistence
    auth = getAuth(firebaseApp)
    console.log("Firebase Auth initialized")

    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Firebase Auth persistence set to LOCAL")
      })
      .catch((error) => {
        console.error("Error setting persistence:", error)
      })

    // Initialize Firestore with settings
    db = initializeFirestore(firebaseApp, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    })
    console.log("Firestore initialized with custom settings")
  } else {
    console.log("Using existing Firebase instance")
    firebaseApp = getApps()[0]
    auth = getAuth(firebaseApp)
    db = getFirestore(firebaseApp)
  }
} catch (error) {
  console.error("Error initializing Firebase:", error)
  throw new Error(`Firebase initialization error: ${error.message}`)
}

export { auth, db }
