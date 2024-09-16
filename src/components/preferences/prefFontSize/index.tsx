import { Label, Select } from "@fluentui/react-components";
import { IPreferencesOptions } from "../types";
import React from "react";


interface IPrefFontProps {
    option: IPreferencesOptions;
    name: string;
    updatePrefsOptions: (sectionName: string, item: IPreferencesOptions, newValue: string) => void;
}


export const PrefFontSize = (props: IPrefFontProps) => {

  const [selectedValue, setSelectedValue] = React.useState<string>(props.option.value);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'  }}>
      <Label size="medium" style={{fontWeight: 'bold'}}>{props.option.name}</Label>
      <Select 
      style={{
        width: '350px'
      
      }}
      defaultValue={selectedValue}
      onChange={(_ev, data) => {
        setSelectedValue(data.value as string);
        props.updatePrefsOptions(props.name, props.option, data.value);
      }}
      >
        {
            props.option.select.split('\\n').map((item: string) => {
                return <option key={item} value={item}>{item}</option>
            })
        }
      </Select>
    </div>
  );
};