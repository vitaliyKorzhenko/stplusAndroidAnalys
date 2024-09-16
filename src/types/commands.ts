import { Subscriptions } from ".";

export interface BasicCommand {
    id: number;
    title: string;
    description: string;
    language: string;
    isActive: boolean;
    groupId: string;
    commands: Command[];
}


export interface Command {
    id: number;
    title: string;
    description: string;
    visbilility: boolean;
    isenabled: boolean;
    commandIdOld: string;
    subscription: string
    window: string;
    advancedwindow: string;
}

//parse string subscription to enum

export function parseSubscription(subscription: string): Subscriptions {
    switch (subscription) {
        case "free":
            return Subscriptions.FREE;
        case "pro":
            return Subscriptions.PRO;
        case "prem":
            return Subscriptions.PREMIUM;
        default:
            throw new Error("Invalid subscription");
    }

}



