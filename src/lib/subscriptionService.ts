import { db, OperationType, handleFirestoreError } from "./firebase";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export interface SubscriptionStatus {
  status: "free" | "active" | "expired";
  planName: string;
  subscribedApps: string[];
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  customerEmail: string;
  appSource: string;
}

// The 5 initial application variants + any custom remixed apps
export const CONNECTED_APPS = [
  "InfoPerso Master (Cette application)",
  "Vos Remixes d'Applications (Illimité)",
];

const DEFAULT_FREE_STATUS = (email: string = ""): SubscriptionStatus => ({
  status: "free",
  planName: "Forfait Découverte",
  subscribedApps: CONNECTED_APPS,
  expiresAt: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  customerEmail: email,
  appSource: "System"
});

/**
 * Fetch the current subscription status from Firestore.
 */
export async function getSubscription(uid: string): Promise<SubscriptionStatus | null> {
  const path = `subscriptions/${uid}`;
  try {
    const docRef = doc(db, "subscriptions", uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SubscriptionStatus;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
    return null;
  }
}

/**
 * Real-time listener for the user's subscription status.
 * This is perfect because if the subscription status is updated on APP 1,
 * APP 2-5 will instantly receive the state update in real-time if they are open!
 */
export function listenToSubscription(
  uid: string,
  onUpdate: (status: SubscriptionStatus) => void,
  userEmail: string = ""
): () => void {
  const docRef = doc(db, "subscriptions", uid);
  const path = `subscriptions/${uid}`;
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as SubscriptionStatus);
      } else {
        onUpdate(DEFAULT_FREE_STATUS(userEmail));
      }
    },
    (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

/**
 * Simulate subscribing/upgrading a user to a premium multi-app plan.
 */
export async function subscribeUser(
  uid: string,
  email: string,
  appSource: string,
  planName: string = "Premium Multi-App (10€/3mois puis 5€/mois) 👑",
  durationMonths: number = 3
): Promise<SubscriptionStatus> {
  const expires = new Date();
  expires.setMonth(expires.getMonth() + durationMonths);

  const subscriptionData: SubscriptionStatus = {
    status: "active",
    planName,
    subscribedApps: CONNECTED_APPS,
    expiresAt: expires.toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    customerEmail: email,
    appSource
  };

  const path = `subscriptions/${uid}`;
  try {
    const docRef = doc(db, "subscriptions", uid);
    await setDoc(docRef, subscriptionData);
    return subscriptionData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Simulate cancellation/expiry of the subscription for testing purposes.
 */
export async function simulateExpiry(uid: string, email: string): Promise<SubscriptionStatus> {
  const subscriptionData: SubscriptionStatus = {
    status: "expired",
    planName: "Abonnement Expire",
    subscribedApps: CONNECTED_APPS,
    expiresAt: new Date(Date.now() - 86400000).toISOString(), // expired yesterday
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    customerEmail: email,
    appSource: "Simulation"
  };

  const path = `subscriptions/${uid}`;
  try {
    const docRef = doc(db, "subscriptions", uid);
    await setDoc(docRef, subscriptionData);
    return subscriptionData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

/**
 * Reset/Delete subscription back to free.
 */
export async function resetToFree(uid: string, email: string): Promise<SubscriptionStatus> {
  const subscriptionData = DEFAULT_FREE_STATUS(email);
  const path = `subscriptions/${uid}`;
  try {
    const docRef = doc(db, "subscriptions", uid);
    await setDoc(docRef, subscriptionData);
    return subscriptionData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
    throw error;
  }
}

