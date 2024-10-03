// /*

// */

// import { errorHandler } from '.';
// import { addLog } from "../logs";

// /*

//   LEGACY CODE FROM IPAD APP

//   Synchronous helper functions for dataInputGetVarFieldsExcel()

// */

// function maxColForAnalysis() {
//     return 65536;
//   }
  
//   function maxRowForAnalysis() {
//     return 65536;
//   }
  
//   /* should we pass missing values as NaN? */
//   function getWriteNan(data) {
//     var writeNanValue = typeof data.window == "object" ? data.window.writenan : false;
//     if (typeof writeNanValue !== "boolean") writeNanValue = false;
//     return writeNanValue;
//   }
  
//   function isNumber(num) {
//     return !isNaN(num);
//   }
  
//   function stringToRange(rangeText /*, sheet*/) {
//     var rowStr = rangeText.replace(/\D+/g, "");
//     var colStr = rangeText.replace(rowStr, "");
//     var row = Number(rowStr) - 1;
//     var col = 0;
//     var multiplier = 1;
//     for (var i = colStr.length - 1; i >= 0; i--) {
//       col += (colStr.charCodeAt(0) - 64) * multiplier;
//       multiplier *= 26;
//     }
//     col -= 1;
//     return {
//       col: col,
//       row: row
//     };
// }  

// function errorMsgMinRowsNew(minRows, inputVar, rangeRef) {
//     return (
//       'Range: "' +
//       rangeRef +
//       '".\nInvalid number of cases. Please select a range with at least ' +
//       minRows +
//       ' valid cases (rows) for the "' +
//       inputVar.varlabel.replace("\r", "").replace("\n", "") +
//       '".'
//     );
//   }
  
//   /*
//     Trim quotes. Used to clean sheet name from range reference (address)
//   */
//   function stripquotes(a) {
//     var r = a;
//     // Code for single quote is 39
//     if (a.charCodeAt(0) == 39 && a.charCodeAt(a.length-1) == 39) {
//         a = a.substr(1, a.length-2);
//     }
//     return a.replace("''","'");
//   }
  
//   export interface SpreadDataInputVariablesResponse {
//     result: boolean,
//     data: SpreadInputData[],
//     msg: any,
//     invalidrange:any
//   }
  
//   interface SpreadInputDataColumn {
//     // Data header
//     Label: string,
//     // Data array - string[] or number[]
//     Cells: any[]
//   }
  
//   export interface SpreadInputData {
//     // Excel-like reference to all input ranges (or an input range, if multi==false)
//     ValueReference: string,
//     // Name of input field
//     varlabel: string,
//     // Data
//     Cols: SpreadInputDataColumn[],
//     // Text variable (true) or Numeric (false)? Defines type of Cols[].Cells[]
//     text: boolean,
//     // Multiple columns selections allowed?
//     multi: boolean,
//     // Is this variable required or optional?
//     required: boolean,
//     // Min number or columns, only for "VarRange" or "VarRangeText" and multi==true. Default: 1.
//     mincols?: number,
//     // Min number or rows, only for "VarRange" or "VarRangeText". Default: 2.  
//     minrows?: number,
//     // Can we substitute VarRange data array (Cols[]) with a single value (const)? 
//     // If true and there is a single value, it is saved to ValueReference property and Cols[] = []
//     constsubstitute?: boolean,
//     // nodename (input field type)
//     nodename: string,
//   }
  
//   /* Get cell values for each variable (input field on the Variables tab) */
//   export const fillDataFromSpreadExcel = async (inputWindowData) : Promise<SpreadDataInputVariablesResponse> => {
  
//     // Template for error response
//     var response : SpreadDataInputVariablesResponse= {
//       result: false,
//       data: [],
//       msg: "",
//       invalidrange : null      
//     };
  
//     await Excel.run(async context => {
//       let inputFieldsData : SpreadInputData[] = [];
      
//       /* Command parameters */
      
//       // writeNan: Skip empty values or pass as NaN?
//       const writeNan = getWriteNan(inputWindowData);

//       // firstRowIdx: Zero-based index of first row with data in a referencesd range
//       // No headers = 0 (only data), first row = 1 (first row contains heades)
//       const firstRowIdx = inputWindowData.headersRow;

//       // Number of input field
//       const varsNum = inputWindowData.Vars.length;
      
//       // Info on a range that makes selection invalid
//       let firstInvalidCell = null;
  
//       // Main loop for each input field
//       for (var i = 0; i < varsNum; i++) {
//         var inputVar = inputWindowData.Vars[i];
//         // Process i-th input field
//         if (
//           inputVar &&
//           typeof inputVar.nodename != "undefined" &&
//           (inputVar.nodename.startsWith("VarRange") || inputVar.nodename == "Cell")
//         ) {
//           /* Input field info */
//           // Name
//           const varLabel = inputVar.varlabel;
//           // Name without breaks
//           const inputVarCleanName = varLabel.replace("\r", "").replace("\n", "");
  
//           // Input field type - <Cell>, <VarRange>, <VarRangeText>
//           const inputFieldType = inputVar.nodename;
//           // References to data - string with one or multiple Excel range references (like Sheet1!A1:B10)
//           let refs = inputVar.ValueReference;
  
//           // References delimiter
//           // TODO: check on international Excel - Germany, Russia???
//           // ----------------------------------------------->
//           let refsAsText = inputVar.ValueReference.join(",");
  
//           // Input field attributes: bool required, int mincols (>= 1), int minrows (>= 1), label (varLabel)
//           var isRequired = inputVar.required; // == "true";
//           var minCols = inputVar.mincols;
//           if (!minCols) minCols = 1;
//           var minRows = inputVar.minrows;
//           if (!minRows) minRows = 2;
  
//           /*  If input field is non-empty – contains some reference */
//           if (refsAsText.replace(/\s/g, "") != "") {
//             var numericRange = !inputVar.text;
//             var isValid = true;
//             var isMulti = inputVar.multi;
//             var constSubstitute = inputVar.constsubstitute; //  == "true";
//             /* Handle <Cell> or VarRange* with constSubstitute = true (text instead of VarRange) */
//             try {
//               if (inputFieldType == "Cell" || (constSubstitute && isNumber(refsAsText))) {
//                 inputFieldsData.push({
//                   nodename: inputFieldType,
//                   ValueReference: refsAsText.replace(",", "."),
//                   varlabel: varLabel,
//                   Cols: [],
//                   text: false,
//                   multi: false,
//                   required: isRequired
//                 });
//                 continue;
//               }
//             } catch (error) {
//               // TODO: console log
            
//               addLog('error','input.ts dataInputGetVarFieldsExcel', error);
//               response.msg = error;
//               return;
//             }
  
//             /* Else: VarRange/VarRangeText - prepare matrix */
  
//             inputFieldsData.push({
//               nodename: inputFieldType,
//               ValueReference: refsAsText,
//               varlabel: varLabel,
//               text: !numericRange,
//               multi: isMulti,
//               mincols: minCols,
//               minrows: minRows,
//               constsubstitute: constSubstitute,
//               required: isRequired,
//               Cols: []
//             });
//             var groupsIndex = 0;
//             var curentColCount = 0;
//             /* Read data from spread */
//             for (let j = 0; j < refs.length; j++) {
//               let refValue = refs[j]; //"Sheet1!A1:A10";
//               if (refValue != "" && curentColCount < maxColForAnalysis()) {
//                 /*
//                    TODO: pass references as object or array [sheet: "Sheet1", range: "A1:B10"]
//                 */
//                 //  Parse reference 
//                 let refValueSplit = refValue.split("!");
//                 let sheetName = stripquotes(refValueSplit[0].trim());
//                 let selectionRefPart = refValueSplit[1].trim();
//                 /*
//                     Get range manually - current Excel API does not allow to get a sheet+range from reference Sheet1!A:B
//                   was:
//                   let rangeFromRef = context.workbook.worksheets.getActiveWorksheet().getRange(refValue);
//                   var sheetxl = rangeFromRef.worksheet;
//                 */
//                 var sheetxl = context.workbook.worksheets.getItem(sheetName);              
//                 var rangexl = sheetxl.getUsedRange(true).getIntersectionOrNullObject(selectionRefPart);
//                 await context.sync();
//                 if (rangexl.isNullObject) {
//                   addLog('error','input.ts dataInputGetVarFieldsExcel Range', 'Range: '+refValue + ' is empty.');
//                     continue;
//                 }
//                 // Read data by column
//                 rangexl.load(["columnCount"]);
//                 await context.sync();
//                 // No columns? How dare Excel!
//                 if (rangexl.columnCount < 1)
//                     continue;
//                 // Load addresses, values and row count into proxy for each column
//                 let selectedCols = [];
//                 for (let i = 0; i < rangexl.columnCount; i++) {
//                   let coli = rangexl.getColumn(i);
//                   coli.load(["address", "values", "rowCount"]);
//                   selectedCols.push(coli);
//                 }
//                 await context.sync();
//                 // Get a columns with min rows
//                 let minRowsCount : number = null;
                
//                 selectedCols[0].rowCount;
//                 for (let k = 0; k < selectedCols.length; k++) {
//                   if (!minRowsCount || (selectedCols[k].rowCount < minRowsCount))
//                     minRowsCount = selectedCols[k].rowCount;
//                   // Current range satisfies minRows constrain?
//                   if (minRowsCount < minRows) {
//                     response.msg = errorMsgMinRowsNew(minRows, inputVar, selectedCols[k].address);
//                     return;
//                   }                
//                 }
  
//                 // WAS: sheet.isPaintSuspended(true); do we need this?
  
//                 for (let k = 0; k < selectedCols.length; k++) {
//                   var validRowCount = 0;
//                   var label;
//                   if (firstRowIdx > 0) {
//                     label = selectedCols[k].values[firstRowIdx - 1][0];
//                   } else {
//                     // "VAR_" +
//                     label = selectedCols[k].address; //refValue;
//                     //varIndex++;
//                   }
//                   groupsIndex++;
  
//                   var newArr = []; //ADD
//                   // read cells and stop if invalid
//                   for (let m = firstRowIdx; m < minRowsCount; m++) {
//                     var cellvalue = selectedCols[k].values[m][0];
//                     if (cellvalue === null || ("" + cellvalue).replace(/\s/g, "") == "") {
//                       if (writeNan)
//                           newArr.push(null);
//                       continue;
//                     }
//                     if (numericRange) {
//                       var strval = Number(cellvalue).toString();
//                       isValid = strval != "NaN";
//                       if (!isValid && !firstInvalidCell) {
//                         /* first invalid cell */
//                         let badCell = selectedCols[k].getCell(m, 0);
//                         badCell.load("address");
//                         await context.sync();
//                         firstInvalidCell = {
//                           address: refValue,
//                           cell: badCell.address, //GetCellRangeSheetA1(sheetName, rangerFirstCol + k, rangeFirstRow + m),
//                           value: strval,
//                           sheet: sheetName,
//                           row: m,
//                           col: k
//                         };
//                       }
//                       if (isValid) {
//                         newArr.push(cellvalue);
//                         validRowCount++;
//                       } else if (writeNan) {
//                         newArr.push(null);
//                       } else
//                         continue;
//                     } else {
//                       validRowCount++;
//                       newArr.push(cellvalue);
//                     }
//                   }
//                   if (validRowCount < minRows)
//                       break;
//                   if (inputFieldsData[i]) {
//                     inputFieldsData[i].Cols.push({
//                       Label: label,
//                       Cells: newArr
//                     });
//                     curentColCount++;
//                   }
//                 }
  
//                 //sheet.isPaintSuspended(false);
//                 if (validRowCount < minRows) {
//                   response.msg = errorMsgMinRowsNew(minRows, inputVar, refValue);
//                   response.invalidrange = firstInvalidCell;
//                   return;
//                 }
//               } // if (refValue != '' && curentColCount < maxColForAnalysis()) {
//             } // for (let j = 0; j < refs.length; j++) {
  
//             // Current field (all ranges) satisfies minCols constrain?
//             if (curentColCount < minCols) {
//               response.msg = "Please select at least " +
//               minCols.toString() +
//               " columns and at least " +
//               minRows.toString() +
//               ' rows for the "' +
//               inputVarCleanName +
//               '" field';
//               return;
//             }
//           } else {
//             /* input field is empty */
//             inputFieldsData.push({
//               nodename: inputFieldType,
//               ValueReference: '', //refsAsText.replace(".", ","),
//               varlabel: varLabel,
//               Cols: [],
//               text: false,
//               required: isRequired,
//               multi: false,
//               mincols: null,
//               minrows: null
//             });
//           }
//         } // if (inputVar && (typeof inputVar.nodename != 'undefined') && (inputVar.nodename.startsWith('VarRange') || inputVar.nodename == 'Cell')) {
//         else break;
//       }
  
//       response = {
//         result: true,
//         data: inputFieldsData,
//         msg: null,
//         invalidrange : null      
//       };
//     })
//     .catch(errorHandler);
//     return response;
//   };