export interface IPreferencesOptions {
    nodename: string;
    value: string;
    name: string;
    select: string;
    returnname: string;
    min?: number;
    max?: number;
}

export interface IPreferencesSections {
    name: string;
    items: IPreferencesOptions[];
}

