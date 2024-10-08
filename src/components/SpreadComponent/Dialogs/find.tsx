import React from 'react';
import { Checkbox, Dialog, DialogTrigger, DialogBody, DialogTitle, DialogContent, DialogActions, Dropdown, Option, Field, Button, Input, makeStyles, shorthands, DialogSurface } from '@fluentui/react-components';
import { SearchRegular } from '@fluentui/react-icons';
import { ISpreadSearchInformation, SearchFunc } from '../types-find';

export interface ISpreadDialogFindProps {
    findNext: SearchFunc;
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

const useStyles = makeStyles({
    dialogWidth: {
        maxWidth: '420px',
        width: 'auto',
    },
    stackItemHalfSize: {
        width: '50%',
    },
    fullWidth: {
        width: '100%',
    },
    dialogContent: {
        display: 'flex',
        flexDirection: 'column',
        ...shorthands.gap('10px'),
    },
});

export const SpreadDialogFind: React.FC<ISpreadDialogFindProps> = ({ findNext }) => {
    const styles = useStyles();
    const [state, setState] = React.useState<ISpreadDialogFindState>({
        visible: false,
        errorMessage: '',
        searchString: '',
        optionWithinWorkbook: false,
        optionByColumns: false,
        optionMatchCase: false,
        optionMatchExactly: false,
        optionWildcards: false,
        optionLookupFormulas: false,
    });

    const handleSearch = () => {
        const searchInformation: ISpreadSearchInformation = getSearchInformation();
        if (!searchInformation || !searchInformation.SearchString) {
            setState((prevState) => ({ ...prevState, errorMessage: "Enter a search value that contains at least one character." }));
            return;
        }
        const found = findNext(searchInformation);
        setState((prevState) => ({ ...prevState, errorMessage: found ? null : "Cannot find the data you are searching for." }));
    };

    const getSearchInformation = (): ISpreadSearchInformation => {
        const searchOrder = state.optionByColumns ? 'NOrder' : 'ZOrder';
        let flags = 0;
        if (!state.optionMatchCase) flags |= 1; // IgnoreCase
        if (state.optionMatchExactly) flags |= 2; // ExactMatch
        if (state.optionWildcards) flags |= 4; // UseWildCards

        let foundFlags = 1; // CellText
        if (state.optionLookupFormulas) foundFlags |= 2; // CellFormula

        return {
            WithinWorksheet: !state.optionWithinWorkbook,
            SearchString: state.searchString,
            SearchFlags: flags,
            SearchOrder: searchOrder,
            SearchFoundFlags: foundFlags,
        };
    };

    return (
        <Dialog modalType="modal" open={state.visible} onOpenChange={() => setState({ ...state, visible: !state.visible })}>
            <DialogTrigger>
                <Button icon={<SearchRegular />} appearance="primary">
                    Find
                </Button>
            </DialogTrigger>
            <DialogSurface className={styles.dialogWidth}>
                <DialogBody>
                    <DialogTitle>Find</DialogTitle>
                    <DialogContent className={styles.dialogContent}>
                        <Field label="Search">
                            <Input
                                value={state.searchString}
                                onChange={(e) => setState({ ...state, searchString: e.target.value, errorMessage: null })}
                                aria-label="Search"
                            />
                        </Field>
                        <Field label="Within">
                            <Dropdown
                                selectedKey={state.optionWithinWorkbook ? '1' : '0'}
                                onOptionSelect={(e, data) => setState({ ...state, optionWithinWorkbook: data.optionValue === '1' })}
                            >
                                <Option key="0" value="0">
                                    Worksheet
                                </Option>
                                <Option key="1" value="1">
                                    Workbook
                                </Option>
                            </Dropdown>
                        </Field>
                        <Field label="Search by">
                            <Dropdown
                                selectedKey={state.optionByColumns ? '1' : '0'}
                                onOptionSelect={(e, data) => setState({ ...state, optionByColumns: data.optionValue === '1' })}
                            >
                                <Option key="0" value="0">
                                    Rows
                                </Option>
                                <Option key="1" value="1">
                                    Columns
                                </Option>
                            </Dropdown>
                        </Field>
                        <Checkbox
                            label="Match case"
                            checked={state.optionMatchCase}
                            onChange={(e, data) => setState({ ...state, optionMatchCase: !!data.checked })}
                        />
                        <Checkbox
                            label="Match exactly"
                            checked={state.optionMatchExactly}
                            onChange={(e, data) => setState({ ...state, optionMatchExactly: !!data.checked })}
                        />
                        <Checkbox
                            label="Use wildcards"
                            checked={state.optionWildcards}
                            onChange={(e, data) => setState({ ...state, optionWildcards: !!data.checked })}
                        />
                        <Checkbox
                            label="Look in formulas"
                            checked={state.optionLookupFormulas}
                            onChange={(e, data) => setState({ ...state, optionLookupFormulas: !!data.checked })}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button appearance="primary" onClick={handleSearch}>
                            Find Next
                        </Button>
                    </DialogActions>
                </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};
