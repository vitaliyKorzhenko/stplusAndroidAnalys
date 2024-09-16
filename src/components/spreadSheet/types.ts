/*
    Interfaces used by SpreadComponent

*/



// Spread input/output format
export interface SpreadComponentJson {
    workbook: any;
    charts: any;
}

export interface ISpreadDataProvider {
    loadData: () => Promise<string>;
    saveData: (dataJsonString: string) => void;
}

export interface ISpreadComponentBaseProps {
    dataProvider: ISpreadDataProvider;
}

//disable empty interface rule
/* eslint-disable @typescript-eslint/no-empty-interface */
export interface ISpreadComponentProps extends ISpreadComponentBaseProps {
   
}

export interface ISpreadSelectionMode {
    rangeType: string;
    multi: boolean;
    useLabel: boolean;

    callback: (position: string, cols: number, rows: number) => void;
}

export interface ISpreadComponentState {
}

/*
    Spread options
*/
export interface SpreadComponentOptions {
    /*
        Make newer spread exports compatible with old versions that cannot handle user zoom (pinch).
    */
    zoomCompatibility?: {
        enableOnLoad: boolean;
        disableOnSave: boolean;
    }
    openReadOnly: boolean; 
    host: {
        handlesUndo: boolean;
    }
}


/*
    Spread is in the Selection Mode when a user must select a range as a data-source.
    Use should not be allowed to edit data (not implemented yet) or make changes (hide context menus).
*/
export interface ISpreadSelectionMode {
    rangeType: string;
    multi: boolean;
    useLabel: boolean;

    callback: (position: string, cols: number, rows: number) => void;
}

