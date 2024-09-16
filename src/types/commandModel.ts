/*

    JSON model of a command variable.

    See C# code for VarRange (<VarRangeText>), VarRangeText (<VarRangeText>), WindowCell (<Cell>).

*/

export enum NodenameVariableEnum {
    Cell = 'Cell',
    VarRange = 'VarRange',
    VarRangeText = 'VarRangeText',
}

export enum NodenameVariableUiEnum {
    HeaderSelector = 'HeaderSelector',
}


export type NodenameVariableUiType = NodenameVariableEnum | NodenameVariableUiEnum;

export enum NodenameOptionEnum {
    numberint = 'numberint',
    number = 'number',
    checkbox = 'checkbox',
    string = 'string',
    list = 'list'
}

export interface ICommandData {
    id: number;
    groupId: number;
    isenabled: boolean;
    label: string;
    subscription: string;
    version: string | number;
    visibility: boolean;
    advancedwindow: ICommandOptionsWindow;
    window: ICommandVariablesWindow;
    description: string;
}

interface ICommandVariablesWindow {
    label: string;
    nodename: string; /* "window" */
    items: ICommandVariable[];
    description: string;
}

export interface ICommandVariable {

    nodename: NodenameVariableEnum;
      
    // human readable field name 
    label: string;
    // field name for small devices or logs
    labelshort?: string;
    
    // field description
    description?: string;
    
    // required field
    required: boolean;
  
    // for <VarRange/VarRangeText> - allow multiple ranges/columns
    multi: boolean;

    // default: false, optional in input JSON
    constsubstitute?: boolean;
  
    // <Cell> default value
    // Note: we may use it in <VarRange/VarRangeText> with constsubstitute == true,
    // but we don't use it at the momemt
    defvalue?: string;
  
    // <VarRange/VarRangeText> minimum number of rows in the input matrix
    // default: 2, optional in input JSON
    minrows?: number;
    // <VarRange/VarRangeText> + multi: minimum number of columns in the input matrix
    // default: 1, optional in input JSON
    mincols?: number;  
}

/*
    Indicated if an option is controlled by (closest) parent-option
    that have lower value of the `indent` 
*/
export enum OptionActionEnabledEnum {
    Parent = "parent",
    ParentFalse = "parent-false"
};

export interface ICommandOptionItem {
    nodename: NodenameOptionEnum;
    
    name: string;
    nameshort?: string;

    /* Tab */
    tab?: string;
    tabshort?: string;
    /*
        Default value
            string for <list> (ALL OPTIONS),
            number for <number>, <numberint>
            boolean for <boolean>
    */
    value?: string | number | boolean;
    /* <list> for small screen */
    valueshort?: string;
    valueex?: number;

    /* UI - Indent from left  – 0 (no indent), 1, 2, ... */
    indent?: number;
    "action-enabled"?: OptionActionEnabledEnum;    

    // string list of platform where the option should be hidden (Numbers)
    platformdisabled?: string;
}


/*
    ICommandOptionTabActionData extends ICommandOptionItem
    ?? with @optionIndex (preserved source-data index)
    and @makesEnabled and @makesDisabled arrays that contain
    indices of the target-options controlled by the option
    (when "action-enabled" is defined).

*/
export interface ICommandOptionTabActionData {
    // option index (1-based: first one is 1) in source array (flat array):
    // ` data.advancedwindow.items[i].optionIndex = i + 1; `
    // optionIndex: number;
    
    // List of options that must be enabled/disabled when this option is toggled
    makesEnabled?: number[];
    makesDisabled?: number[];
}

export interface ICommandOptionWithTabActionData extends ICommandOptionItem, ICommandOptionTabActionData {}


interface ICommandOptionsWindow {
    label: string;
    nodename: string; /* "advancedwindow" */
    items: ICommandOptionWithTabActionData[];
}