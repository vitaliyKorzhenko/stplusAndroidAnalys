import * as React from "react";
import { Switch } from "@fluentui/react-components";
import { IPreferencesOptions } from "../types";

interface CheckedPrefsProps {
    item: IPreferencesOptions;
    name: string;
    updatePrefsOptions: (sectionName: string, item: IPreferencesOptions, newValue: any) => void;
}


export const PrefsCheckBox = (props: CheckedPrefsProps) => {
  const [checked, setChecked] = React.useState<boolean>(props.item.value.toString() == 'true' ? true : false);

  return (
    <Switch
      checked={checked}
      onChange={(_ev, data) => 
        {
            setChecked(typeof data.checked == 'boolean' ? data.checked : false);
            console.log('Change prefs CheckBox', data.checked); 
            props.updatePrefsOptions(props.name, props.item, typeof data.checked == 'boolean' ? data.checked : false);
            
        }
    }
      label={props.item.name}
    />
  );
};