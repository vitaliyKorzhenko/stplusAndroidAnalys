import { AppLogger } from "../logsApp";

export interface FireBaseConfig {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    measurementId: string;
}

export class FireBaseConfig {

    private static firebaseConfig = {
        apiKey: "AIzaSyAIsTMAj5DOspncvcVtWrnzzFmab7OLCrQ",
        authDomain: "statplusandroidtest.firebaseapp.com",
        projectId: "statplusandroidtest",
        storageBucket: "statplusandroidtest.appspot.com",
        messagingSenderId: "519612272022",
        appId: "1:519612272022:web:420c0b15badedd5ca3a1b7",
        measurementId: "G-3TSPM1MYNX"
    };


    public static getFirebaseConfig(): FireBaseConfig {
        return this.firebaseConfig;
    }

    public static setFirebaseConfig(firebaseConfig: FireBaseConfig) {
        this.firebaseConfig = firebaseConfig;
    }

    public static initFirebaseConfig(firebaseConfig: FireBaseConfig) {
        this.firebaseConfig = firebaseConfig;
        AppLogger.log("FireBaseConfig", "initFirebaseConfig");
    }
}