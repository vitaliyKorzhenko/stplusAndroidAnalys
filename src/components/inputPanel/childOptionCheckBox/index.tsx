import * as React from "react";
import { Switch } from "@fluentui/react-components";
import { IOptionItem } from "../../../types/options";
import { IMainOtionItem } from "../types/optionProps";

export interface OptionChildCheckboxProps extends IMainOtionItem {
    option: IOptionItem;
    isVisble: boolean;
}

export const ChildOptionCheckbox = (props: OptionChildCheckboxProps) => {

const [checked, setChecked] = React.useState(props.option.currentvalue.toString() == 'true' ? true : props.option.value == 'true' ? true : false);

 if (props.isVisble) {

    return ( 
    <Switch
    label={props.option.name}
    checked={checked}
    onChange={(_event) => {
        setChecked(!checked);
        let newOtion = props.option;
        newOtion.currentvalue = checked ? 'false' : 'true';
        props.addOptionElement(props.selectedTab, newOtion);
    }}
    />
    )
} else {
    return <></>;
}
}
