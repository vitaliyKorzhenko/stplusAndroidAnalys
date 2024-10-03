/*

  Find dialog for the spread component.

  TODO: persist options selection in a session.

*/

import React from 'react';

import { Checkbox, ContextualMenu, DefaultButton, Dialog, DialogFooter, DialogType, Dropdown, IDialogContentProps, IDropdownOption, IModalProps, ITextField, mergeStyleSets, PrimaryButton, ResponsiveMode, Stack, TextField, } from 'office-ui-fabric-react';
import { IUITheme } from 'src/types';
import { translate } from '../../../../../shared/localization/localization';
import { ISpreadSearchInformation, SearchFunc } from '../types-find';

export interface ISpreadDialogFindProps {
    findNext: SearchFunc;
    // Move to context
    uitheme: IUITheme;
}

export interface ISpreadDialogFindState {
    visible: boolean;
    errorMessage?: string;

    searchString: string;
    optionWithinWorkbook: boolean;
    optionByColumns: boolean;
    optionMatchCase: boolean;
    optionMatchExactly: boolean;
    optionWildcards: boolean;
    optionLookupFormulas: boolean;
}

export class SpreadDialogFind extends React.Component<ISpreadDialogFindProps, ISpreadDialogFindState>{
    
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            errorMessage: null,

            searchString: '',
            optionWithinWorkbook: false,
            optionByColumns: false,
            optionMatchCase: false,
            optionMatchExactly: false,
            optionWildcards: false,
            optionLookupFormulas: false,
        }
    }

    private refTextField = React.createRef<ITextField>();

    // not used if text is in the state: private refTextSearchField = React.createRef<ITextField>();

    public setVisible(value: boolean) {
        this.setState({ visible: value });
    }

    public close = (ev?: any) => {
        this.setState({
            visible: false,
            errorMessage: null,
         });
    }

    private getSearchInformation = (): ISpreadSearchInformation => {
        // Search by rows or columns?
        const searchOrder = this.state.optionByColumns ? GcSpread.Sheets.SearchOrder.NOrder : GcSpread.Sheets.SearchOrder.ZOrder;
        // Flags
        let flags = 0;
        // If not "Match Case" -> Ignore Case
        if (!this.state.optionMatchCase)
            flags |= GcSpread.Sheets.SearchFlags.IgnoreCase;
        // Match Exactly
        if (this.state.optionMatchExactly)
            flags |= GcSpread.Sheets.SearchFlags.ExactMatch;
        // Match Exactly
        if (this.state.optionWildcards)
            flags |= GcSpread.Sheets.SearchFlags.UseWildCards;

        // Search in values or also in formulas?
        // NOTE: Legacy code looked up EITHER in values OR in formulas.
        let foundFlags = GcSpread.Sheets.SearchFoundFlags.CellText;
        if (this.state.optionLookupFormulas)
            foundFlags |= GcSpread.Sheets.SearchFoundFlags.CellFormula;
        return {
            WithinWorksheet: !this.state.optionWithinWorkbook,
            SearchString: this.state.searchString,
            SearchFlags: flags,
            SearchOrder: searchOrder,
            SearchFoundFlags: foundFlags,
        }
    }


    public findNext = () => {
        const searchInformation: ISpreadSearchInformation = this.getSearchInformation();
        if (!searchInformation || !searchInformation.SearchString) {
            this.setState({ errorMessage: "Enter a search value that contains at least one character." });
            return;
        }      
        const found = this.props.findNext(searchInformation);
        this.setState({errorMessage: found ? null : "Cannot find the data you are searching for."});
    }

    private readonly textWithinWorkbook = translate("ui.label.find.workbook", "Workbook");
    private readonly textWithinWorksheet = translate("ui.label.find.worksheet", "Worksheet");
    private readonly textSearchbyRows = translate("ui.label.find.rows", "Rows");
    private readonly textSearchbyCols = translate("ui.label.find.columns", "Columns");

    // TODO: prepare localization
    private readonly textLookinFormulas = translate("ui.label.find.lookin", "Look in") + ' ' + translate("ui.label.find.formulas", "Formulas").toLowerCase();


    render() {
        const parentWidth = window.innerWidth;
        // Make dialog width a little more so the all checkboxes will fit in one line
        // Fluent React sets maxWidth of the modal to 340, this makes max usable inner.width ~< 300px
        // But skip this adjustment on small screens like phones in portait orientation
        // (Fluent also sets dialog size to 288px in this case)
        const adjustDialogSize = parentWidth > 480;
        const dialogWidthInner = adjustDialogSize ? "360px" : null;
        const dialogMaxModalWidth = adjustDialogSize ? "420px !important" : null;
        const dialogModalWidth = adjustDialogSize ? "auto !important" : null;
        // if (!this.state.visible)
        //     return <></>;
        const dialogContentProps: IDialogContentProps = {
            type: DialogType.close,
            title: translate("ui.label.find", "Find"),
            styles: { inner: { width: dialogWidthInner }},
          };
        const dragOptions = {
            moveMenuItemText: 'Move',
            closeMenuItemText: 'Close',
            menu: ContextualMenu,
        };

        const modalProps: IModalProps = {
            styles: { main: { maxWidth: dialogMaxModalWidth, width: dialogModalWidth } },
            isModeless: true,
            dragOptions: dragOptions,
        };
        const styleStackItemHalfSize = { root: { width: "50%" } };
        const styleStack100w = { root: { width: "100%" } };
        const stackTokens10 = { childrenGap: 10 };

        return (<Dialog
            hidden={!this.state.visible}
            onDismiss={this.close}
            dialogContentProps={dialogContentProps}
            modalProps={modalProps}
        >
            <Stack
                tokens={{ childrenGap: 10 }}
            >
                <TextField
                    componentRef={this.refTextField}
                    autoFocus={true}
                    // see note at refTextSearchField declaration // componentRef={this.refTextSearchField}
                    onKeyUp={e => {
                        try { if (e.key === "Enter") { this.findNext(); } } catch (e) { /* nothing */ }
                    }}
                    onChange={(e, newValue?: string) => this.setState({ searchString: newValue, errorMessage: null })}
                    errorMessage={this.state.errorMessage}
                    multiline={false}
                />
                <Stack
                    horizontal={true}
                    tokens={stackTokens10}
                    styles={styleStack100w}
                >
                    <Stack.Item styles={styleStackItemHalfSize}>
                        <Dropdown
                            options={[
                                { text: this.textWithinWorksheet, key: 0 },
                                { text: this.textWithinWorkbook, key: 1 },
                            ]}
                            label={translate("ui.label.find.within", "Within")}
                            multiSelect={false}
                            selectedKey={this.state.optionWithinWorkbook ? 1 : 0}
                            responsiveMode={ResponsiveMode.large}
                            onChange={(e, option?: IDropdownOption, index?: number) => option && this.setState({ optionWithinWorkbook: option.key == 1, errorMessage: null }) }
                        />
                    </Stack.Item>
                    <Stack.Item styles={styleStackItemHalfSize}>
                        <Dropdown
                            options={[
                                { text: this.textSearchbyRows, key: 0 },
                                { text: this.textSearchbyCols, key: 1 },
                            ]}
                            label={translate("ui.label.find.searchby","Search by")}
                            multiSelect={false}
                            selectedKey={this.state.optionByColumns ? 1 : 0}
                            responsiveMode={ResponsiveMode.large}
                            onChange={(e, option?: IDropdownOption, index?: number) => option && this.setState({ optionByColumns: option.key == 1, errorMessage: null }) }
                        />
                    </Stack.Item>
                </Stack>
                <Stack horizontal
                    styles={styleStack100w}
                    tokens={stackTokens10}>
                    <Stack.Item styles={styleStackItemHalfSize}>
                        <Checkbox
                            label={translate("ui.label.find.matchcase", "Match case")}
                            checked={this.state.optionMatchCase}
                            onChange={(ev?, checked?: boolean) => this.setState({ optionMatchCase: !!checked, errorMessage: null })}
                        />
                    </Stack.Item>
                    <Stack.Item styles={styleStackItemHalfSize}>
                        <Checkbox
                            label={translate("ui.label.find.matchexactly", "Match exactly")}
                            checked={this.state.optionMatchExactly}
                            onChange={(ev?, checked?: boolean) => this.setState({ optionMatchExactly: !!checked, errorMessage: null })}
                        />
                    </Stack.Item>
                </Stack>
                <Stack horizontal
                    styles={styleStack100w}
                    tokens={stackTokens10}>
                    <Stack.Item styles={styleStackItemHalfSize}>
                        <Checkbox
                            label={translate("ui.label.find.matchusewildcards", "Use wildcards")}
                            checked={this.state.optionWildcards}
                            onChange={(ev?, checked?: boolean) => this.setState({ optionWildcards: !!checked, errorMessage: null })}
                        />
                    </Stack.Item>
                    <Stack.Item styles={styleStackItemHalfSize}>
                        <Checkbox
                            label={this.textLookinFormulas}
                            checked={this.state.optionLookupFormulas}
                            onChange={(ev?, checked?: boolean) => this.setState({ optionLookupFormulas: !!checked, errorMessage: null })}
                        />
                    </Stack.Item>
                </Stack>
            </Stack>
            <DialogFooter>
                {/* NOTE: DefaultButton if there is Cancel button */}
                <PrimaryButton onClick={this.findNext} text={translate("ui.label.find.findnext", "Find Next")} />
                {/* <PrimaryButton onClick={this.close} text="Cancel" /> */}
            </DialogFooter>
        </Dialog>);
    }
}