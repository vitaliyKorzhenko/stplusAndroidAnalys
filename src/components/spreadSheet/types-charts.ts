/*
    Types for floating charts
*/

export interface IChartSpreadOptionAxis {
    label: string;
    majorunit: number;
    max: number;
    min: number;
    gridlines?: boolean;
    categories?: any;
}

export interface IChartSpreadOptions {
    version?: number;

    axis: {
        x: IChartSpreadOptionAxis;
        y: IChartSpreadOptionAxis;
    },
    
    /* Location */
    // Start column
    col: number;
    // Start row
    row: number;
    // Position in px, ignored in older spread component versions (iPad, Mac)
    position?: { x: number, y: number}


    /* 
        Size in px (scaled) .
        To be removed when iPad/Mac version won't use old SpreadView/Table.html
    */
    height?: number;
    width?: number;

    /*
        Size in sheet units (px when zoom is 100%) and thus immutable to zoom level.
        @size has higher priority than @height/@width but may be missing in older workbooks.
    */
    size?: {
        width: number;
        height: number;
    }

    /*
        Zoom 
    */
    zoom?: number;

    /* Legend location, 0 if hidden. TODO: type */
    legend: number;

    /* Chart series. TODO: type */
    series?: Array<any>;

    /* Chart title */
    title: string;

    /* 
    
        Size in cells, used only when a chart is created. 
        These parameters are not updated, but may be used for a spread component w/o dynamic floating objects.
    */
    cheight: number;
    cwidth: number;
}