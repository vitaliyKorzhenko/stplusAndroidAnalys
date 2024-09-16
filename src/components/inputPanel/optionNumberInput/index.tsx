import * as React from "react";
import {
  makeStyles,
  shorthands,
  useId,
  Button,
  Input,
  Label,
} from "@fluentui/react-components";
import { Delete24Regular } from "@fluentui/react-icons";
import type { ButtonProps } from "@fluentui/react-components";
import { IOptionItem } from "../../../types/options";
import { IMainOtionItem } from "../types/optionProps";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("20px"),
    // Prevent the example from taking the full width of the page (optional)
    width: "100%",
    // Stack the label above the field (with 2px gap per the design system)
    "> div": {
      display: "flex",
      flexDirection: "column",
      ...shorthands.gap("2px"),
    },
  },
});


export interface OptionNumberInputProps extends IMainOtionItem {
    option: IOptionItem;
    isVisible: boolean;
}

const ClearButton: React.FC<ButtonProps> = (props) => {
  return (
    <Button
      {...props}
      appearance="transparent"
      icon={<Delete24Regular />}
      size="small"
    />
  );
};

export const OptionNumberInput = (props: OptionNumberInputProps) => {
  const styles = useStyles();

  const afterId = useId("content-after");

  console.log('OptionNumberInput', props.option);
  const [value, setValue] = React.useState<string>(props.option.currentvalue ? props.option.currentvalue : props.option.value !== undefined && props.option.value !== null ? props.option.value.toString() : "");

  //clear value onClick of clear button set 0
  const clearValue = () => {
    setValue("0");
  }
  if (props.isVisible) {
  return (
     <div className={styles.root}>
        <div>
        <Label htmlFor={afterId}>{props.option.name}</Label>
        <Input
        type="number"
          contentAfter={<ClearButton aria-label="clear" onClick={clearValue} />}
          id={afterId}
         value={value}
            onChange={(event) => {
              setValue(event.target.value)
              let newOtion = props.option;
              newOtion.currentvalue = event.target.value;
              props.addOptionElement(props.selectedTab, newOtion);
            }}
        />
      </div>
    </div>
  );
  } else {
    return <></>
  }
};