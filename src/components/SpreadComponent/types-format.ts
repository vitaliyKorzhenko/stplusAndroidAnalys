/*
    
    Selection format interface.

*/
/// <reference path="gcspread.sheets.d.ts" />

export interface ISpreadSelectionFormat {
    fontSize: number;
    fontName: string;
    colorFont: string;  
    colorFill: string;
  
    isBold: boolean;
    isItalic: boolean;
    isUnderline: boolean;

    canMerge: boolean;
  
    vAlign: GcSpread.Sheets.VerticalAlign; /* or number */
    hAlign: GcSpread.Sheets.HorizontalAlign; /* or number */

    isBorderTop: boolean;
    isBorderBottom: boolean;
    isBorderLeft: boolean;
    isBorderRight: boolean;

    // Undo/Redo
    canUndo: boolean;
    canRedo: boolean;
}

export interface IChartSpreadOptionAxis {
    label: string;
    majorunit: number;
    max: number;
    min: number;
    gridlines?: boolean;
    categories?: any;
}

export interface IChartSpreadOptions {
    axis: {
        x: IChartSpreadOptionAxis;
        y: IChartSpreadOptionAxis;
    },
    cheight: number;
    col: number;
    cwidth: number;
    height: number;
    legend: number;
    row: number;
    series?: Array<any>;
    title: string;
    width: number;
}