import { initializeApp } from 'firebase/app';
import 'firebase/auth';
import { GoogleAuthProvider, fetchSignInMethodsForEmail, getAuth, sendPasswordResetEmail as sendResetEmail,signInWithPopup, signInWithRedirect } from 'firebase/auth';

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
        console.log('googleLogin');
        const provider = new GoogleAuthProvider();
        const result = await signInWithPopup(auth, provider);
        
        // Пользователь успешно вошел в систему
        console.log('User logged in:', result.user);
        return result.user; // Вернуть пользователя
    } catch (error) {
        console.error("Google login error: ", error);
        throw error; // Перебрасываем ошибку
    }
}

export async function logout() {
    try {
        await auth.signOut();
    } catch (error) {
        throw error;
    }
}

//fetchSignInMethodsForEmail

export async function fetchSignInMethodsForEmailForUser(email: string) {
    try {
        const res = await fetchSignInMethodsForEmail(auth, email);
        console.log('res', res);
        return res;
    } catch (error) {
        throw error;
    }
}