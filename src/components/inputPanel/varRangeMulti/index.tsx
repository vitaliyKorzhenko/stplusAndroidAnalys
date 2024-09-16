import * as React from "react";
import {
    Button,
    Combobox,
    Label,
    makeStyles,
    Option,
    shorthands,
    tokens,
    useId,
} from "@fluentui/react-components";
import type { ComboboxProps } from "@fluentui/react-components";
import {
     Dismiss12Regular, 
    SelectObject20Filled,
    AddSquareRegular,
} from "@fluentui/react-icons";
import { translate } from "../../../localization/localization";
import { InfoLabel } from "../../InfoLabel";

const useStyles = makeStyles({
    root: {
        // Stack the label above the field with a gap
        display: "grid",
        gridTemplateRows: "repeat(1fr)",
        justifyItems: "start",
        ...shorthands.gap("2px"),
        width: "100%",
    },
    tagsList: {
        listStyleType: "none",
        marginBottom: tokens.spacingVerticalXXS,
        marginTop: 0,
        paddingLeft: 0,
        display: "flex",
        gridGap: tokens.spacingHorizontalXXS,
    },
});

export interface VarRangeMultiProps {
    options: { key: string; text: string }[];

    label: string;
    description: string;

}

export const VarRangeMulti = (props: Partial<VarRangeMultiProps>) => {
    // generate ids for handling labelling
    const comboId = useId("combo-multi");
    const selectedListId = `${comboId}-selection`;

    // refs for managing focus when removing tags
    const selectedListRef = React.useRef<HTMLUListElement>(null);
    const comboboxInputRef = React.useRef<HTMLInputElement>(null);

    let options: string[] = [];
    if (props.options) {
        options = props.options.map((option) => option.text);
    }
    const styles = useStyles();

    // Handle selectedOptions both when an option is selected or deselected in the Combobox,
    // and when an option is removed by clicking on a tag
    const [selectedOptions, setSelectedOptions] = React.useState<string[]>([]);

    const onSelect: ComboboxProps["onOptionSelect"] = (_event, data) => {
        setSelectedOptions(data.selectedOptions);
    };

    const onTagClick = (option: string, index: number) => {
        // remove selected option
        setSelectedOptions(selectedOptions.filter((o) => o !== option));

        // focus previous or next option, defaulting to focusing back to the combo input
        const indexToFocus = index === 0 ? 1 : index - 1;
        const optionToFocus = selectedListRef.current?.querySelector(
            `#${comboId}-remove-${indexToFocus}`
        );
        if (optionToFocus) {
            (optionToFocus as HTMLButtonElement).focus();
        } else {
            comboboxInputRef.current?.focus();
        }
    };

    const labelledBy =
        selectedOptions.length > 0 ? `${comboId} ${selectedListId}` : comboId;

    return (
        <div className={styles.root}>
            <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    width: '100%',
}}>
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '5px', 
        flex: 1,  // Занимает всю доступную ширину
    }}>
        <Label required={true}>{props.label}</Label>
        <InfoLabel description={props.description ?? ''} />
    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button 
            size="medium"
            appearance="subtle" 
            icon={<SelectObject20Filled />}
            style={{ marginRight: '2px' }} // Небольшой отступ между кнопками
        >
        {translate('ui.range.cols', 'Cols')}
        </Button>
        <Button 
            size="medium"
            appearance="subtle"
            icon={<AddSquareRegular />}
        >
        {translate('ui.range.range', 'Range')}
        </Button>
    </div>
</div>


            {selectedOptions.length ? (
                <ul
                    id={selectedListId}
                    className={styles.tagsList}
                    ref={selectedListRef}
                >
                    {/* The "Remove" span is used for naming the buttons without affecting the Combobox name */}
                    <span id={`${comboId}-remove`} hidden>
                        Remove
                    </span>
                    {selectedOptions.map((option, i) => (
                        <li key={option}>
                            <Button
                                size="small"
                                shape="circular"
                                appearance="primary"
                                icon={<Dismiss12Regular />}
                                iconPosition="after"
                                onClick={() => onTagClick(option, i)}
                                id={`${comboId}-remove-${i}`}
                                aria-labelledby={`${comboId}-remove ${comboId}-remove-${i}`}
                            >
                                {option}
                            </Button>
                        </li>
                    ))}
                </ul>
            ) : null}
            <Combobox
                aria-labelledby={labelledBy}
                multiselect={true}
                placeholder="Numeric variables"
                selectedOptions={selectedOptions}
                onOptionSelect={onSelect}
                ref={comboboxInputRef}
                {...props}
                style={{ width: "100%" }}
            >
                {options.map((option) => (
                    <Option key={option}>{option}</Option>
                ))}
            </Combobox>
        </div>
    );
};