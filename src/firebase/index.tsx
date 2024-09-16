import { initializeApp } from 'firebase/app';
import 'firebase/auth';
import { GoogleAuthProvider, getAuth, sendPasswordResetEmail as sendResetEmail,signInWithPopup } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyC6aCAwXL8AwkdrUgsigbCmI1x0XSs5s6A",
    authDomain: "fluentv2statplus.firebaseapp.com",
    projectId: "fluentv2statplus",
    storageBucket: "fluentv2statplus.appspot.com",
    messagingSenderId: "475922149007",
    appId: "1:475922149007:web:e04c14d4b6113916820afa",
    measurementId: "G-JTDJM8FNDM"
  };

const app = initializeApp(firebaseConfig);


export const auth = getAuth(app);

export async function sendPasswordResetEmail(email: string) {
    try {
        await sendResetEmail(auth, email);
        // Optionally, you can show a success message to the user
    } catch (error: any) {
        // Handle the error appropriately, e.g., show an error message to the user
        if (error && error.code === 'auth/user-not-found') {
            // Show an error message to the user indicating that the email address is not registered
        } else {
            // Show a generic error message to the user
        }
    }
}

export async function googleLogin() {
    try {
      const res = await signInWithPopup(auth, new GoogleAuthProvider());
      return res.user;
    } catch (error) {
      throw error;
    }
}

export async function logout() {
    try {
        await auth.signOut();
    } catch (error) {
        throw error;
    }
}