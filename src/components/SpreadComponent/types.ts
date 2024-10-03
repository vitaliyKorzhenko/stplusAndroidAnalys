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

export interface ISpreadComponentProps extends ISpreadComponentBaseProps {
    openDialogPrompt: any;
}

export interface ISpreadSelectionMode {
    rangeType: string;
    multi: boolean;
    useLabel: boolean;

    callback: (position: string, cols: number, rows: number) => void;
}

export interface ISpreadComponentState {
}