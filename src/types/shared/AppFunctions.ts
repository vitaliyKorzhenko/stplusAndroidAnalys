/*

    Types and functions used by app components.

*/
export interface OptionsOpenErrorDialog {
    extras?: JSX.Element;
    callbackOK?: VoidFunction;
}

export type AppFuncOpenErrorDialog = (message: string | React.ReactNode, title?: string, options?: OptionsOpenErrorDialog) => void;
export enum OpenErrorDialogType { DialogError, DialogInfo, DialogWarning};

export type AppFuncOpenWaitDialog = (title: string, message: string, offerToWait: boolean, url: string) => void;
