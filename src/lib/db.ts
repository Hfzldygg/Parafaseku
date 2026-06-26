import { db, auth } from "./firebase";
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc, query, getDoc, setDoc } from "firebase/firestore";
import { User as UserType, ParaphraseHistoryItem } from "../types";

export const USERS_COLLECTION = "users";
export const HISTORY_COLLECTION = "paraphrase_history";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const getUsers = async (): Promise<UserType[]> => {
  try {
    const q = collection(db, USERS_COLLECTION);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserType));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, USERS_COLLECTION);
    return [];
  }
}

export const getHistory = async (): Promise<ParaphraseHistoryItem[]> => {
  try {
    const q = collection(db, HISTORY_COLLECTION);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ParaphraseHistoryItem));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, HISTORY_COLLECTION);
    return [];
  }
}

export const addUser = async (user: Omit<UserType, "id">) => {
  try {
    return await addDoc(collection(db, USERS_COLLECTION), user);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, USERS_COLLECTION);
  }
}

export const updateUserRole = async (userId: string, role: "user" | "admin") => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), { role });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, USERS_COLLECTION);
  }
}

export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, USERS_COLLECTION, userId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, USERS_COLLECTION);
  }
}

export const addHistoryItem = async (item: Omit<ParaphraseHistoryItem, "id">) => {
  try {
    return await addDoc(collection(db, HISTORY_COLLECTION), item);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, HISTORY_COLLECTION);
  }
}

export const syncGoogleUser = async (uid: string, name: string, email: string): Promise<UserType> => {
  try {
    const userDocRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as UserType;
    } else {
      // Check if email already exists under a random doc ID (to prevent duplicate emails)
      const allUsers = await getUsers();
      const existingUserByEmail = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (existingUserByEmail) {
        return existingUserByEmail;
      }

      // Create new user profile
      const newUser: Omit<UserType, "id"> = {
        name,
        email: email.toLowerCase(),
        role: "user",
        createdAt: new Date().toISOString()
      };
      
      await setDoc(userDocRef, newUser);
      return { id: uid, ...newUser };
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, USERS_COLLECTION);
    throw error;
  }
}

export const updateUserProfile = async (userId: string, data: { name?: string; photoURL?: string }): Promise<void> => {
  try {
    await updateDoc(doc(db, USERS_COLLECTION, userId), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, USERS_COLLECTION);
    throw error;
  }
}

