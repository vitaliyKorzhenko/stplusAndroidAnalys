/*
   Spread interaction functions.

*/
/// <reference path="../SpreadComponent/gcspread.sheets.d.ts" />


// Spread functions for data input.
export const getSpreadsheets = (spread: GcSpread.Sheets.Spread) => {
    const sheets = spread.sheets;
    var arr = [];
    for (var i = 0; i < sheets.length; i++) {
        arr.push([sheets[i]._name]);
    }
    const sheetName = spread.getActiveSheet()._name;
    const workbookName = "";
    const arr1 = [arr, workbookName, sheetName];
    return arr1;
}
/*
  Returns data headers aka first row values in active sheet
*/

export interface ColumnsInfo {
  key: string;
  text: string;
}

export function getColumnName(columnNumber) {
    let dividend = columnNumber;
    let columnName = "";
    let modulo;
    while (dividend > 0) {
      modulo = (dividend - 1) % 26;
      columnName = String.fromCharCode(65 + modulo) + columnName;
      dividend = Math.floor((dividend - modulo) / 26);
    }
    return columnName;
}

/* A1 is (1,1) */
export function GetCellRangeSheetA1(sheetname, col,row) {
    return sheetname + "!" + getColumnName(col + 1) + (row + 1).toString();
}

export const getVariables = (spread: GcSpread.Sheets.Spread) : ColumnsInfo[] => {
    const separatorSheet = '!';
    const activeSheet = spread.getActiveSheet()._name;
    const sheet = spread.getSheetFromName(activeSheet);
    const rowIndex = 0;
    const lastDirtyCellIndex = sheet.getColumnCount() - 1;
    const arr = [];

    for (var i = 0; i <= lastDirtyCellIndex; i++) {
        const value = sheet.getValue(rowIndex, i);
        //for fix dropdown
        if (value) {
            const colXLA = getColumnName(i + 1);
            const colKey = activeSheet + separatorSheet + colXLA + ':' + colXLA;
            arr.push({
                key: colKey,
                text: sheet.getValue(rowIndex, i),
            });
        }
    }
    return arr;  
};

export function setActiveSheetExport(spread: GcSpread.Sheets.Spread, name: string) {
    spread.setActiveSheet(name);
}

export function getActiveSheetName(spread: GcSpread.Sheets.Spread) {
    return spread.getActiveSheet()._name;
}

// /*
//   Used to highlight a range with incorrect data.
//   Not implemented for Excel JS API yet.
//   (TODO)
// */
// let highlightNonnumericalCell = async (crow, ccol, sheet) => {
//   return "";
// };

// /*
//   Returns number of rows in sheet: sheetName
// */
// let sheetGetRowCount = async sheetName => {
//   return true;
//   // var rowCount = 0;
//   // await Excel.run(async context => {
//   //   var sheet = context.workbook.worksheets.getItem(sheetName);
//   //   var range = sheet.getUsedRange(true);
//   //   range.load("rowCount");
//   //   await context.sync();
//   //   rowCount = range.rowCount;
//   // });
//   // return rowCount;
// };

// /*
//   Check if workbook is readonly
// */
// export async function isWorkbookReadOnly() {
//   return true;
//   // let readOnly = false;
//   // await Excel.run(async context => {
//   //   const wb = context.workbook;
//   //   wb.load("readOnly");
//   //   await context.sync();
//   //   readOnly = wb.readOnly;
//   // });
//   // return readOnly;
// }

// /*
//   Returns name of current workbook
// */
// export async function getActiveWorkbookName(): Promise<string>{
//   return '';
//   // let name = '';
//   // try {
//   //   await Excel.run(async context => {
//   //     const wb = context.workbook;
//   //     wb.load('name');
//   //     await context.sync(); 
//   //     name = wb.name;
//   //   }).catch();
//   // }
//   // catch {
//   //   //
//   // }
//   // return name;
// } 

// /*
//   Selects active worksheet
// */
// export async function setActiveWorksheet(sheetName: string){
//   return true;
//   // await Excel.run(async context => {
//   //   const worksheet = context.workbook.worksheets.getItem(sheetName);
//   //   worksheet.activate();
//   //   await context.sync(); 
//   // });
// } 


// /*
//   Selects range by reference
// */
// export async function selectRange(rangeRef: string) {
//   return true;
//   // try {
    
//   //   await Excel.run(async context => {
//   //     const sheet = context.workbook.worksheets.getActiveWorksheet();
//   //     const range = sheet.getRange(rangeRef);
//   //     range.select();
//   //     await context.sync(); 
//   //   });
//   //   return true;
//   // }
//   // catch
//   // {
//   //   return false;
//   // }
// }

// /*
//   Deselects range by reference
// */
// export async function deselectRanges() {
//   return true;
//   // try {
//   //   await Excel.run(async context => {
//   //     const range = context.workbook.getSelectedRange()
//   //     range.getCell(0,0).select();
//   //     await context.sync(); 
//   //   }).catch();
//   // } catch {
//   //   //
//   // }
// }