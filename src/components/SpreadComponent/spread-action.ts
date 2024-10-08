/*
    Implements toolbar actions for selection.

*/
/// <reference path="gcspread.sheets.d.ts" />

import { RefObject } from 'react';
import { translate } from '../../../../shared/localization/localization';
import { matchFontSizeToPt, parseFontString, spreadDefFont, spreadDefFontSize } from './spread-font';

import { SpreadToolbarFormat } from './toolbar'
import { ISpreadSelectionFormat } from './types-format';

// Namespace - (different in SpreadJS 8 / 9 / 10, so better to use a shortcut)
const spreadNS = GcSpread.Sheets;

export type SpreadActionFunc = (id: string, value?: any) => void;


export function getActualCellRange(cellRange: GcSpread.Sheets.Range, rowCount: number, columnCount: number): GcSpread.Sheets.Range {
    if (typeof cellRange !== "undefined")
    if (cellRange.row == -1 && cellRange.col == -1) {
        return new spreadNS.Range(0, 0, rowCount, columnCount);
    }
    else if (cellRange.row == -1) {
        return new spreadNS.Range(0, cellRange.col, rowCount, cellRange.colCount);
    }
    else if (cellRange.col == -1) {
        return new spreadNS.Range(cellRange.row, 0, cellRange.rowCount, columnCount);
    }
    return cellRange;
}

function xor(a: boolean,b: boolean): boolean { return !a != !b;}

export class SpreadActions{

    // Main spreadsheet
    public spread: GcSpread.Sheets.Spread;

    // Optional, ref to a toolbar. Used to send updates
    private refToolbarFormat?: RefObject<SpreadToolbarFormat>;

    // DOM element to parse font. TODO: do we still need this in modern times ?
    private refStyleElem: RefObject<HTMLInputElement>;

    // Current selection style
    private selectionStyle: ISpreadSelectionFormat = null;

    // Props - TODO: use context
    showErrorMessage: (message: string) => any;
    activeSheetChanged: (oldSheet: GcSpread.Sheets.Sheet, newSheet: GcSpread.Sheets.Sheet) => any;

  constructor(refStyleElem: RefObject<HTMLInputElement>,
    refToolbarFormat: RefObject<SpreadToolbarFormat>,
    showErrorMessage: ((message: string) => any),
    activeSheetChanged: any
  ) {
    this.refStyleElem = refStyleElem;
    this.refToolbarFormat = refToolbarFormat;
    this.showErrorMessage = showErrorMessage;
    this.activeSheetChanged = activeSheetChanged;
  }

    // Selection changed implementation for a format toolbar or panel.
  // * named similar to legacy spread6.js
  // Forward event to a toolbar or panel (if shown)
  public updateFontStyle = (sheet?: GcSpread.Sheets.Sheet) => {
    this.selectionStyle = null;
    if (!sheet)
      sheet = this.spread ? this.spread.getActiveSheet() : null;
    if (!this.refStyleElem || !this.refStyleElem.current || !sheet) {
      this.updateToolbarVisibility(false);
      return;
    }

    // Parse
    const selCell = sheet.getCell(sheet.getActiveRowIndex(), sheet.getActiveColumnIndex(), spreadNS.SheetArea.viewport);
    //console.log('Cell ' + selCell.col + ', ' + selCell.row)
    let font = selCell.font();
    let fontFamily = '';
    const isUnderline = selCell.textDecoration() == spreadNS.TextDecorationType.Underline;
    if (typeof font === "undefined") {
      // Debug log
      console.log('font undefined');
      font = `${spreadDefFontSize.toString()}pt ${spreadDefFont}`;
    }
    const parsedFont = parseFontString(font);
    console.log('parsedFont', font)
    const isBold = parsedFont.fontWeight && parsedFont.fontWeight !== "normal";
    const isItalic = parsedFont.fontStyle && parsedFont.fontStyle !== "normal";

    fontFamily = parsedFont.fontFamily.split(",")[0];
    if (fontFamily.length > 2 && fontFamily.charAt(0) == '"' && fontFamily.charAt(fontFamily.length - 1) == '"')
      fontFamily = fontFamily.substring(1, fontFamily.length - 1);    
    var fontSize = parsedFont.fontSize;
    // TODO: handle em
    if (fontSize.toString().indexOf("em") > 0)
      fontSize = spreadDefFontSize;
    this.refStyleElem.current.style.font = (isItalic ? "italic" : "normal") + " " + (isBold ? "bold" : "normal")+ " " + fontSize.toString()+" "+ fontFamily;      

    if (fontSize) {
      try {
        fontSize = matchFontSizeToPt(fontSize);
      } catch (err) {
        /* safari on 10.7... */
      }
    }

    // Merge
    const canMerge = !sheet.getSpan(selCell.row, selCell.col, spreadNS.SheetArea.viewport);

    this.selectionStyle = {
      fontName: fontFamily,
      fontSize: fontSize,
      colorFill: selCell.backColor(),
      colorFont: selCell.foreColor(),
      isBold: isBold,
      isItalic: isItalic,
      isUnderline: isUnderline,
      canMerge: canMerge,
      vAlign: selCell.vAlign(),
      hAlign: selCell.hAlign(),

      isBorderBottom: !!selCell.borderBottom(),
      isBorderTop: !!selCell.borderTop(),
      isBorderLeft: !!selCell.borderLeft(),
      isBorderRight: !!selCell.borderRight(),

      canUndo: this.spread._undoManager._undoStack.length > 0,
      canRedo: this.spread._undoManager._redoStack.length > 0,
    };

    // Send to toolbar
    this.updateToolbarFontStyle(this.selectionStyle)
  }


  private updateToolbarVisibility = (value: boolean) => {
    if (this.refToolbarFormat && this.refToolbarFormat.current)
      this.refToolbarFormat.current.setVisible(value);
  }  

  private updateToolbarFontStyle = (values: ISpreadSelectionFormat) => {
    if (this.refToolbarFormat && this.refToolbarFormat.current)
      this.refToolbarFormat.current.updateFontStyle(values);
  }

  private removeSheet = (idx: number) => {
    this.spread.removeSheet(idx);
    // on remove sheet event - was: tryPanelChartEditDisable();
    this.activeSheetChanged(null, null);
  }

  // Get the selection area's type
  getSelectionType = () => {
    const selections = this.spread.getActiveSheet().getSelections();
    let selectionType;
    for (let i = 0; i < selections.length; i++) {
      var selection = selections[i];
      if (selection.col == -1 && selection.row == -1) {
        return 0 /* Sheet */;
      } else if (selection.row == -1) {
        if (selectionType == undefined) {
          selectionType = 2 /* OnlyColumn */;
        } else if (selectionType != 2 /* OnlyColumn */) {
          return 4 /* Mixture */;
        }
      } else if (selection.col == -1) {
        if (selectionType == undefined) {
          selectionType = 1 /* OnlyRow */;
        } else if (selectionType != 1 /* OnlyRow */) {
          return 4 /* Mixture */;
        }
      } else {
        if (selectionType == undefined) {
          selectionType = 3 /* OnlyCells */;
        } else if (selectionType != 3 /* OnlyCells */) {
          return 4 /* Mixture */;
        }
      }
    }
    return selectionType;
  }  

  getSortedColumnSelections(sheet: GcSpread.Sheets.Sheet) {
    const sortedRanges = sheet.getSelections();
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      for (let j = i + 1; j < sortedRanges.length; j++) {
        if (sortedRanges[i].col < sortedRanges[j].col) {
          let temp = sortedRanges[i];
          sortedRanges[i] = sortedRanges[j];
          sortedRanges[j] = temp;
        }
      }
    }
    return sortedRanges;
  };  

  canInsertRight(sortedRanges: GcSpread.Sheets.Range[], sheet: GcSpread.Sheets.Sheet) {
    var result = true;
    for (var i = 0; i < sortedRanges.length; i++) {
      var range = sortedRanges[i];
      var arrayFormulaRanges = [];
      var row = range.row;
      var col = range.col;
      var endRow = range.row + range.rowCount;
      var endCol = range.col + range.colCount;
      //find if the selection has a arrayFormula, if it has, push it's range to an Array
      for (var r = row; r < endRow; r++) {
        for (var c = col; c < endCol; c++) {
          var index;
          for (index = 0; index < arrayFormulaRanges.length; index++) {
            if (arrayFormulaRanges[index].contains(r, c)) {
              break;
            }
          }
          if (index === arrayFormulaRanges.length) {
            if (sheet.getFormulaInformation(r, c).isArrayFormula) {
              arrayFormulaRanges.push(sheet.getFormulaInformation(r, c).baseRange)
            }
          }
        }
      }
      if (arrayFormulaRanges.length === 0) {
        return result;
      }
      //find the border of all the arrayFormula Ranges.
      var left = arrayFormulaRanges[0].col;
      var top = arrayFormulaRanges[0].row;
      var bottom = arrayFormulaRanges[0].row + arrayFormulaRanges[0].rowCount;
      for (var j = 1; j < arrayFormulaRanges.length; j++) {
        if (arrayFormulaRanges[j].col < left) {
          left = arrayFormulaRanges[j].col;
        }
        if (arrayFormulaRanges[j].row < top) {
          top = arrayFormulaRanges[j].row;
        }
        if (arrayFormulaRanges[j].row + arrayFormulaRanges[j].rowCount < bottom) {
          bottom = arrayFormulaRanges[j].row + arrayFormulaRanges[j].rowCount;
        }
      }
      //if meet these conditions, then can't insert and shift cells right
      if (left < range.col || top < range.row || bottom > range.row + range.rowCount) {
        result = false;
        break;
      }
    }
    return result;
  }  

  getSortedRowSelections(sheet: GcSpread.Sheets.Sheet) {
    const sortedRanges = sheet.getSelections();
    for (let i = 0; i < sortedRanges.length - 1; i++) {
      for (let j = i + 1; j < sortedRanges.length; j++) {
        if (sortedRanges[i].row < sortedRanges[j].row) {
          const temp = sortedRanges[i];
          sortedRanges[i] = sortedRanges[j];
          sortedRanges[j] = temp;
        }
      }
    }
    return sortedRanges;
  }  

  canInsertDown(sortedRanges: GcSpread.Sheets.Range[], sheet: GcSpread.Sheets.Sheet) {
    let result = true;
    for (let i = 0; i < sortedRanges.length; i++) {
      const range = sortedRanges[i];
      const arrayFormulaRanges = [];
      const row = range.row;
      const col = range.col;
      const endRow = range.row + range.rowCount;
      const endCol = range.col + range.colCount;
      //find if the selection has a arrayFormula, if it has, push it's range to an Array
      for (let r = row; r < endRow; r++) {
        for (let c = col; c < endCol; c++) {
          let index;
          for (index = 0; index < arrayFormulaRanges.length; index++) {
            if (arrayFormulaRanges[index].contains(r, c)) {
              break;
            }
          }
          if (index === arrayFormulaRanges.length) {
            if (sheet.getFormulaInformation(r, c).isArrayFormula) {
              arrayFormulaRanges.push(sheet.getFormulaInformation(r, c).baseRange)
            }
          }
        }
      }
      if (arrayFormulaRanges.length === 0) {
        return result;
      }
      //find the border of all the arrayFormula Ranges.
      let left = arrayFormulaRanges[0].col;
      let top = arrayFormulaRanges[0].row;
      let right = arrayFormulaRanges[0].col + arrayFormulaRanges[0].colCount;
      for (var j = 1; j < arrayFormulaRanges.length; j++) {
        if (arrayFormulaRanges[j].col < left) {
          left = arrayFormulaRanges[j].col;
        }
        if (arrayFormulaRanges[j].row < top) {
          top = arrayFormulaRanges[j].row;
        }
        if (arrayFormulaRanges[j].col + arrayFormulaRanges[j].colCount < right) {
          right = arrayFormulaRanges[j].row + arrayFormulaRanges[j].rowCount;
        }
      }
      //if meet these conditions, then can't insert and shift cells down
      if (left < range.col || top < range.row || right > range.col + range.colCount) {
        result = false;
        break;
      }
    }
    return result;
  }  

  public spreadAction: SpreadActionFunc = (id: string, value: any) => {
    if (id === "focus") {
      this.spread.focus();
      return;
    }
    if (!this.selectionStyle)
      return;
    const sheet = this.spread.getActiveSheet();
    //
    try {
      sheet.isPaintSuspended(true);
      const styleElem = this.refStyleElem.current;

      //TODO: remove
      console.log('spreadAction', id, styleElem.style.font)

      // Current selection (or multiple when non-adjacent ranges are selected)
      const sels = sheet.getSelections();
      // Apply an action to a selection (x actual cell range)
      const applyFunctionToSelection = (_func: (range: GcSpread.Sheets.Range) => void) => {
        for (let n = 0; n < sels.length; n++) {
          const _sel = getActualCellRange(sels[n], sheet.getRowCount(), sheet.getColumnCount());
          _func(_sel);
        }
      }    
      // Apply an action to cells in each selection
      const applyFunction = (_func: (cells: GcSpread.Sheets.Cell) => void) => {
        for (let n = 0; n < sels.length; n++) {
          const _sel = getActualCellRange(sels[n], sheet.getRowCount(), sheet.getColumnCount());
          // TODO: font size/style - apply per cell
          const _cells = sheet.getCells(_sel.row, _sel.col,
            _sel.row + _sel.rowCount - 1, _sel.col + _sel.colCount - 1,
            spreadNS.SheetArea.viewport);
          _func(_cells);
        }
      }
      const defaultBorderStyle = new spreadNS.LineBorder("black", spreadNS.LineStyle.medium);
      switch (id) {
        case "undo":
          spreadNS.SpreadActions.undo.call(sheet);
          break;
        case "redo":
          spreadNS.SpreadActions.redo.call(sheet);
          break;        
        case "fontStyle":
        case "fontSize":
        case "bold":
        case "italic":
          const fontStr = styleElem.style.font;
          const fontSize = id == "fontSize" ? value : this.selectionStyle.fontSize;
          const fontName = id == "fontStyle" ? value : this.selectionStyle.fontName;
          let resultFont = "";
          console.log('action = ' + id + ', font = "' + fontStr + '"')
          // XOR to toggle a style
          resultFont += xor(fontStr.search("bold ") != -1, id === "bold") ? "bold " : "";
          resultFont += xor(fontStr.search("italic ") != -1, id === "italic") ? "italic " : "";
          resultFont += `${fontSize}pt ${fontName}`
          console.log(resultFont);
          applyFunction(cells => cells.font(resultFont));
          break;
        case "underline":
          applyFunction(cells => {
            cells.textDecoration(cells.textDecoration() ^ spreadNS.TextDecorationType.Underline)
          })
          break;
        case "topAlign":
        case "middleAlign":
        case "bottomAlign":
          let align;
          switch (id) {
            case "topAlign":
              align = spreadNS.VerticalAlign.top;
              break;
            case "middleAlign":
              align = spreadNS.VerticalAlign.center;
              break;
            case "bottomAlign":
              align = spreadNS.VerticalAlign.bottom;
              break;
          }
          applyFunction(cells => cells.vAlign(align));
          break;
        case "leftAlign":
        case "centerAlign":
        case "rightAlign":
          let halign;
          switch (id) {
            case "leftAlign":
              halign = spreadNS.HorizontalAlign.left;
              break;
            case "centerAlign":
              halign = spreadNS.HorizontalAlign.center;
              break;
            case "rightAlign":
              halign = spreadNS.HorizontalAlign.right;
              break;
          }
          applyFunction(cells => cells.hAlign(halign));
          break;   
        case "increaseIndent":
        case "decreaseIndent":
          const offset = (id == "decreaseIndent") ? -1 : 1;
          applyFunction(cells => {
            let indent = cells.textIndent();
            if (isNaN(indent) || indent < 0)
              indent = 0;
            cells.textIndent(indent + offset);
          });
          break;
        case "wrapText":
          applyFunction(cells => cells.wordWrap(value));
          break;    
        case "mergeCenter":
          applyFunction(cells => {
            cells.hAlign(spreadNS.HorizontalAlign.center)
            cells.vAlign(spreadNS.VerticalAlign.center);
          });
        // CONTINUE SWITCH!
        case "mergeCells":
          sels.forEach(selection => {
            sheet.addSpan(selection.row, selection.col, selection.rowCount, selection.colCount, spreadNS.SheetArea.viewport);
          });
          break;
        case "mergeAcross":
          sels.forEach(selection => {
            selection = getActualCellRange(selection, sheet.getRowCount(), sheet.getColumnCount());
            for (let r = 0; r < selection.rowCount; r++) {
              sheet.addSpan(selection.row + r, selection.col, 1, selection.colCount, spreadNS.SheetArea.viewport);
            }
          });
          break;
        case "unmerge":
          sels.forEach(selection => {
            selection = getActualCellRange(selection, sheet.getRowCount(), sheet.getColumnCount());
            for (let r = 0; r < selection.rowCount; r++) {
              for (let c = 0; c < selection.colCount; c++) {
                const span = sheet.getSpan(r + selection.row, c + selection.col, spreadNS.SheetArea.viewport);
                if (span) {
                  sheet.removeSpan(span.row, span.col, spreadNS.SheetArea.viewport);
                }
              }
            }
          });
          break;                
        case "backColor":
          applyFunction(cells => cells.backColor(value));
          break;
        case "foreColor":
          applyFunction(cells => cells.foreColor(value));
          break;  
          
        case "bordersBottom":
          applyFunctionToSelection(sel => {
            for (let i = sel.row; i < sel.row + sel.rowCount; i++) {
              for (let k = sel.col; k < sel.col + sel.colCount; k++) {
                if (i == sel.row + sel.rowCount - 1)
                  sheet.getCell(i, k).borderBottom(value ? defaultBorderStyle : null);
              }
            }
          });
          break;
        case "bordersTop":
          applyFunctionToSelection(sel => {
            for (let i = sel.row; i < sel.row + sel.rowCount; i++) {
              for (let k = sel.col; k < sel.col + sel.colCount; k++) {
                if (i == sel.row)
                  sheet.getCell(i, k).borderTop(value ? defaultBorderStyle : null);
              }
              break;
            }
          });
          break;
        case "bordersLeft":
          applyFunctionToSelection(sel => {
            for (let i = sel.col; i < sel.col + sel.colCount; i++) {
              for (let k = sel.row; k < sel.row + sel.rowCount; k++) {
                if (i == sel.col)
                  sheet.getCell(k, i).borderLeft(value ? defaultBorderStyle : null);
              }
              break;
            }
          });
          break;
        case "bordersRight":
          applyFunctionToSelection(sel => {
            for (let i = sel.col; i < sel.col + sel.colCount; i++) {
              for (let k = sel.row; k < sel.row + sel.rowCount; k++) {
                if (i == sel.col + sel.colCount - 1)
                  sheet.getCell(k, i).borderRight(value ? defaultBorderStyle : null);
              }
            }
          });
          break;
        case "noBorders":
          applyFunction(cells => {
            cells.borderRight(null);
            cells.borderLeft(null);
            cells.borderBottom(null);
            cells.borderTop(null);
          });
          break;
        case "outsideBorders":
          applyFunctionToSelection(sel => {
            for (let i = sel.col; i < sel.col + sel.colCount; i++) {
              for (let k = sel.row; k < sel.row + sel.rowCount; k++) {
                if (i == sel.col + sel.colCount - 1)
                  sheet.getCell(k, i).borderRight(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.medium));
                if (i == sel.col)
                  sheet.getCell(k, i).borderLeft(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.medium));
                if (k == sel.row)
                  sheet.getCell(k, i).borderTop(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.medium));
                if (k == sel.row + sel.rowCount - 1)
                  sheet.getCell(k, i).borderBottom(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.medium));
              }
            }
          });
          break;
        case "thickBoxBorder":
          applyFunctionToSelection(sel => {
            for (let i = sel.col; i < sel.col + sel.colCount; i++) {
              for (let k = sel.row; k < sel.row + sel.rowCount; k++) {
                if (i == sel.col + sel.colCount - 1)
                  sheet.getCell(k, i).borderRight(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.thick));
                if (i == sel.col)
                  sheet.getCell(k, i).borderLeft(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.thick));
                if (k == sel.row)
                  sheet.getCell(k, i).borderTop(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.thick));
                if (k == sel.row + sel.rowCount - 1)
                  sheet.getCell(k, i).borderBottom(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.thick));
              }
            }
          });
          break;
        case "doubleBottomBorders":
          applyFunctionToSelection(sel => {
            for (let i = sel.col; i < sel.col + sel.colCount; i++) {
              for (let k = sel.row; k < sel.row + sel.rowCount; k++) {
                if (k == sel.row + sel.rowCount - 1)
                  sheet.getCell(k, i).borderBottom(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.double));
              }
            }
          });
          break;
        case "thickBottomBorder":
          applyFunctionToSelection(sel => {
            for (let i = sel.col; i < sel.col + sel.colCount; i++) {
              for (let k = sel.row; k < sel.row + sel.rowCount; k++) {
                if (k == sel.row + sel.rowCount - 1)
                  sheet.getCell(k, i).borderBottom(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.thick));
              }
            }
          });
          break;
        case "topBottomBorders":
          applyFunctionToSelection(sel => {
            for (let i = sel.col; i < sel.col + sel.colCount; i++) {
              for (let k = sel.row; k < sel.row + sel.rowCount; k++) {
                if (k == sel.row)
                  sheet.getCell(k, i).borderTop(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.medium));
                if (k == sel.row + sel.rowCount - 1)
                  sheet.getCell(k, i).borderBottom(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.medium));
              }
            }
          });
          break;
        case "topThickBottomBorders":
          applyFunctionToSelection(sel => {
            for (let i = sel.col; i < sel.col + sel.colCount; i++) {
              for (let k = sel.row; k < sel.row + sel.rowCount; k++) {
                if (k == sel.row)
                  sheet.getCell(k, i).borderTop(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.medium));
                if (k == sel.row + sel.rowCount - 1)
                  sheet.getCell(k, i).borderBottom(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.thick));
              }
            }
          });
          break;
        case "topDoubleBottomBordes":
          applyFunctionToSelection(sel => {
            for (let i = sel.col; i < sel.col + sel.colCount; i++) {
              for (let k = sel.row; k < sel.row + sel.rowCount; k++) {
                if (k == sel.row)
                  sheet.getCell(k, i).borderTop(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.medium));
                if (k == sel.row + sel.rowCount - 1)
                  sheet.getCell(k, i).borderBottom(new spreadNS.LineBorder("black",
                    spreadNS.LineStyle.double));
              }
            }
          });
          break;
        case "allBorders":
          applyFunction(cells => {
            cells.borderRight(new spreadNS.LineBorder("black",
              spreadNS.LineStyle.medium));
            cells.borderLeft(new spreadNS.LineBorder("black",
              spreadNS.LineStyle.medium));
            cells.borderBottom(new spreadNS.LineBorder("black",
              spreadNS.LineStyle.medium));
            cells.borderTop(new spreadNS.LineBorder("black",
              spreadNS.LineStyle.medium));
          });
          break;   
          
        // Cells - insert, remove, clear
        case "addCellsRight": {
          const selections = sheet.getSelections();
          /* OnlyCells ? */
          if (this.getSelectionType() == 3) {
            var sortedRanges = this.getSortedColumnSelections(sheet);
            var colCount = sheet.getColumnCount();
            if (this.canInsertRight(sortedRanges, sheet)) {
              for (var i = 0; i < sortedRanges.length; i++) {
                var r = sortedRanges[i];
                var option = 256 /* BindingPath */ | 2 /* Formula */ | 8 /* RangeGroup */ | 32 /* Span */ | 16 /* Sparkline */ | 64 /* Style */ | 128 /* Tag */ | 1 /* Value */;
                sheet.addColumns(colCount, r.colCount);
                sheet.moveTo(r.row, r.col, r.row, r.col + r.colCount, r.rowCount, colCount - r.col, option);
              }
            }
            else {
              const msgError_ = translate('ui.msg.spread.cannotInsertMerged', "Inserting or deleting cells here would unmerge some merged cells.");
              this.showErrorMessage(msgError_);
            }
          }
          break;
        }
        case "addCellsDown": {
            const selections = sheet.getSelections();
            if (this.getSelectionType() == 3 /* OnlyCells */) {
                const sortedRanges = this.getSortedRowSelections(sheet);
                const rowCount = sheet.getRowCount();
                if (this.canInsertDown(sortedRanges,sheet)) {
                for (let i = 0; i < sortedRanges.length; i++) {
                    const r = sortedRanges[i];
                    const option = 256 /* BindingPath */ | 2 /* Formula */ | 8 /* RangeGroup */ | 32 /* Span */ | 16 /* Sparkline */ | 64 /* Style */ | 128 /* Tag */ | 1 /* Value */;
                    sheet.addRows(rowCount, r.rowCount);
                    sheet.moveTo(r.row, r.col, r.row + r.rowCount, r.col, rowCount - r.row, r.colCount, option);
                }
                }
                else {
                    const msgError_ = translate('ui.msg.spread.cannotInsertMerged', "Inserting or deleting cells here would unmerge some merged cells.");
                    this.showErrorMessage(msgError_);
                }
            }             
            break;
          }
        case "addCol": {
          const selections = sheet.getSelections();
          const selection = getActualCellRange(selections[0], sheet.getRowCount(), sheet.getColumnCount());
          sheet.addColumns(sheet.getActiveColumnIndex(), selection.colCount);
          break;
        }
        case "addRow": {
          const selections = sheet.getSelections();
          const selection = getActualCellRange(selections[0], sheet.getRowCount(), sheet.getColumnCount());
          sheet.addRows(sheet.getActiveRowIndex(), selection.rowCount);
          break;
        }
        case "addSheet":
            this.spread.addSheet(this.spread.getActiveSheetIndex());
            break;
        case "deleteCellsLeft":
            if (sheet.getRowCount() > 2) {
                const sortedRanges = this.getSortedColumnSelections(sheet);
                for (let i = 0; i < sortedRanges.length; i++) {
                    const r = sortedRanges[i];
                    const option = 256 /* BindingPath */ | 2 /* Formula */ | 8 /* RangeGroup */ | 32 /* Span */ | 16 /* Sparkline */ | 64 /* Style */ | 128 /* Tag */ | 1 /* Value */;
                    sheet.moveTo(r.row, r.col + r.colCount, r.row, r.col, r.rowCount, sheet.getColumnCount() - (r.col + r.colCount), option);
                }
                sheet.clearSelection();
            }
            break;
        case "deleteCellsUp":
            if (sheet.getRowCount() > 2) {
                const sortedRanges = this.getSortedRowSelections(sheet);
                for (let i = 0; i < sortedRanges.length; i++) {
                    const r = sortedRanges[i];
                    const option = 256 /* BindingPath */ | 2 /* Formula */ | 8 /* RangeGroup */ | 32 /* Span */ | 16 /* Sparkline */ | 64 /* Style */ | 128 /* Tag */ | 1 /* Value */;
                    sheet.moveTo(r.row + r.rowCount, r.col, r.row, r.col, sheet.getRowCount() - (r.row + r.rowCount), r.colCount, option);
                }
                sheet.clearSelection();
            }
            break;
        case "deleteRow":
            if (sheet.getRowCount() > 2) {
                /* var sel = sheet.getSelections()[0];sheet.deleteRows(sheet.getActiveRowIndex(), sel.rowCount);*/
                const sortedRanges = this.getSortedRowSelections(sheet);
                for (let i = 0; i < sortedRanges.length; i++) {
                    sheet.deleteRows(sortedRanges[i].row, sortedRanges[i].rowCount);
                }
                sheet.clearSelection();
            }
            break;
        case "deleteCol":
            if (sheet.getColumnCount() > 2) {
                /* var sel = sheet.getSelections()[0];sheet.deleteColumns(sheet.getActiveColumnIndex(), sel.colCount);*/
                const sortedRanges = this.getSortedColumnSelections(sheet);
                for (let i = 0; i < sortedRanges.length; i++) {
                    sheet.deleteColumns(sortedRanges[i].col, sortedRanges[i].colCount);
                }
                sheet.clearSelection();
            }
            break;
        case "deleteSheet":
            if (this.spread.getSheetCount() > 1)
                this.removeSheet(this.spread.getActiveSheetIndex());
            break; 
            
        case "autoSum":
        case "autoAverage":
        case "autoCount":
        case "autoMax":
        case "autoMin":
          applyFunctionToSelection(selection => {
            let formula = "";
            for (let i = 0; i < selection.colCount; i++) {
              const resCellRow = selection.row >= 0 ? selection.row + selection.rowCount : selection.row + selection.rowCount + 1;
              const resCellCol = selection.col + i;

              const styleName = sheet.getStyleName(selection.row, selection.col + i);
              if (styleName)
                sheet.setStyleName(resCellRow, resCellCol, styleName);
              else
                sheet.setFormatter(resCellRow, resCellCol, sheet.getFormatter(selection.row, selection.col + i));

              switch (id) {
                case "autoSum":
                  formula = "=SUM(";
                  break;
                case "autoAverage":
                  formula = "=AVERAGE(";
                  break;
                case "autoCount":
                  formula = "=COUNT(";
                  break;
                case "autoMax":
                  formula = "=MAX(";
                  break;
                case "autoMin":
                  formula = "=MIN(";
                  break;
              }
              formula += sheet.getText(0, selection.col + i, spreadNS.SheetArea.colHeader)
                + sheet.getText(selection.row < 0 ? 0 : selection.row, 0, spreadNS.SheetArea.rowHeader) + ":"
                + sheet.getText(0, selection.col + i, spreadNS.SheetArea.colHeader)
                + sheet.getText(selection.row >= 0 ? selection.row + selection.rowCount - 1 : selection.row
                  + selection.rowCount, 0, spreadNS.SheetArea.rowHeader) + ")";
              sheet.setFormula(resCellRow, resCellCol, formula);
            }
          });
          break;
        case "fillUp":
          applyFunctionToSelection(selection => {
            for (var i = 0; i < selection.colCount; i++) {
              sheet.setValue(selection.row, i + selection.col, sheet.getValue(selection.row + selection.rowCount - 1, selection.col + i));
            }
          });
          break;
        case "fillDown":
          applyFunctionToSelection(selection => {
            for (let i = 0; i < selection.colCount; i++) {
              const start = new spreadNS.Range(selection.row, i + selection.col, 1, 1);
              const r = new spreadNS.Range(selection.row, i + selection.col, selection.rowCount, 1);
              // TODO: ! calculate step              
              sheet.fillGrowth(start, r, spreadNS.FillSeries.Column, 1, null);
            }
          });
          break;
        case "fillLeft":
          applyFunctionToSelection(selection => {
            for (let i = 0; i < selection.rowCount; i++) {
              sheet.setValue(i + selection.row, selection.col, sheet.getValue(i + selection.row, selection.col + selection.colCount - 1));
            }
          });
          break;
        case "fillRight":
          applyFunctionToSelection(selection => {
            for (let i = 0; i < selection.rowCount; i++) {
              const start = new spreadNS.Range(i + selection.row, selection.col, 1, 1);
              const r = new spreadNS.Range(i + selection.row, selection.col, 1, selection.colCount);
              sheet.fillGrowth(start, r, spreadNS.FillSeries.Row, 1, null);
            }
          });
          break;
        case "clearAll":
        case "clearFormat":
        case "clearContent":
        case "clearComments":
          applyFunctionToSelection(selection => {
            switch (id) {
              case "clearAll":
                sheet.clear(selection.row, selection.col, selection.rowCount,
                  selection.colCount, spreadNS.SheetArea.viewport, spreadNS.StorageType.Comment);
                sheet.clear(selection.row, selection.col, selection.rowCount,
                  selection.colCount, spreadNS.SheetArea.viewport, spreadNS.StorageType.Data);
                sheet.clear(selection.row, selection.col, selection.rowCount,
                  selection.colCount, spreadNS.SheetArea.viewport, spreadNS.StorageType.Sparkline);
              case "clearFormat":
                sheet.clear(selection.row, selection.col, selection.rowCount,
                  selection.colCount, spreadNS.SheetArea.viewport, spreadNS.StorageType.Style);
                break;
              case "clearContent":
                sheet.clear(selection.row, selection.col, selection.rowCount,
                  selection.colCount, spreadNS.SheetArea.viewport, spreadNS.StorageType.Data);
                break;
              case "clearComments":
                sheet.clear(selection.row, selection.col, selection.rowCount,
                  selection.colCount, spreadNS.SheetArea.viewport, spreadNS.StorageType.Comment);
                break;
            }
          });
          break;
        case "sortaz":
        case "sortza":
          applyFunctionToSelection(sel => {
            sheet.sortRange(sel.row, sel.col, sel.rowCount, sel.colCount, true, [
              { index: sel.col, ascending: id == "sortaz" }
            ]);
          });
          break;
        case "addFilter":
          if (sels.length > 0) {
            var sel = sels[0];
            sheet.rowFilter(new spreadNS.HideRowFilter(sel));
          }
          break;
        case "clearFilter":
          sheet.rowFilter(null);
          break;            
      }
    }
    finally {
      sheet.isPaintSuspended(false);
    }
    // do not re-rendet format toolbar on color change
    if (id.indexOf("Color") == -1)//  && id.indexOf("font") == -1)
    this.updateFontStyle();
  }

}