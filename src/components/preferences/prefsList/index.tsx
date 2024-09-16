import * as React from "react";
import { Label, Select } from "@fluentui/react-components";
import { IPreferencesOptions } from "../types";


interface IPrefsListProps {
  option: IPreferencesOptions;
  name: string;
  updatePrefsOptions: (sectionName: string, item: IPreferencesOptions, newValue: any) => void;
}


export const PrefsList = (props: IPrefsListProps) => {
  const [values] = React.useState<string[]>(props.option.value.split('\\n'));
  const [selectedValue, setSelectedValue] = React.useState<string>(props.option.select && props.option.select.length > 0 ?  props.option.select: values[0]);


  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between'  }}>
      <Label size="large">{props.option.name}</Label>
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
         values.map((item: string) => {
            return <option key={item} value={item}>{item}</option>
          })
        }
      </Select>
    </div>
  );
};