import { UIData } from "./analys";
import { NodenameOptionEnum, NodenameVariableEnum } from "./commandModel";
import { ICommandVariableUi } from "./сommandUI";


export const HeaderSelectorId = 100;

export interface InputModelData {
    commandId: number;
    groupId: number;
  
    commandLabel: string;
  
    headersRow: number;  
    Vars: InputModelVariable[];
    AdvOpts: InputModelOptions[];
}

export interface InputModelVariable {
  ValueReference: any;
  
  required?: boolean;
  text: boolean;
  varlabel: string;
  multi: boolean;
  nodename: string;
  mincols?: number;
  minrows?: number;  
  constsubstitute?: boolean;  
}

export interface InputModelOptions {
  Value: string;
  Type: NodenameOptionEnum;

  // Should be removed before request
  optionIndex?: number;
} 


export type InputDialogEventAddRange = (id: number, forVariableUi: ICommandVariableUi) => void;
  
function sortByOptionIndex(arr: any[]) {
    arr.sort((a, b) => (a.optionIndex > b.optionIndex ? 1 : -1));
}


// Create data object using data from ui (input dialog) selection
export function prepareUiModelData(uiData: UIData): InputModelData {
    const resultOptions: InputModelOptions[] = [];
    const resultVariables: InputModelVariable[] = [];

    // Unfold options (grouped by tabs) and convert to {"Value": value, Type: "nodenametype"} format
    if (uiData.options) {
      uiData.options.forEach((opttab) => {
        if (opttab.data && opttab.data.length > 0) {
          opttab.data.forEach((optionItem) => {
            resultOptions.push({
              Value: optionItem.currentValue.toString(),
              Type: optionItem.nodename,
              optionIndex: optionItem.id,
            });
          });
        }
      });

      // Sort by option.id (was: optionIndex)
      sortByOptionIndex(resultOptions);
      // Remove optionIndex, back-end relies on order in JSON
      resultOptions.forEach((element) => delete element.optionIndex);          
    }
  
    /*
      Variables / fields
    */
    if (uiData.variables && uiData.variables.length > 0) {
      uiData.variables.forEach((element) => {
       
        if (element.id != HeaderSelectorId) {  
          const resultCurrentValue = typeof element.currentValue !== 'undefined' && element.currentValue && Array.isArray(element.currentValue) && element.currentValue.length > 0 ? element.currentValue.map(a => a.key) : [];
          resultVariables.push({
              ValueReference: (element.nodename == NodenameVariableEnum.VarRange || element.nodename == NodenameVariableEnum.VarRangeText) ? resultCurrentValue: [element.currentValue],
              mincols: element.mincols,
              minrows: element.minrows,
              required: !!element.required,
              text: element.nodename == NodenameVariableEnum.VarRangeText,
              varlabel: element.label,
              multi: element.multi,
              constsubstitute: !!element.constsubstitute,
              nodename: element.nodename,
            });
          
        }
      });
    }
    const result: InputModelData = {
      commandId: uiData.commandId,
      groupId: uiData.groupId,
  
      commandLabel: uiData.commandLabel,
      headersRow: uiData.headersRow,
  
      Vars: resultVariables,
      AdvOpts: resultOptions
    };
    return result;
}