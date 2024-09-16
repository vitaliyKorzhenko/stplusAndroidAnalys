/*

    Types fof UI models for commands

*/

import { IAdditionalTabs } from "./additionalTabs";
import { ICommandVariable, NodenameVariableUiType, ICommandOptionWithTabActionData } from "./commandModel";

export interface IUIWindowData {
    options: ICommandOptionTabUi[];
    variables: ICommandVariableUi[];
    additionalTabs: IAdditionalTabs[];
    version: number;
    dataInputWindowID: number;
    commandSubscription: string;
    label: string;
}

// Input field (picker) item type
export interface ICommandVariableRangeStruct {
    key: string;
    text: string;
}

export interface ICommandVariableUiProps {
    // Redefined
    nodename: NodenameVariableUiType;

    // Controller value
    currentValue: any;
    currentTextValue: string | null;
    
    /* Ranges from another sheet (or external workbook on desktop)
       to be used for dropdown prediction
       RENAME: externalRanges
    */
    additionalValues: ICommandVariableRangeStruct[];

    // Index of the field (first is 0)
    id: number;

    // TODO: check where it is used
    hidden: boolean;    
}

export interface ICommandVariableUi extends Omit<ICommandVariable, 'nodename'>, ICommandVariableUiProps {}

export interface ICommandOptionUiProps {
    id: number;
    // label: string;

    currentValue: any;
}

export interface ICommandOptionUi extends ICommandOptionWithTabActionData, ICommandOptionUiProps {}
  
export interface ICommandOptionTabUi {
    // Tab name
    name: string;
    // Tab index (zero based)
    key: number;
    // Options under the tab
    data: ICommandOptionUi[];
}

export interface MakesEnabledDisabledStruct {
    parendId: number;
    parentValue: any;
    child: number[];
  }
  