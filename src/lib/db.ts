import { db } from "./firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query } from "firebase/firestore";
import { User as UserType, ParaphraseHistoryItem } from "../types";

export const USERS_COLLECTION = "users";
export const HISTORY_COLLECTION = "paraphrase_history";

export const getUsers = async (): Promise<UserType[]> => {
  const q = collection(db, USERS_COLLECTION);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
}

export const getHistory = async (): Promise<ParaphraseHistoryItem[]> => {
  const q = collection(db, HISTORY_COLLECTION);
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParaphraseHistoryItem));
}

export const addUser = async (user: Omit<UserType, "id">) => {
  return await addDoc(collection(db, USERS_COLLECTION), user);
}

export const updateUserRole = async (userId: string, role: "user" | "admin") => {
  await updateDoc(doc(db, USERS_COLLECTION, userId), { role });
}

export const deleteUser = async (userId: string) => {
  await deleteDoc(doc(db, USERS_COLLECTION, userId));
}

export const addHistoryItem = async (item: Omit<ParaphraseHistoryItem, "id">) => {
  return await addDoc(collection(db, HISTORY_COLLECTION), item);
}
