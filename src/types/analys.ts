import { ICommandOptionTabUi, ICommandVariableUi } from "./сommandUI";

export interface IAccountInfo {
    uid: string;
    token: string;
    firebaseToken: string;
}
  
export interface UIData {
    commandId: number,
    groupId: number,
    commandSubscription: string,
    commandLabel: string,      
  
    headersRow: number,
    variables: ICommandVariableUi[],
  
    options: ICommandOptionTabUi[],
}

export type RunAnalysisFunc = (dataui: UIData, prefs: any, hideInputCallback: VoidFunction, fromUi: boolean) => Promise<boolean>;