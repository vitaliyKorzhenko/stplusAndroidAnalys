/*

    Spread - data input procedures.

*/
/// <reference path="gcspread.sheets.d.ts" />

import { InputModelData } from "../../../../shared/datainput/uiInputData";
import { GetCellRangeSheetA1 } from "../SpreadApi";

// Namespace - (different in SpreadJS 8 / 9 / 10, so better to use a shortcut)
const spreadNS = GcSpread.Sheets;


var lastDataInputError= "";

/* should we pass missing values as NaN? */
function getWriteNan(data) {
    var writeNanValue = typeof data.window == "object"? data.window.writenan : false;
    if (typeof writeNanValue !== "boolean") writeNanValue = false;
    return writeNanValue;
}

function maxColForAnalysis() {
    return 65536;
}
function maxRowForAnalysis(){
    return 65536;
}

function isVarRangeType(fieldType) {
  return fieldType.startsWith('VarRange');
}

function hasNumber(str) {
    const regexp = /\d/;
    return regexp.test(str);
}

function stringToRange(rangeText: string, sheet) {
    const rowStr = rangeText.replace(/\D+/g, "");
    const colStr = rangeText.replace(rowStr, "");
    const row = Number(rowStr) - 1;
    let col = 0;
    let multiplier = 1
    for (let i = colStr.length - 1; i >= 0; i--) {
        col += (colStr.charCodeAt(0) - 64) * multiplier;
        multiplier *= 26;
    }
    col -= 1;
    return {
        "col": col,
        "row": row
    };
}

export function fillDataFromSpreadJS(inputWindowData: InputModelData, spread: GcSpread.Sheets.Spread) {
  // get values for input fields and options
  console.log('dataInputGetDataJson')
  const varFieldsJson = dataInput_getVarFieldsJsonNew(inputWindowData, spread);
  console.log('varFieldsJson',varFieldsJson)
  var dataOpts =
    typeof inputWindowData.AdvOpts !== 'undefined' &&
    inputWindowData.AdvOpts.length > 0
      ? inputWindowData.AdvOpts
      : [];
  if (!varFieldsJson.result) {
    lastDataInputError = varFieldsJson.msg;
    if (typeof varFieldsJson.invalidrange == 'object') {
      var ir = varFieldsJson.invalidrange;
      try {
        highlightNonnumericalCell(ir.row, ir.col, ir.sheet, spread);
      } catch (error) {}
    }
    return null;
  }
  lastDataInputError = '';
  var windowJSON = {Vars: varFieldsJson.data, AdvOpts: dataOpts};
  return windowJSON;
}

function errorMsgMinRowsNew(minRows, inputVar, rangeRef) {
    return (
      'Range: ' +
      rangeRef +
      '\n. Invalid number of cases. Please select a range with at least ' +
      minRows +
      ' valid cases (rows) for the ' +
      inputVar.varlabel.replace('\r', '').replace('\n', '') +
      '.'
    );
  }
  
  function isNumber(num) {
    return !isNaN(num);
  }
  
  /* json for each variables (input field */
  function dataInput_getVarFieldsJsonNew(inputWindowData, spread) {
    var jsonToSent = [];
      var writeNan = getWriteNan(inputWindowData);
      console.log('dataInput_getVarFieldsJsonNew', writeNan, inputWindowData)
    /* --> must be no headers = 0, first row = 1 */
    var firstRowIdx = inputWindowData.headersRow;
    var varsNum = inputWindowData.Vars.length;
    var invalidRange = null;
    for (var i = 0; i < varsNum; i++) {
      var inputVar = inputWindowData.Vars[i];
      console.log('inputVar['+i+']', inputVar)
      if (inputVar) {
        var inputFieldType = inputVar.nodename;
        var refs = inputVar.ValueReference;
        var refsAsText = inputVar.ValueReference.join(',');
        if (inputFieldType.startsWith('VarRange') || inputFieldType == 'Cell') {
        } else {
          console.log('Incorrect input field type.');
          /* TODO */
        }
        var isRequired = inputVar.required; // == "true";
        var minCols = inputVar.mincols;
        if (!minCols) minCols = 1;
        var minRows = inputVar.minrows;
        if (!minRows) minRows = 2;
        var varLabel = inputVar.varlabel;
        /*  if non empty */
        if (refsAsText.replace(/\s/g, '') != '') {
          var numericRange = !inputVar.text;
          var isValid = true;
          var isMulti = inputVar.multi;
          var constSubstitute = inputVar.constsubstitute; //  == "true";
          /* Cell or constSubstitute (text instead of VarRange) */
          //  var isNumberRef = isNumber(refsAsText);
          try {
            if (
              inputFieldType == 'Cell' ||
              (constSubstitute && isNumber(refsAsText))
            ) {
              jsonToSent.push({
                ValueReference: refsAsText.replace(',', '.'),
                varlabel: varLabel,
                Cols: [],
                text: false,
                multi: false,
                required: isRequired,
              });
              continue;
            }
          } catch (error) {
            console.log('---error ----');
            console.log(error);
          }
  
          /* Else: VarRange/VarRangeText - prepare matrix */
  
          jsonToSent.push({
            ValueReference: refsAsText,
            varlabel: varLabel,
            text: !numericRange,
            multi: isMulti,
            mincols: minCols,
            minrows: minRows,
            constsubstitute: constSubstitute,
            required: isRequired,
            Cols: [],
          });
          var groupsIndex = 0;
          var curentColCount = 0;
          /* Read data from spread */
          for (var j = 0; j < refs.length; j++) {
            var refValue = refs[j]; //"Sheet1!A1:A10";
            if (refValue != '' && curentColCount < maxColForAnalysis()) {
                var sheetSeparatorPos = refValue.lastIndexOf('!');
              var test1 = refValue.substring(0, sheetSeparatorPos);
              var sheet = spread.getSheetFromName(test1);
              var selection =  refValue.substring(sheetSeparatorPos + 1).split(':');
              var startRowIndex, finishRowIndex, startColIndex, finishColIndex;
              var varIndex = 1;
              if (
                selection[0].search(/[0-9]{1}/) == -1 &&
                selection[0] == selection[1]
              ) {
                startRowIndex = firstRowIdx;
                finishRowIndex = Math.min(
                  sheet.getRowCount(),
                  maxRowForAnalysis()
                );
                startColIndex = finishColIndex = stringToRange(
                  selection[0] + '1',
                  sheet
                ).col;
                curentColCount++;
              } else {
                var startCell = stringToRange(selection[0], sheet);
                var finishCell = stringToRange(selection[1], sheet);
                var remainingColCount = maxColForAnalysis() - curentColCount;
                startRowIndex = startCell.row + firstRowIdx;
                startColIndex = startCell.col;
                finishRowIndex = Math.min(
                  finishCell.row,
                  maxRowForAnalysis() + startRowIndex
                );
                finishColIndex = Math.min(
                  finishCell.col,
                  remainingColCount + startColIndex
                );
                curentColCount += finishColIndex - startColIndex + 1;
                //console.log(startColIndex);console.log(finishColIndex);console.log(startRowIndex);console.log(finishRowIndex);
                if (finishRowIndex - startRowIndex + 1 < minRows) {
                  return {
                    result: false,
                    msg: errorMsgMinRowsNew(minRows, inputVar, refValue),
                  };
                }
              }
              sheet.isPaintSuspended(true);
              for (
                var k = startColIndex, arrI = 0;
                k <= finishColIndex;
                k++, arrI++
              ) {
                var validRowCount = 0;
                var label;
                if (firstRowIdx > 0) {
                  label = sheet.getValue(startRowIndex - 1, k);
                } else {
                  // "VAR_" +
                  label = refValue;
                  varIndex++;
                }
                groupsIndex++;
  
                var newArr = []; //ADD
                // read cells and stop if invalid
                for (var m = startRowIndex; m <= finishRowIndex; m++) {
                  var cellvalue = sheet.getValue(m, k);
                  // TODO: test with string data
                  if (
                    cellvalue === null ||
                    ('' + cellvalue).replace(/\s/g, '') == ''
                  ) {
                    if (writeNan) newArr.push(null);
                    continue;
                  }
                  if (numericRange) {
                    var strval = Number(cellvalue).toString();
                    isValid = strval != 'NaN';
                    if (!isValid && !invalidRange) {
                      /* first invalid cell */
                      invalidRange = {
                        address: refValue,
                        cell: GetCellRangeSheetA1(sheet.getName(), k, m),
                        value: strval,
                        sheet: sheet,
                        row: m,
                        col: k,
                      };
                    }
                    if (isValid) {
                      newArr.push(cellvalue);
                      validRowCount++;
                    } else if (writeNan) newArr.push(null);
                    else continue;
                  } else {
                    validRowCount++;
                    newArr.push(cellvalue);
                  }
                }
                if (validRowCount < minRows) break;
                if (jsonToSent[i])
                  jsonToSent[i].Cols.push({
                    Label: label,
                    Cells: newArr,
                  });
              }
              sheet.isPaintSuspended(false);
              if (validRowCount < minRows)
                return {
                  result: false,
                  msg: errorMsgMinRowsNew(minRows, inputVar, refValue),
                  invalidrange: invalidRange,
                };
            }
          }
          if (curentColCount < minCols) {
            return {
              result: false,
              msg:
                'Invalid number of variables. Please select at least ' +
                minCols.toString() +
                ' columns with at least' +
                minRows.toString() +
                'rows for the ' +
                inputVar.varlabel.replace('\r', '').replace('\n', '') +
                ' field',
            };
          }
        } else {
          /* input field is empty */
          jsonToSent.push({
            ValueReference: refsAsText.replace('.', ','),
            Cols: [],
            text: false,
            required: isRequired,
            multi: false,
          });
        }
      } else break;
    }
  console.log('jsonToSent', jsonToSent)
    return {
        result: true,
        data: jsonToSent,
      };
}

// Highlight non-numeric cell
// TODO: hightlight range?
function highlightNonnumericalCell(crow, ccol, sheet: GcSpread.Sheets.Sheet, spread: GcSpread.Sheets.Spread) {
  if (!sheet) return;
  const validator = spreadNS.DefaultDataValidator.createNumberValidator(spreadNS.ComparisonOperator.Between, Number.NEGATIVE_INFINITY, Number.POSITIVE_INFINITY, false);
  validator.ignoreBlank = false;
  sheet.setDataValidator(crow, ccol, validator)
  sheet.showCell(crow, ccol, spreadNS.VerticalPosition.top, spreadNS.HorizontalPosition.left)
  spread.highlightInvalidData(true);
  // Remove validator
  setTimeout(() => {
    sheet.setDataValidator(crow, ccol, null);
    spread.highlightInvalidData(false);
  }, 3000);
}