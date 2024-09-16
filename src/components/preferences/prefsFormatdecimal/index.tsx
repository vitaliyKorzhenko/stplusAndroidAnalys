import * as React from "react";
import {
  Label,
  Select
} from "@fluentui/react-components";
import { IPreferencesOptions } from "../types";


interface IPrefFontDecimal {
    option: IPreferencesOptions;
    name: string;
    updatePrefsOptions: (sectionName: string, item: IPreferencesOptions, newValue: string) => void;
}

export const PrefsFormatDecimal = (props: IPrefFontDecimal) => {
  console.log('Prefs Format Decimal', props.option);

  const [selectedValue, setSelectedValue] = React.useState<string>(props.option.value);

  const generateOptions = () => {
    //use props.option min and max to generate options
    let options = [];
    if (props.option.min && props.option.max) {
    for (let i = props.option.min; i < props.option.max; i++) {
      options.push(<option key={i} value={i}>{i}</option>);
    }
  }
    return options;
  }

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
          generateOptions().map((item: any) => {
            return item;
          })
        }
      </Select>
    </div>
  );
};