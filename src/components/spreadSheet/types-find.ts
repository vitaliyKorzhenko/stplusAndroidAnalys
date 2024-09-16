/*

    Types for the Find dialog.

*/

export interface ISpreadSearchInformation {
    WithinWorksheet: boolean;
    SearchString: string;
    SearchFlags: number;
    SearchOrder: GcSpread.Sheets.SearchOrder;
    SearchFoundFlags: GcSpread.Sheets.SearchFoundFlags;
};

export type SearchFunc = (searchInformation: ISpreadSearchInformation) => boolean;