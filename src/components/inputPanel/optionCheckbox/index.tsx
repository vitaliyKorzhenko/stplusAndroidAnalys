import * as React from "react";
import { Switch } from "@fluentui/react-components";
import { IOptionItem } from "../../../types/options";
import { ChildOptionCheckbox } from "../childOptionCheckBox";
import { OptionNumberInput } from "../optionNumberInput";
import { OptionStringInput } from "../optionStringInput";
import { IMainOtionItem } from "../types/optionProps";

export interface OptionCheckboxProps extends IMainOtionItem {
    option: IOptionItem;
    childOptions?: IOptionItem[];
}

export const OptionParentCheckbox = (props: OptionCheckboxProps) => {

 const [checked, setChecked] = React.useState(props.option.currentvalue.toString() == 'true' ? true : props.option.value == 'true' ? true : false);
    return ( 
        <>
    <Switch
    // shape="circular"
    label={props.option.name}
    checked={checked}
    onChange={(_event) => {
        setChecked(!checked);
        let newOtion = props.option;
        newOtion.currentvalue = checked ? 'false' : 'true';
        props.addOptionElement(props.selectedTab, newOtion);
    }}
    />
    <div style={{marginLeft: '20px'}}>
    {props.childOptions && props.childOptions.map((childOption: IOptionItem, index: number) => (
       childOption.nodename == 'checkbox' ?
       <div>
       <ChildOptionCheckbox
         key={index}
            option={childOption}
            isVisble={checked}
            addOptionElement={props.addOptionElement}
            selectedTab={props.selectedTab}
         />
         </div>
         :
         childOption.nodename == 'number' || childOption.nodename == 'numberint' ?
            <OptionNumberInput
            key={index}
            option={childOption}
            isVisible={checked}
            addOptionElement={props.addOptionElement}
            selectedTab={props.selectedTab}
            />
            :
            childOption.nodename == 'string' ?
            <OptionStringInput
            key={index}
            option={childOption}
            addOptionElement={props.addOptionElement}
            selectedTab={props.selectedTab}
            />
            :
            <></>
        
    ))}
    </div>
    </> 
    )
}
