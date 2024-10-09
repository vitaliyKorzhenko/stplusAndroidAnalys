import { SubscriptionEnum } from "./ISubscription";



export interface IApiResponseProfile {
    email: string,
    phone: string,
    firstName: string,
    lastName: string,
    // country_code: string;

    
    currentSubscription: SubscriptionEnum,
    currentSubscriptionPeriod: string,
    currentSubscriptionExpDate: string,
    currentSubscriptionCoupon?: string,
    
    stripeKey: string,

    billingMethod: string,
    billingCurrency: string,
    billingCountry: string
};