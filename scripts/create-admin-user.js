// Script to create an admin user in Firebase
// Run this in your browser console or as a Node.js script

const createAdminUser = async () => {
  // You'll need to import Firebase functions
  const { doc, setDoc, getFirestore } = require("firebase/firestore")
  const { createUserWithEmailAndPassword, getAuth } = require("firebase/auth")

  const auth = getAuth()
  const db = getFirestore()

  try {
    // Create admin user account
    const adminEmail = "admin@skillswap.com"
    const adminPassword = "admin123456" // Change this to a secure password

    const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword)
    const user = userCredential.user

    // Create admin profile in Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: "Admin User",
      email: adminEmail,
      skillsOffered: ["Platform Management"],
      skillsWanted: ["Community Building"],
      availability: "flexible",
      isPublic: false,
      rating: 5.0,
      bio: "Platform administrator",
      isAdmin: true, // This is the key field!
      createdAt: new Date(),
    })

    console.log("Admin user created successfully!")
    console.log("Email:", adminEmail)
    console.log("Password:", adminPassword)
    console.log("User ID:", user.uid)
  } catch (error) {
    console.error("Error creating admin user:", error)
  }
}

// Call the function
createAdminUser()
