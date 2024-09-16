//create class user profile
// "firstName": "",
// "lastName": "",
// "email": "vitaliy5775@example.com",
// "phone": "",
// "country_code": "",
// "currentSubscription": "free",
// "currentSubscriptionPeriod": "",
// "currentSubscriptionExpDate": "",
// "currentSubscriptionCoupon": "",
// "stripeKey": "",
// "billingCurrency": "",
// "billingCountry": "",
// "theme": "light",
// "language": "en"
// "id": string;

import { LocalStorageHelper } from "../helpers/localstorageHelper";

export interface IUserProfile {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    country_code: string;
    currentSubscription: string;
    currentSubscriptionPeriod: string;
    currentSubscriptionExpDate: string;
    currentSubscriptionCoupon: string;
    stripeKey: string;
    billingCurrency: string;
    billingCountry: string;
    theme: string;
    language: string;
}

export class UserProfile {
    private static currentUserId = LocalStorageHelper.getUserId();

    private static userProfile: IUserProfile = {
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        country_code: "",
        currentSubscription: "",
        currentSubscriptionPeriod: "",
        currentSubscriptionExpDate: "",
        currentSubscriptionCoupon: "",
        stripeKey: "",
        billingCurrency: "",
        billingCountry: "",
        theme: "light",
        language: "en"
    };

    public static getCurrentUserId(): string| null {
        return this.currentUserId;
    }

    public static getCurrentUserIdNumber(): number | null {
        let numUserId = this.currentUserId ? parseInt(this.currentUserId) : null;
        return numUserId;
    }

    public static setCurrentUserId(userId: string) {
        this.currentUserId = userId;
    }

    //init user profile
    public static initUserProfile(userProfile: IUserProfile) {
        this.userProfile = userProfile;
    }

    public static getUserProfile(): IUserProfile {
        return this.userProfile;
    }

    public static getFirstName(): string {
        return this.userProfile.firstName;
    }

    public static setFirstName(firstName: string) {
        this.userProfile.firstName = firstName;
    }

    public static getLastName(): string {
        return this.userProfile.lastName;
    }

    public static setLastName(lastName: string) {
        this.userProfile.lastName = lastName;
    }

    public static getEmail(): string {
        return this.userProfile.email;
    }

    public static setEmail(email: string) {
        this.userProfile.email = email;
    }

    public static getPhone(): string {
        return this.userProfile.phone;
    }

    public static setPhone(phone: string) {
        this.userProfile.phone = phone;
    }

    public static getCountryCode(): string {
        return this.userProfile.country_code;
    }

    public static setCountryCode(countryCode: string) {
        this.userProfile.country_code = countryCode;
    }

    public static getCurrentSubscription(): string {
        return this.userProfile.currentSubscription;
    }

    public static setCurrentSubscription(currentSubscription: string) {
        this.userProfile.currentSubscription = currentSubscription;
    }

    public static getCurrentSubscriptionPeriod(): string {
        return this.userProfile.currentSubscriptionPeriod;
    }

    public static setCurrentSubscriptionPeriod(currentSubscriptionPeriod: string) {
        this.userProfile.currentSubscriptionPeriod = currentSubscriptionPeriod;
    }

    public static getCurrentSubscriptionExpDate(): string {
        return this.userProfile.currentSubscriptionExpDate;
    }

    public static setCurrentSubscriptionExpDate(currentSubscriptionExpDate: string) {
        this.userProfile.currentSubscriptionExpDate = currentSubscriptionExpDate;
    }

    public static getCurrentSubscriptionCoupon(): string {
        return this.userProfile.currentSubscriptionCoupon;
    }

    public static setCurrentSubscriptionCoupon(currentSubscriptionCoupon: string) {
        this.userProfile.currentSubscriptionCoupon = currentSubscriptionCoupon;
    }

    public static getStripeKey(): string {
        return this.userProfile.stripeKey;
    }

    public static setStripeKey(stripeKey: string) {
        this.userProfile.stripeKey = stripeKey;
    }

    public static getBillingCurrency(): string {
        return this.userProfile.billingCurrency;
    }

    public static setBillingCurrency(billingCurrency: string) {
        this.userProfile.billingCurrency = billingCurrency;
    }

    public static getBillingCountry(): string {
        return this.userProfile.billingCountry;
    }

    public static setBillingCountry(billingCountry: string) {
        this.userProfile.billingCountry = billingCountry;
    }

    public static getTheme(): string {
        return this.userProfile.theme;
    }

    public static setTheme(theme: string) {
        this.userProfile.theme = theme;
    }

}