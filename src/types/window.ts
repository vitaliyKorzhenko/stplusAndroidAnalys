export interface IWindow {
    description: string;
    label: string;
    nodename: string;
}

export interface IWindowItem {
    defaultValue?: number | string;
    description: string;
    label: string;
    nodename: string;
    multi: boolean;
    required: boolean;
    constsubstitute? : boolean | undefined;
}