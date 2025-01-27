import { db } from "./firebase"
import { collection, getDocs } from "firebase/firestore"

export async function testFirestoreConnection() {
  try {
    // Try to get users collection
    const usersRef = collection(db, "users")
    const snapshot = await getDocs(usersRef)
    console.log(
      "Successfully connected to Firestore. Number of users:",
      snapshot.size
    )
    return true
  } catch (error) {
    console.error("Error connecting to Firestore:", error)
    return false
  }
}
