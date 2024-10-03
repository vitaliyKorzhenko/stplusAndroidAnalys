/*

  SpreadJS component wrapper.

  Toolbar options:
    * In-place toolbar (toolbar.tsx)
    * Legacy panel wrapped in Fluent's panel
      https://developer.microsoft.com/en-us/fluentui#/controls/web/panel#PanelType

  NOTES:
    * Keyboard shortcuts:
      https://www.npmjs.com/package/react-shortcuts?activeTab=readme

    TODO: detect pinch? 
    https://stackoverflow.com/questions/11183174/simplest-way-to-detect-a-pinch

*/
/// <reference path="gcspread.sheets.d.ts" />

import { ISpreadComponentProps, ISpreadComponentState, ISpreadSelectionMode, SpreadComponentJson } from './types';

import React, {MouseEventHandler, useEffect} from 'react';

import { isMac } from 'office-ui-fabric-react';

import d3 from 'd3';
import * as d3Tip from "d3-tip"
(d3 as any).tip = d3Tip
import { D3Chart } from './spread-d3';

import { SpreadToolbarFormat } from './toolbar'
import { SpreadDialogFind } from './Dialogs/find'

import { getActualCellRange, SpreadActionFunc, SpreadActions } from './spread-action'
import { spreadDefFont, spreadDefFontSize } from './spread-font';
import { ISpreadSearchInformation } from './types-find';
import { SpreadAppContext, SpreadContextType } from './SpreadContext';

import config from '../../config.json';
import { ContextualMenuSpread } from './menu';

// Global functions defined on some platforms (legacy Mac, iOS code)
let hostPrefs = null;
let hostHandlesPasteManually = undefined;

// Namespace - (different in SpreadJS 8 / 9 / 10, so better to use a shortcut)
const spreadNS = GcSpread.Sheets;

let lastId = 0;
export function newId(prefix='id') {
    lastId++;
    return lastId == 1 ? prefix : `${prefix}${lastId}`;
}

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

export interface CoreResultsParserOpts {
  defFont?: string;
  defFontSize?: number;
}


export class SpreadComponent extends React.Component<ISpreadComponentProps, ISpreadComponentState>{

  // References
  private refSpread = React.createRef<HTMLDivElement>();
  private refFormulaBar = React.createRef<HTMLDivElement>();
  private refFormulaElem = React.createRef<HTMLDivElement>();
  private refPositionBox = React.createRef<HTMLInputElement>();
  private refStyleElem = React.createRef<HTMLInputElement>();

  // Format Toolbar
  private refToolbarFormat = React.createRef<SpreadToolbarFormat>();
  
  // Find in Spread 
  private refDialogFind = React.createRef<SpreadDialogFind>();

  // Contextual Menu
  private refSpreadMenu = React.createRef<ContextualMenuSpread>();

  private spreadActions: SpreadActions;

  // Fields from spread6.js

  /* selected/focused charts, used for copy to clipboard */
  private focusedCharts = [];

  constructor(props, context) {
    super(props);
    console.log("SPREAD CONTEXT",context);
    const contextValue: SpreadContextType = context;

    this.state = {
    }
    this.spreadActions = new SpreadActions(this.refStyleElem, this.refToolbarFormat, contextValue.showErrorMessage, this.activeSheetChangedProcess);
    this.spreadKeyDown = this.spreadKeyDown.bind(this);
  }

  // Main spreadsheet
  public spread: GcSpread.Sheets.Spread;
  public spreadFormulaTextBox: GcSpread.Sheets.FormulaTextBox;
  
  // Secondary for save; TODO: remove
  private spreadToSave: GcSpread.Sheets.Spread;

  
  // Init Spread - Turn on tooltips
  initTips = () => {
    this.spread.showScrollTip(3);
    this.spread.showResizeTip(3);
    this.spread.showDragDropTip(true);
    this.spread.showDragFillTip(true);
  }

  public blurFocus(): void {
    // Internal SpreadJS blur - removes focus from sheet.
    // try scope is used because this method is could fail
    // and is not well documented
    try {
      spreadNS.FocusHelper.setActiveElement(null);
    }
    catch {
      //
    }
  }

  private spreadKeyDown(e: KeyboardEvent) {
    const _isCtrl = isMac() ? e.metaKey : e.ctrlKey;
    const _isZoomModifier = isMac() ? e.metaKey : e.ctrlKey && e.altKey;
    // Cmd+F (Ctrl+F) - open Find dialog
    if (e.keyCode == 70 && _isCtrl) {
      e.preventDefault();
      // if not selection mode
      this.blurFocus();
      this.setVisibleDialogFind(true);
    } else if (_isZoomModifier && e.keyCode == 187) {
      e.preventDefault();
      this.spreadZoomIn();
    } else if (_isZoomModifier && e.keyCode == 189) {
      e.preventDefault();
      this.spreadZoomOut();
    } else if (_isZoomModifier && e.keyCode == 48) {
      e.preventDefault();
      this.eventSetZoom(100);
    }
  }

  // On SpreadJS context menu
  private onSpreadContext: MouseEventHandler<HTMLDivElement> = (event) => {
    let sheetIsEditing = true;
    try {
      const activeSheet = this.spread.getActiveSheet();
      sheetIsEditing = activeSheet && activeSheet.isEditing();
    }
    catch (e) {
     /* Something went wrong, do not show contextual menu */
    }
    if (!config.disableContextMenus && !sheetIsEditing) {
      event.preventDefault();
      const xPos = event.pageX, yPos = event.pageY;
      if (this.refSpreadMenu.current)
        this.refSpreadMenu.current.showContextualMenu({ left: xPos, top: yPos }, this.spread);
    }    
  }

  private interval: any;

  componentDidMount(): void {
    /*
    const MINUTE_MS = 90000;
    this.interval = setInterval(async () => {
      this.props.dataProvider.saveData(this.spreadToJson());
    }, MINUTE_MS);
    */

    console.error('MOUNT SPREAD', this.refSpread.current)
    window.addEventListener('beforeunload', this.unloadSpread);

    this.initSpread();
    const spreadElem = this.refSpread.current;
    if (spreadElem)
      spreadElem.addEventListener("keydown", this.spreadKeyDown);
  }

  componentWillUnmount(): void {
    //clearInterval(this.interval);
    const spreadElem = this.refSpread.current;
    if (spreadElem)
      spreadElem.removeEventListener("keydown", this.spreadKeyDown);
      
    window.removeEventListener('beforeunload', this.unloadSpread);
  }

  private unloadSpread() {
    console.log("===before unload====");
    // this.props.dataProvider.saveData(this.spreadToJson());
  }
  
  private initSpread() {
    //TODO: defSheetNameLocValue
    /* was: document.getElementById(this.idSpread) */
    this.spread = new spreadNS.Spread(this.refSpread.current, { sheetCount: 1 });//window['initspread'](this.idSpread);//

    // Spread actions
    this.spreadActions.spread = this.spread;
    
    this.initTips();
    //this.spread.useWijmoTheme = true;this.spread.repaint();

    // Formula box
    this.spreadFormulaTextBox = new spreadNS.FormulaTextBox(this.refFormulaElem.current /* was: document.getElementById('formulabox') */);
    this.spreadFormulaTextBox.spread(this.spread);

    // Default style
    const style = new spreadNS.Style();
    style.hAlign = 2;
    style.vAlign = spreadNS.VerticalAlign.bottom;
    // New: autofit sometimes does not work, shrink numbers
    style.shrinkToFit = true;
    style.name = 'styleDefNumber';
    // style.formatter = data.namedStyles[i].formatter;
    this.spread.addNamedStyle(style);

    // bind event when selection is changed
    this.spread.bind(spreadNS.Events.SelectionChanged,this.selectionChanged );
    this.spread.bind(spreadNS.Events.ActiveSheetChanged, this.activeSheetChanged);
    this.spread.bind(spreadNS.Events.SheetTabClick, (sender, args) => {
      if (args.sheet === null && args.sheetName === null) {
        setTimeout(()=> {
          const activeSheet = this.spread.getActiveSheet();
          const defStyle = new spreadNS.Style();
          defStyle.vAlign = 2;
          activeSheet.setDefaultStyle(defStyle);
        }, 300);
      }
    });

    // TODO: any changes/events to active sheet must be also in fromJSON()
    // if no data to load
    var activeSheet = this.spread.getActiveSheet();
    activeSheet.setActiveCell(0, 0);
    activeSheet.bind(spreadNS.Events.ClipboardPasted, this.clipboardPasted);
    this.sheetPostLoad(activeSheet);
    // if debug
    window['spread'] = this.spread;

    // Secondary SpreadJS instance, used to save file
    this.spreadToSave = new spreadNS.Spread(document.getElementById(this.idSpreadToSave), { sheetCount: 1 });

    console.log('initSpread DONE');

    this.props.dataProvider.loadData().then((value: string) => this.loadDataFromJson(value));

    // ALERT ACHTUNG
    // setInterval(()=> { const s1 = this.spreadToJson(); const s2 = this.spreadToJsonOld(); console.log(s1); console.log(s2); console.log(s1 === s2)}, 10000)
    this.spread.focus();

  }

  private clipboardPasted = (sender, args: {
    sheet: GcSpread.Sheets.Sheet, // The sheet that triggered the event.
    sheetName: string, // The sheet's name.
    cellRange: GcSpread.Sheets.Range, // The range that was pasted.
    pasteOption: GcSpread.Sheets.ClipboardPasteOptions //The paste option that indicates what data is pasted from the Clipboard: values, formatting, or formulas.
  }) => {
    console.log('pasted', this)
    // TODO: skip if internal _doPaste()
    console.log(args.cellRange, args.cellRange.colCount)
    for (let i = 0; i < args.cellRange.colCount; i++) {
      for (var j = 0; j < args.cellRange.rowCount; j++) {
        if (isNumeric(args.sheet.getValue(args.cellRange.row + j, args.cellRange.col + i))) {
          //args.sheet.setStyleName(args.cellRange.row + j, args.cellRange.col + i, 'styleDefNumber');
        }
      }
    }
    //was: this.selectionChanged();
    this.autofitSelection(args.sheet, args.cellRange);
  }

  autofitSelection = (sheet?: GcSpread.Sheets.Sheet, selection?: GcSpread.Sheets.Range) => {
    // console.log('auto fit', sheet, selection)
    const minWidth = 64;
    if (sheet === undefined)
      sheet = this.spread.getActiveSheet();
    if (selection === undefined) {
      const selections = sheet.getSelections();
      selection = getActualCellRange(selections[selections.length - 1], sheet.getRowCount(), sheet.getColumnCount());
    }
    for (var i = selection.col; i < selection.colCount + selection.col; i++) {
      // console.log('autofit i=',i)
      sheet.autoFitColumn(i);
      // console.log('sheet.getColumnWidth(i)',sheet.getColumnWidth(i));
      if (sheet.getColumnWidth(i) < minWidth)
        sheet.setColumnWidth(i, minWidth);
    }
  }

  // returns all charts as JSON
  private getChartsJson = () => {
    const charts = [];
    for (var i = 0; i < this.spread.sheets.length; i++) {
      var sheetCharts = this.spread.getSheet(i).getFloatingObjects();
      for (var k = 0; k < sheetCharts.length; k++) {
        sheetCharts[k].options.col = sheetCharts[k].startColumn();/*getColumnByWidth(sheetCharts[k]._location.x);*/
        sheetCharts[k].options.row = sheetCharts[k].startRow();/*getRowByHeight(sheetCharts[k]._location.y);*/
        charts.push({
          "sheetIndex": i,
          "options": sheetCharts[k].options
        });
      }
    }
    return charts;
  }

  // Save workbook + charts as JSON
  public spreadToJson = (): string => {
    const json = this.spread.toJSON();
    // Remove floating objects - we store charts separatly
    if (typeof json.sheets === "object")
      for (const sheetName in json.sheets)
        // iterate over sheets
        if (json.sheets.hasOwnProperty(sheetName)) {
          json.sheets[sheetName]['floatingObjects'] = undefined;
        }
    const res: SpreadComponentJson = {
      workbook: json,
      charts: this.getChartsJson()
    };
    return JSON.stringify(res);
  }

  private spreadToJsonOld = () => {
    this.spreadToSave.fromJSON(this.spread.toJSON());
    var sheet = this.spread.getActiveSheet();
    var isChanged = sheet.hasPendingChanges();

    for (var i = 0; i < this.spreadToSave.sheets.length; i++) {
      var sheetCharts = this.spreadToSave.getSheet(i).getFloatingObjects();
      for (var k = 0; k < sheetCharts.length; k++) {
        this.spreadToSave.getSheet(i).removeFloatingObject(sheetCharts[k].name())
      }
    }
    if (!isChanged)
      sheet.clearPendingChanges();
    return JSON.stringify({
      "workbook": this.spreadToSave.toJSON(),
      "charts": this.getChartsJson()
    });
  }

  // remove key mapping
  private sheetPostLoad = (sheet: GcSpread.Sheets.Sheet): void => {
    this.sheetRemoveKeyMap(sheet);
    this.sheetUpdateCellOverflow(sheet);
    // moved here from activeSheetChanged()
    setTimeout(this.selectionChanged, 300);
  }

  //
  sheetUpdateCellOverflow = (sheet: GcSpread.Sheets.Sheet): void => {
    let cellOverflowValue = true;
    if (typeof hostPrefs == 'function') {
      const host_cellOverflowValue = hostPrefs("prefs.io.allow_cell_overflow");
      if ((typeof host_cellOverflowValue == 'string') && (host_cellOverflowValue.length == 1))
        cellOverflowValue = host_cellOverflowValue == "1";
    }
    sheet.allowCellOverflow(cellOverflowValue);
  }

  private sheetRemoveKeyMap = (arg: GcSpread.Sheets.Sheet): void => {
    arg.removeKeyMap(90, false, false, false, true);
    if ((typeof hostHandlesPasteManually !== 'undefined') && hostHandlesPasteManually) {
        arg.removeKeyMap(86, false, false, false, true);
    }
  }

  private sheetApplyCurrentTheme = (sheet: GcSpread.Sheets.Sheet): void => {
    sheet.currentTheme("Office");
  }

  // load workbook from JSON
  public loadDataFromJson = (jsonData: string | object): boolean => {
    console.log('-----load Data From JSON------', this);

    if (!jsonData)
      return;
    const spreadJSON = (typeof jsonData === "string") ? JSON.parse(jsonData) : jsonData;
    this.spread.fromJSON(spreadJSON.workbook);
    const sheet = this.spread.getActiveSheet();
    sheet.bind(spreadNS.Events.ClipboardPasted, this.clipboardPasted);
    // Set a selection (for the format toolbar and the top-left address field)
    const selections = sheet.getSelections();
    if (!selections || selections.length === 0)
      sheet.setActiveCell(0,0);
    this.sheetPostLoad(sheet);
    const isChanged = sheet.hasPendingChanges();
    if (sheet.getColumnCount() < 15) sheet.addColumns(sheet.getColumnCount(), 5);
    if (sheet.getRowCount() < 50) sheet.addRows(sheet.getRowCount(), 5);
    if (!this.spread.showHorizontalScrollbar()) this.spread.showHorizontalScrollbar(true);
    if (!this.spread.showVerticalScrollbar()) this.spread.showVerticalScrollbar(true);
    if (!this.spread.tabStripVisible()) this.spread.tabStripVisible(true);
    for (var i = 0; i < this.spread.sheets.length; i++) {
      this.sheetApplyCurrentTheme(this.spread.sheets[i]);
    }
    if (spreadJSON.charts)
      for (var i = 0; i < spreadJSON.charts.length; i++) {
        const chart = spreadJSON.charts[i];
        this.createChart(this.spread.getSheet(chart.sheetIndex), chart.options);
      }
    if (!isChanged)
      sheet.clearPendingChanges();
    this.closeAnyWindow();
    this.spread.focus();
    return true;
  }

  getRowsHeight = (from, to) => {
    const sheet = this.spread.getActiveSheet();
    if (from < 0 || to >= sheet.getRowCount() || from > to)
      return 0;
    let height = 0;
    for (let i = from; i < to; i++) {
      height += sheet.getRow(i).height();
    }
    return height;
  }

  getColsWidth = (from, to) => {
    const sheet = this.spread.getActiveSheet();
    if (from < 0 || to >= sheet.getColumnCount() || from > to)
      return 0;
    let width = 0;
    for (let i = from; i < to; i++) {
      width += sheet.getColumn(i).width();
    }
    return width;
  }

  // Create a chart from "options" JSON to the "sheet"
  private createChart = (sheet: GcSpread.Sheets.Sheet, options: any) => {
    var chartContainer;
    var id = options.name ? options.name : options.title + sheet.getFloatingObjects().length;
    /* fast fix if same name happens */
    while (sheet.findFloatingObject(id) != null)
      id = id + Math.floor(Math.random() * 10);
    var zoom = this.getZoom(sheet);
    var customZoom = zoom && (zoom != 100) && (zoom > 0);
    var zoomRatio = zoom / 100.0;
    if (customZoom) {
      if (options.height) options.height = options.height * 100.0 / zoom;
      if (options.width) options.width = options.width * 100.0 / zoom;
    }
    try {
      if (options.row + options.cheight > sheet.getRowCount())
        sheet.setRowCount(options.row + options.cheight + 30);
      if (options.col + options.cwidth > sheet.getColumnCount())
        sheet.setColumnCount(options.col + options.cwidth + 10);
    } catch (err) { }

    const recreateChart = (container, options, zoom) => {
      if (container) {
        chartContainer.innerHTML = "";
        chartD3 = new D3Chart(d3.select(chartContainer));
        if (zoom)
          chartD3.setZoom(zoom);
        chartD3.createChart(floatChart["options"]);
      }
    };

    const updateChart = (container, options, zoom) => {
      recreateChart(container, options, zoom);
      if (container) floatChart["chartContainer"] = chartContainer;
    };
    sheet.bind(spreadNS.Events.CustomFloatingObjectLoaded, (sender, args) => {
      if (args.customFloatingObject == null || args.customFloatingObject.name() !== id) {
        return;
      }
      chartContainer = args.element;
      // Context menu
      chartContainer.addEventListener('contextmenu', e => {
        e.preventDefault();
        this.setVisibleToolbarFormat(true);
      });
      updateChart(chartContainer, floatChart["options"], this.getZoom(sheet) / 100.0);
    });
    sheet.bind(spreadNS.Events.FloatingObjectRemoved, (sender, args) => { this.panelChartEditDisable(); });
    sheet.bind(spreadNS.Events.FloatingObjectChanged, (sender, args) => {
      /* update selected charts array */
      if (args.propertyName == "isSelected") {
        if (args.floatingObject._isSelected) {
          if (this.focusedCharts.indexOf(args.floatingObject._name) == -1)
            this.focusedCharts.push(args.floatingObject._name);
        }
        else
          this.focusedCharts.splice(this.focusedCharts.indexOf(args.floatingObject._name), 1);
      }
      if (this.focusedCharts.length < 1)
        this.panelChartEditDisable();
      /* event from another chart? if yes - exit */
      if (args.floatingObject == null || args.floatingObject._name !== id) {
        return;
      }
      if (args.propertyName === "width" || args.propertyName === "height") {
        var newWidth = args.floatingObject._location.width * (this.getZoom(sheet) / 100);
        var newHeight = args.floatingObject._location.height * (this.getZoom(sheet) / 100);
        if ((Math.abs(floatChart["options"].width - newWidth) > 2) || (Math.abs(floatChart["options"].height - newHeight) > 2)) {
          floatChart["options"].width = newWidth;
          floatChart["options"].height = newHeight;
          recreateChart(chartContainer, floatChart["options"], this.getZoom(sheet) / 100);
        } else
          console.log("---> skip!");
      }
      if (this.focusedCharts.length > 0) {
        // TODO: check if the same chart is selected and skip rebuilding the panel 
        this.panelChartEditEnable(args.floatingObject);
      }
    });

    if (!options.height) {
      options.height = this.getRowsHeight(options.row, options.row + options.cheight);
      if (options.height > 120) options.height -= 2;
    }
    if (!options.width) {
      options.width = this.getColsWidth(options.col, options.col + options.cwidth)
      if (options.width > 120) options.width -= 2;
    }
    var floatChart = new spreadNS.CustomFloatingObject(id, this.getColsWidth(0, options.col), this.getRowsHeight(0, options.row), options.width, options.height);
    floatChart.startRow(options.row);
    floatChart.startColumn(options.col);
    //    floatChart.endRow(options.row+options.cheight);
    //    floatChart.endColumn(options.col+options.cwidth);

    floatChart["options"] = options;
    floatChart["repaint"] = function (options, zoom) {
      updateChart(chartContainer, options, zoom);
    };
    /* add to spreadJS */
    var chart = document.createElement("div");
    var borderColor = "#e6e6e6";
    // $(chart).attr("style", "background:white; border:1px solid "+borderColor);
    chart.setAttribute("style", "background:white;");
    var chartD3 = new D3Chart(d3.select(chart));
    chartD3.setZoom(zoomRatio);
    options.width *= zoomRatio;
    options.height *= zoomRatio;
    chartD3.createChart(options);
    floatChart.Content(chart);
    sheet.addFloatingObject(floatChart);
  }

  repaintFloatingCharts(oldZoom: number, zoom: number) {
    this.repaintFloatingChartsSheet(oldZoom, zoom, null);
  }

  private fc = null;

  repaintFloatingChartsSheet(oldZoom: number, zoom: number, sheet?: GcSpread.Sheets.Sheet) {
    if (!sheet)
      sheet = this.spread.getActiveSheet();
    if (Math.abs(oldZoom - zoom) <= 0.5) return;
    const charts = sheet.getFloatingObjects();
    const k = (zoom / oldZoom);
    for (let i = 0; i < charts.length; i++) {
      try {
        const floatChart = charts[i];
        if (i == 0)
          this.fc = floatChart;
        floatChart["options"].width *= k;
        floatChart["options"].height *= k;
        floatChart.repaint(floatChart["options"], zoom / 100);
      } catch (e) { }
    }      
  }

  // set spreadJS zoom
  private setZoom = (zoom: number) => {
    var oldZoom = this.getZoom();
    var sheet = this.spread.getActiveSheet();
    sheet.zoom(zoom / 100);
    this.repaintFloatingCharts(oldZoom, zoom);
  }

  // get spreadJS zoom
  private getZoom = (forSheet?: GcSpread.Sheets.Sheet) => {
    const sheet = (typeof forSheet == 'undefined') ? this.spread.getActiveSheet() : forSheet;
    return sheet.zoom() * 100;
  }

  // Show/hide Format toolbar
  public setVisibleToolbarFormat(value: boolean) {
    if (this.refToolbarFormat.current)
      this.refToolbarFormat.current.setVisible(value);
  }

  // Pass chart (floating object) to the Format toolbar
  // When valid chart is present - chart edit toolbar buttons are shown
  public setChartForToolbarFormat(value: any) {
    if (this.refToolbarFormat.current)
      this.refToolbarFormat.current.setChart(value);
    //
  }

  // Show/hide Find dialog
  public setVisibleDialogFind(value: boolean) {
    if (this.refDialogFind.current)
      this.refDialogFind.current.setVisible(value);
  }  

  // Legacy methods to offer or display chart edit panel or toolbar
  private panelChartEditEnable = (floatingObject) => {
    if (!!this.selectionMode) 
      return;
    this.setChartForToolbarFormat(floatingObject);
  };

  private panelChartEditDisable = () => {
    this.setChartForToolbarFormat(null); 
  };

  // Host wants to set zoom = value for an active sheet
  eventSetZoom = (value) => {
    this.setZoom(value);
  }

  private zoomValues = [25, 50, 75, 100, 125, 150, 200];

  // zoom in
  public spreadZoomIn = () => {
    var zoom_ = this.getZoom();
    var i = 0;
    while ((i < this.zoomValues.length) && (zoom_ > this.zoomValues[i])) i++;
    if (zoom_ < this.zoomValues[i]) i--;
    if (i == this.zoomValues.length - 1) return 0;
    this.setZoom(this.zoomValues[i + 1]);
    return 1;
  }

  // zoom out
  public spreadZoomOut = () => {
    var zoom_ = this.getZoom();
    var i = this.zoomValues.length - 1;
    while ((i >= 0) && (zoom_ < this.zoomValues[i])) i--;
    if (zoom_ > this.zoomValues[i]) i++;
    if (i <= 0) return 0;
    this.setZoom(this.zoomValues[i - 1]);
    return 1;
  }

  private getSelectionAddress = () => {
    const sheet = this.spread.getActiveSheet();
    const selections = sheet.getSelections();
    if (!selections || selections.length === 0)
      return null;
    const selection = getActualCellRange(selections[selections.length - 1], sheet.getRowCount(), sheet.getColumnCount());
    //console.log('getSelectionAddress() selection = ', selection)
    let position = sheet.getText(0, selection.col, spreadNS.SheetArea.colHeader)
      + sheet.getText(selection.row, 0, spreadNS.SheetArea.rowHeader);
    if (selection.colCount > 1 || selection.rowCount > 1) {
      position += ":" + sheet.getText(0, selection.col + selection.colCount - 1, spreadNS.SheetArea.colHeader)
        + sheet.getText(selection.row + selection.rowCount - 1, 0, spreadNS.SheetArea.rowHeader);
    }

    const result = { sheet: sheet._name, range: position };
    return result;
  }

  // Event triggered by SpreadJS or spread-actions
  private activeSheetChanged = (sender, args) => {
    this.activeSheetChangedProcess(args.oldSheet, args.newSheet);
  } 

  // When an active sheet changed - update bindings, hide chart toolbar (if any)
  public activeSheetChangedProcess = (prevSheet: GcSpread.Sheets.Sheet, newSheet: GcSpread.Sheets.Sheet) => {
    //updateWindowControllerZoom(args.newSheet.zoom()*100);
    if (prevSheet)
      prevSheet.unbind(spreadNS.Events.ClipboardPasted, this.clipboardPasted);
    if (!newSheet)
      newSheet = this.spread.getActiveSheet();
    if (newSheet) {
      newSheet.bind(spreadNS.Events.ClipboardPasted, this.clipboardPasted);
      this.sheetPostLoad(newSheet);
    }
    //TODO [activeSheetChanged]: handle case when we change sheet with a chart selected to a sheet with another chart selected
    this.panelChartEditDisable();
  } 

  private selectionMode: ISpreadSelectionMode = null;

  setSelectionMode(mode?: ISpreadSelectionMode) {
    this.selectionMode = mode;
    if (mode) {
      this.closeAnyWindow();
      this.platformSelectionChanged();
    }
  }

  // [Legacy naming] Hide all toolbars and spread dialogs (Find)
  public closeAnyWindow() {
    // Hide Toolbar
    this.setVisibleToolbarFormat(false);
    // Hide Find Dialog
    this.setVisibleDialogFind(false);
  }

  private selectionChanged = (sender?, args?) => {
    const selectionAddress = this.getSelectionAddress();
    if (typeof selectionAddress !== 'undefined' && selectionAddress) {
      this.refPositionBox.current.value = selectionAddress.range;
      const sheet = this.spread.getActiveSheet();
      this.spreadActions.updateFontStyle(sheet);
      const selections = sheet.getSelections();
      const selection = getActualCellRange(selections[selections.length - 1], sheet.getRowCount(), sheet.getColumnCount());
      const isChanged = sheet.hasPendingChanges();
      if ((selection.col + selection.colCount - 1) == sheet.getColumnCount() - 1)
        sheet.addColumns(sheet.getColumnCount(), 1);
      if ((selection.row + selection.rowCount - 1) == sheet.getRowCount() - 1)
        sheet.addRows(sheet.getRowCount(), 1);
      if (!isChanged)
        sheet.clearPendingChanges();
      this.platformSelectionChanged();
    } else {
      this.refPositionBox.current.value = '';
    }
    this.panelChartEditDisable();
  }

  // Later: add platform specific code?
  platformSelectionChanged() {
    if (this.selectionMode) 
      this.inputFieldSelectionChanged();
  }

  // Update selection toolbar
  // ! Legacy naming, was called as `window.setSelectionDataInputState` in spreadr-platformweb.js
  inputFieldSelectionChanged() {
    if (this.selectionMode) {
      let position = "";
      const sheet = this.spread.getActiveSheet();
      var selections = sheet.getSelections();
      // When user selects a floating object - empty selection
      if (!selections || selections.length == 0 || !selections[0]) {
        if (this.selectionMode.callback)
          this.selectionMode.callback(position, 0, 0);
        return;
      }
      // Normal selection
      const selection = getActualCellRange(selections[selections.length - 1], sheet.getRowCount(), sheet.getColumnCount());
      let rows = selection.rowCount;
      let cols = selection.colCount;
      switch (this.selectionMode.rangeType) {
        case "cell": {
          position = sheet.getValue(selection.row, selection.col).toString();
          rows = 1;
          cols = 1;
          break;
        }
        default:
        case "VarRange":
          {
            // TODO: handle single cell selected
            if (!this.selectionMode.multi) {
              cols = 1;
              position = sheet.getName() + "!" +
                sheet.getText(0, selection.col, spreadNS.SheetArea.colHeader)
                + sheet.getText(selection.row, 0, spreadNS.SheetArea.rowHeader)
                + ":" + sheet.getText(0, selection.col, spreadNS.SheetArea.colHeader)
                + sheet.getText(selection.row + selection.rowCount - 1, 0, spreadNS.SheetArea.rowHeader);
              break;
            } else {
              position = sheet.getName() + "!" +
                sheet.getText(0, selection.col, spreadNS.SheetArea.colHeader)
                + sheet.getText(selection.row, 0, spreadNS.SheetArea.rowHeader)
                + ":" + sheet.getText(0, selection.col + selection.colCount - 1, spreadNS.SheetArea.colHeader)
                + sheet.getText(selection.row + selection.rowCount - 1, 0, spreadNS.SheetArea.rowHeader);
              break;
            }

          }
      }
      if (this.selectionMode.callback)
        this.selectionMode.callback(position, cols, rows);
    }
  }
  

  // Process action (selection format, insert/delete/clear cells)
  spreadAction: SpreadActionFunc = (id: string, value: any) => {
    this.spreadActions.spreadAction(id, value);
  }

  public parserShowAnalysisResult(data: any, title: string, opts?: CoreResultsParserOpts, newSheet: boolean = true, disableAddNewSheet: boolean = false, ): boolean {
    // Default font
    const defFontSize: number = opts && opts.defFontSize || spreadDefFontSize;
    const defFont: string = opts && opts.defFont || spreadDefFont;
    const defStyleFont = defFontSize.toString() + "pt " + defFont;
    console.log('opts', opts, defFont, defFontSize)
    // 
    if (data.status == "success") {
      const spread = this.spread;
      if (newSheet) {
        spread._tab.doNewTabClick(0);
        spread.setActiveSheetIndex(spread.getSheetCount() - 1);        
      }
      if (disableAddNewSheet)
        spread.newTabVisible(false);
      const sheet = spread.getActiveSheet();
      this.sheetPostLoad(sheet);
      sheet.isPaintSuspended(true);
      this.sheetApplyCurrentTheme(sheet);
      sheet.setName(this.getNextSheetTitle(title));
      if (data.namedStyles && data.namedStyles.length)
        for (var i = 0, len = data.namedStyles.length; i < len; i++) {
          var style = new spreadNS.Style();
          style.hAlign = data.namedStyles[i].hAlign;
          style.vAlign = data.namedStyles[i].vAlign;
          style.name = data.namedStyles[i].name;
          style.formatter = data.namedStyles[i].formatter;
          style.font = defStyleFont;
          spread.addNamedStyle(style);
        }
      const defStyle = new spreadNS.Style();
      defStyle.font = defStyleFont;
      defStyle.vAlign = 2;
      // watermark?
      sheet.setDefaultStyle(defStyle);
      sheet.setColumnCount(Math.max(data.width, 20));
      sheet.setRowCount(Math.max(data.height, 200));
      if (data.frozenCols > 0) sheet.setFrozenColumnCount(data.frozenCols);
      if (data.frozenRows > 0) sheet.setFrozenRowCount(data.frozenRows);
      for (let i = 0; i < data.width; i++) {
        for (let k = 0; k < data.height; k++) {
          const cell = data.data[k][i];
          if (cell) {
            //  for direct out rec: 
            //      for (var j = 0; j < data.dataCount; j++) {
            //        for (var k = 0; k < data.height; k++) {
            //            var cell = data.data[j];
            //            var i = cell.Col; var k = cell.Row;
            var sheetCell = sheet.getCell(k, i);
            if (cell.Style) {
              sheet.setStyleName(k, i, cell.Style);
            }
            if (cell.CellFormat) {
              sheetCell.formatter(cell.CellFormat);
              sheet.setValue(k, i, cell.Value.replace(",", "."));
            }
            else
              sheet.setValue(k, i, cell.Value);
            if (cell.HexBackColor)
              sheetCell.backColor(cell.HexBackColor);
            if (cell.HexFontColor)
              sheetCell.foreColor(cell.HexFontColor);
            if (cell.HorzAlign)
              sheetCell.hAlign(cell.HorzAlign);
            if (cell.VertAlign)
              sheetCell.vAlign(cell.VertAlign);
            switch (cell.FontStyle) {
              case 0:
              case 1:
              case 2:
              case 3:
                {
                  const styleElem = this.refStyleElem.current;//document.getElementById("styleElem");
                  let cellFs = defFontSize;
                  if (cell.FontSizeInc != 0) cellFs += cell.FontSizeInc;
                  styleElem.style.font = sheetCell.font();
                  if (styleElem.style.font == undefined || cell.FontSizeInc != 0)
                    styleElem.style.font = cellFs.toString() + "pt " + defFont;
                  if (cell.FontStyle & 1)
                    styleElem.style.fontWeight = "bold";
                  if (cell.FontStyle & 2)
                    styleElem.style.fontStyle = "italic";
                  sheetCell.font(styleElem.style.font);
                  break;
                }
              case 4:
                {
                  sheetCell.textDecoration(spreadNS.TextDecorationType.Underline);
                  break;
                }
              default:
            }
            // parse color and width
            // TODO: Use BorderWidth 1 = spreadNS.LineStyle.medium, 2 = spreadNS.LineStyle.thick, 3 = spreadNS.LineStyle.double
            // just to be sure ColMerge, RowMerge will be int >= 0
            cell.ColMerge = (cell.ColMerge !== null) && (cell.ColMerge > 1) ? cell.ColMerge : 1;
            cell.RowMerge = (cell.RowMerge !== null) && (cell.RowMerge > 1) ? cell.RowMerge : 1;
            try {
              // TODO: span = null?
              const cellSpan = sheet.getSpan(k, i, null);
              let canSpan = true;
              if (cellSpan) {
                canSpan = (cellSpan.col == i) && (cellSpan.row == k);
                if (canSpan && cellSpan.rowCount && cellSpan.ColCount) {
                  if (cellSpan.colCount > cell.ColMerge) cell.ColMerge = cellSpan.colCount;
                  if (cellSpan.rowCount > cell.RowMerge) cell.RowMerge = cellSpan.rowCount;
                }
              }
              if (canSpan)
                sheet.addSpan(sheetCell.row, sheetCell.col, cell.RowMerge, cell.ColMerge);
            } catch (e) { }
            if (cell.RowMerge > 1)
              sheetCell.wordWrap(true);
            // parse border
            // TODO: check sheet._getSpanModel(spreadNS.SheetArea.viewport).find(row, col)
            if (cell.Border) {
              var sheetCellBorder = sheetCell;
              for (let ic = 0; ic < cell.ColMerge; ic++) {
                sheetCellBorder = sheet.getCell(k, i + ic);
                this.parseCellBorder(cell.Border[1], (borderline) => sheetCellBorder.borderTop(borderline));
                sheetCellBorder = sheet.getCell(k + cell.RowMerge - 1, i + ic);
                this.parseCellBorder(cell.Border[3], (borderline) => sheetCellBorder.borderBottom(borderline));
              }
              for (let ir = 0; ir < cell.RowMerge; ir++) {
                sheetCellBorder = sheet.getCell(k + ir, i);
                this.parseCellBorder(cell.Border[0], (borderline) => sheetCellBorder.borderLeft(borderline));
                sheetCellBorder = sheet.getCell(k + ir, i + cell.ColMerge - 1);
                this.parseCellBorder(cell.Border[2], (borderline) => sheetCellBorder.borderRight(borderline));
              }
            } // if (cell.Border)  { 
          } // if (cell) { 
        } // for (var k = 0; k < data.height; k++) { 
        sheet.autoFitColumn(i);
        const minWidth = 80;
        const colWidth = sheet.getColumnWidth(i);
        if (colWidth < minWidth)
          sheet.setColumnWidth(i, minWidth * 1.1);
        else
          sheet.setColumnWidth(i, colWidth * 1.1);
      } // for (var i = 0; i < data.width; i++) { 

      if (defFontSize > 10) {
        const _zoomFactor = sheet.zoom();
        var zoomedFont = _zoomFactor == 1 ? defStyle.font : spreadNS.StyleHelper._scaleFont(defStyle.font, _zoomFactor).font;
        var defH = sheet._getFontHeight(zoomedFont) + Math.ceil(3.0 / _zoomFactor);
        // do not make height less; ignore enormous values for font > 96 
        if ((defH > 20) && (defH < 100 * _zoomFactor))
          sheet.defaults.rowHeight = defH;
        // usually only the first row contains font larger than default, so we can skip the line below:
        //  for (var k = 0; k < data.height; k++); 
        sheet.autoFitRow(0);
      }
      this.sheetPostLoad(sheet);
      if (data.charts)
        for (var i = 0; i < data.charts.length; i++) {
          try {
            this.createChart(sheet, data.charts[i]);
          }
          catch (e) { }
        }
      sheet.isPaintSuspended(false);
      this.selectionChanged();
      spread._tab.doNavButtonClick(3);
      if (sheet.printInfo()) sheet.printInfo().fitPagesWide(1);
    }
    return true;
}

  // parse color and width
  private parseCellBorder(borderObj: any, cellCallback: (borderline: any) => void) {
    if (!borderObj) return;
    if (borderObj.Width) {
      const borderColor = (borderObj.Color) ? borderObj.Color : "black";
      let borderLine = 1; //$.wijmo.wijspread.LineStyle.thin;
      if (borderObj.Width == 2)
        borderLine = 2;//$.wijmo.wijspread.LineStyle.medium; OR thick = 5
      else if (borderObj.Width == 3)
        borderLine = 6;//$.wijmo.wijspread.LineStyle.double;
      cellCallback(new spreadNS.LineBorder(borderColor, borderLine));
    }
  }

  private getNextSheetTitle(title: string): string {
    if (this.spread.getSheetFromName(title) == null)
      return title;
    else
      for (let i = 1; i < 9999; i++)
        if (this.spread.getSheetFromName(title + "(" + i + ")") == null) {
          return title + "(" + i + ")";
        }
    return title;
  }  

  // findNext() last position
  private findCache;

  // Find a text in a worksheet or a workbook
  // TODO: bad legacy code, namely
  // * checkIfWorksheetContains() call only when "find in the worksheet"
  // * double search in findNextWithinWorksheet()

  public findNext = (searchInformation: ISpreadSearchInformation) => {
    const sheet = this.spread.getActiveSheet();
    this.findCache = {
      activeSheetIndex: this.spread.getActiveSheetIndex(),
      activeCellRowIndex: sheet.getActiveRowIndex(),
      activeCellColumnIndex: sheet.getActiveColumnIndex()
    };

    const getStartPosition = (searchOrder: GcSpread.Sheets.SearchOrder, cellRange: GcSpread.Sheets.Range) => {
      if (!cellRange) {
        return;
      }
      const row = cellRange.row,
        firstRow = row,
        col = cellRange.col,
        firstColumn = col,
        lastRow = row + cellRange.rowCount - 1,
        lastColumn = col + cellRange.colCount - 1;

      if (searchOrder == spreadNS.SearchOrder.ZOrder) {
        if (
          this.findCache.activeCellColumnIndex == -1 &&
          this.findCache.activeCellRowIndex == -1
        ) {
          this.findCache.rowStart = 0;
          this.findCache.columnStart = 0;
        } else if (this.findCache.activeCellColumnIndex < lastColumn) {
          this.findCache.rowStart = this.findCache.activeCellRowIndex;
          this.findCache.columnStart = this.findCache.activeCellColumnIndex + 1; //to do
        } else if (this.findCache.activeCellColumnIndex == lastColumn) {
          this.findCache.rowStart = this.findCache.activeCellRowIndex + 1;
          this.findCache.columnStart = 0;
        } else {
          this.findCache.rowStart = firstRow;
          this.findCache.columnStart = firstColumn;
        }
      } // by columns
      else {
        if (
          this.findCache.activeCellColumnIndex == -1 &&
          this.findCache.activeCellRowIndex == -1
        ) {
          this.findCache.rowStart = 0;
          this.findCache.columnStart = 0;
        } else if (this.findCache.activeCellRowIndex < lastRow) {
          this.findCache.rowStart = this.findCache.activeCellRowIndex + 1;
          this.findCache.columnStart = this.findCache.activeCellColumnIndex;
        } else if (this.findCache.activeCellRowIndex == lastRow) {
          this.findCache.rowStart = 0;
          this.findCache.columnStart = this.findCache.activeCellColumnIndex + 1;
        } else {
          this.findCache.rowStart = firstRow;
          this.findCache.columnStart = firstColumn;
        }
      }
    }

    const findWithinWorksheet = (searchInformation, sheet: GcSpread.Sheets.Sheet) => {
      const rowCount = sheet.getRowCount(),
        columnCount = sheet.getColumnCount(),
        endRow = rowCount - 1,
        endColumn = columnCount - 1;

      getStartPosition(
        searchInformation.SearchOrder,
        new spreadNS.Range(0, 0, rowCount, columnCount)
      );

      const searchCondition = new spreadNS.SearchCondition();
      searchCondition.searchString = searchInformation.SearchString;
      searchCondition.searchFlags = searchInformation.SearchFlags;
      searchCondition.searchOrder = searchInformation.SearchOrder;
      searchCondition.searchTarget = searchInformation.SearchFoundFlags;
      searchCondition.sheetArea = spreadNS.SheetArea.viewport;
      searchCondition.rowStart = this.findCache.rowStart;
      searchCondition.columnStart = this.findCache.columnStart;
      searchCondition.rowEnd = endRow;
      searchCondition.columnEnd = endColumn;

      const result = sheet.search(searchCondition);
      const row = result.foundRowIndex;
      const col = result.foundColumnIndex;

      this.findCache.findRowIndex = row;
      this.findCache.findColumnIndex = col;

      return row != -1 && col != -1;
    }

    const checkIfWorksheetContains = (searchInformation, sheet) => {
      // TODO: ?
      const searchCondition = new GcSpread.Sheets.SearchCondition();
      searchCondition.searchString = searchInformation.SearchString;
      searchCondition.searchFlags = searchInformation.SearchFlags | GcSpread.Sheets.SearchFlags.BlockRange;
      searchCondition.searchOrder = searchInformation.SearchOrder;
      searchCondition.searchTarget = searchInformation.SearchFoundFlags;
      searchCondition.sheetArea = spreadNS.SheetArea.viewport;
      var result = sheet.search(searchCondition);
      const findRow = result.foundRowIndex;
      const findColumn = result.foundColumnIndex;
      return (findRow != -1 && findColumn != -1);
    }

    const markFindCell = (sheet: GcSpread.Sheets.Sheet, row: number, col: number) => {
      sheet.setActiveCell(row, col); // === sheet.setSelection(row, col, 1, 1);
      sheet.showCell(
        row,
        col,
        3, //nearest
        3 //nearest
      );      
      this.selectionChanged();
      // Manually update formula text box (setActiveCell does not trigger this)
      try {
        this.spreadFormulaTextBox.text(sheet.getCell(row, col).value())
      } catch {
        //
      }
    }    

    const findNextWithinWorksheet = (searchInformation, sheet) => {
      this.findCache.findRowIndex = -1;
      this.findCache.findColumnIndex = -1;
      const found = findWithinWorksheet(searchInformation, sheet);
      if (found) {
        this.findCache.activeCellRowIndex = this.findCache.findRowIndex;
        this.findCache.activeCellColumnIndex = this.findCache.findColumnIndex;
        markFindCell(sheet, this.findCache.findRowIndex,  this.findCache.findColumnIndex);
        return true;
      } else {
        this.findCache.activeCellRowIndex = -1;
        this.findCache.activeCellColumnIndex = -1;
        return findWithinWorksheet(searchInformation, sheet);
      }
    }

    // List of sheets *starting from the active*
    const getFindWorksheetList = () => {
      let worksheetList = [];
      const startFindSheetIndex = this.findCache.activeSheetIndex;
      for (let i = startFindSheetIndex; i < this.spread.sheets.length; i++) {
        worksheetList.push(this.spread.sheets[i]);
      }
      for (let j = 0; j < startFindSheetIndex; j++) {
        worksheetList.push(this.spread.sheets[j]);
      }
      return worksheetList;
    }

    const findNextWithinWorkbook = (sheet) => {
      const worksheetList = getFindWorksheetList();
      this.findCache.findRowIndex = -1;
      this.findCache.findColumnIndex = -1;
      this.findCache.findSheetIndex = -1;

      for (let i = 0; i < worksheetList.length; i++) {
        const worksheet = worksheetList[i];

        const sheetIndex = this.spread.sheets.indexOf(worksheet);

        // reset start position for a new sheet
        if (sheetIndex != this.spread.getActiveSheetIndex()) {
          this.findCache.activeCellRowIndex = -1;
          this.findCache.activeCellColumnIndex = -1;
        }

        const found = findWithinWorksheet(searchInformation, worksheet);

        if (found) {
          this.findCache.findSheetIndex = sheetIndex;
          break;
        }
      }

      if (this.findCache.findSheetIndex != -1) {
        this.findCache.activeSheetIndex = this.findCache.findSheetIndex;
        const row = (this.findCache.activeCellRowIndex = this.findCache.findRowIndex);
        const col = (this.findCache.activeCellColumnIndex = this.findCache.findColumnIndex);
        this.spread.setActiveSheetIndex(this.findCache.findSheetIndex);
        markFindCell(this.spread.getActiveSheet(), row, col);
        return true;
      } else {
        return findNextWithinWorksheet(searchInformation, sheet);
      }
    }

    // Main proc
    // Within Worksheet
    if (searchInformation.WithinWorksheet) {
      if (!checkIfWorksheetContains(searchInformation, sheet)) {
        this.findCache.findRowIndex = -1;
        this.findCache.findColumnIndex = -1;
        this.findCache.findSheetIndex = -1;
        return false;
      }
      const found = findNextWithinWorksheet(searchInformation, sheet);
      if (found) {
        const col = (this.findCache.activeCellColumnIndex = this.findCache.findColumnIndex);
        const row = (this.findCache.activeCellRowIndex = this.findCache.findRowIndex);
        markFindCell(sheet, row, col);
      }
      this.findCache.findSheetIndex = this.spread.getActiveSheetIndex();
      return found;
    } else {
      return findNextWithinWorkbook(sheet);
    }
  }  

  // HTML IDs
  private idSpread = newId("spread");
  // TODO: УДАЛИТЬ ВСЕ после сравнения spreadToJson vs spreadToJsonOld
  private idSpreadToSave= "ssForSave";

  shouldComponentUpdate() {
    return false;
  }

  render() {

    console.error('************************************** RENDER. MUST BE DONE ONLY ONCE. <<<<<<<<<<<<')

    return (
      <SpreadAppContext.Consumer>
        {
          context => (
            <>
              <div id="" className="pusher" style={{ width: '100%', height: 'calc(100% - 50px)' }}>
                <input id="styleElem" type="text" ref={this.refStyleElem} />
                <div id="formulaBar" className="formulaBarConteiner" ref={this.refFormulaBar}>
                  <table>
                    <tbody>
                      <tr>
                        <td width="10%">
                          {/* id="positionbox" */}
                          <input type="text" readOnly ref={this.refPositionBox} />
                        </td>
                        <td className="noselect">
                          <img id="office-splitter" alt=":" />
                        </td>
                        <td width="90%">
                          {/* id="formulabox"  */}
                          <div className="formulaBox" contentEditable="true" spellCheck="false" ref={this.refFormulaElem}></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div
                  id={this.idSpread}
                  ref={this.refSpread}
                  className="spreadcomponent"
                  style={{ height: "calc(100% - 30px)" }}
                  onContextMenu={this.onSpreadContext}
                ></div>
              </div>

              <div id={this.idSpreadToSave} style={{ display: 'none' }}></div>

              <SpreadToolbarFormat
                ref={this.refToolbarFormat}
                action={this.spreadAction}

                // TODO: prop drilling! remove
                openDialogPrompt={this.props.openDialogPrompt}

                uitheme={context.uitheme}
              />
              <SpreadDialogFind
                ref={this.refDialogFind}
                findNext={this.findNext}

                uitheme={context.uitheme}
              />
              <ContextualMenuSpread
                ref={this.refSpreadMenu}
              />
            </>
          )}
      </SpreadAppContext.Consumer>
    );
  }
  
}

SpreadComponent.contextType = SpreadAppContext;