"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  type User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth"
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
  location?: string
  skillsOffered: string[]
  skillsWanted: string[]
  availability: string
  isPublic: boolean
  rating: number
  bio?: string
  isAdmin?: boolean
  completedSwaps?: number
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  firebaseUser: FirebaseUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: any) => Promise<void>
  logout: () => Promise<void>
  updateProfile: (updates: Partial<User>) => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setFirebaseUser(firebaseUser)
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        if (userDoc.exists()) {
          const userData = userDoc.data() as User
          setUser({ ...userData, id: firebaseUser.uid })
        }
      } else {
        setFirebaseUser(null)
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const login = async (email: string, password: string): Promise<void> => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const register = async (userData: any): Promise<void> => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, userData.email, userData.password)

      // Create user profile in Firestore
      const newUser: Omit<User, "id"> = {
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar || "",
        skillsOffered: [],
        skillsWanted: [],
        availability: "flexible",
        isPublic: true,
        rating: 5.0,
        bio: "",
        completedSwaps: 0,
        createdAt: new Date(),
      }

      await setDoc(doc(db, "users", firebaseUser.uid), newUser)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const logout = async (): Promise<void> => {
    try {
      await signOut(auth)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  const updateProfile = async (updates: Partial<User>): Promise<void> => {
    if (user && firebaseUser) {
      try {
        await updateDoc(doc(db, "users", firebaseUser.uid), updates)
        setUser({ ...user, ...updates })
      } catch (error: any) {
        throw new Error(error.message)
      }
    }
  }

  const resetPassword = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        loading,
        login,
        register,
        logout,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
