import { collection, addDoc, query, orderBy, onSnapshot, getDocs, type Timestamp } from "firebase/firestore"
import { db } from "./firebase"

export interface Announcement {
  id: string
  message: string
  type: "info" | "warning" | "success" | "error"
  sentBy: string
  sentAt: Timestamp
  isActive: boolean
  priority: "low" | "medium" | "high"
}

export const createAnnouncement = async (announcement: Omit<Announcement, "id" | "sentAt">) => {
  try {
    const docRef = await addDoc(collection(db, "announcements"), {
      ...announcement,
      sentAt: new Date(),
    })
    return docRef.id
  } catch (error) {
    console.error("Error creating announcement:", error)
    throw error
  }
}

export const getActiveAnnouncements = async (): Promise<Announcement[]> => {
  try {
    const q = query(collection(db, "announcements"), orderBy("sentAt", "desc"))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Announcement)
      .filter((announcement) => announcement.isActive)
  } catch (error) {
    console.error("Error fetching announcements:", error)
    return []
  }
}

export const subscribeToAnnouncements = (callback: (announcements: Announcement[]) => void) => {
  const q = query(collection(db, "announcements"), orderBy("sentAt", "desc"))

  return onSnapshot(q, (querySnapshot) => {
    const announcements = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }) as Announcement)
      .filter((announcement) => announcement.isActive)
    callback(announcements)
  })
}
