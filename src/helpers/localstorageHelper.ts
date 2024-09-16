// class for localstorage helper

export class LocalStorageHelper {
  public static setItem(key: string, value: string) {
    localStorage
        .setItem(key, value);
    }

    public static getItem(key: string): string | null {
        return localStorage.getItem(key);
    }

    public static removeItem(key: string) {
        localStorage.removeItem(key);
    }

    public static clear() {
        localStorage.clear();
    }

    public static setItemObject(key: string, value: object) {
        localStorage
            .setItem(key, JSON.stringify(value));
    }

    public static getItemObject(key: string): object | null {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
        return null;
    }

    public static removeItemObject(key: string) {
        localStorage.removeItem(key);
    }

    public static setItemArray(key: string, value: any[]) {
        localStorage
            .setItem(key, JSON.stringify(value));
    }

    public static getItemArray(key: string): any[] | null {
        const item = localStorage.getItem(key);
        if (item) {
            return JSON.parse(item);
        }
        return null;
    }

    public static removeItemArray(key: string) {
        localStorage.removeItem(key);
    }

    public static setItemNumber(key: string, value: number) {
        localStorage
            .setItem(key, value.toString());
    }

    public static getItemNumber(key: string): number | null {
        const item = localStorage.getItem(key);
        if (item) {
            return Number(item);
        }
        return null;
    }

    public static removeItemNumber(key: string) {
        localStorage.removeItem(key);
    }

    public static setItemBoolean(key: string, value: boolean) {
        localStorage
            .setItem(key, value.toString());
    }

    public static getItemBoolean(key: string): boolean | null {
        const item = localStorage.getItem(key);
        if (item) {
            return item === 'true';
        }
        return null;
    }

    public static removeItemBoolean(key: string) {
        localStorage.removeItem(key);
    }

    public static setItemDate(key: string, value: Date) {
        localStorage
            .setItem(key, value.toISOString());
    }

    //get userId from localstorage
    public static getUserId(): string | null {
        return this.getItem('userId');
    }

    //set userId to localstorage
    public static setUserId(userId: string) {
        this.setItem('userId', userId);
    }

    //set current language to localstorage
    public static setCurrentLanguage(language: string) {
        this.setItem('currentLanguage', language);
    }

    //get current language from localstorage
    public static getCurrentLanguage(): string | null {
        return this.getItem('currentLanguage');
    }
}