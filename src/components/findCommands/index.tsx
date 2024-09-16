import * as React from "react";
import {
  makeStyles,
  useId,
  Button,
  Input,
} from "@fluentui/react-components";
import { Search24Filled } from "@fluentui/react-icons";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    // gap: "20px",
    // Prevent the example from taking the full width of the page (optional)
    maxWidth: "400px",
    // Stack the label above the field (with 2px gap per the design system)
    "> div": { display: "flex", flexDirection: "column" },
  },
});

//props for FindCommandsInput

export interface FindCommandsInputProps {
    /**
     * Callback to be called when the user clicks on the search button.
     */
    onSearch: (searchText: string) => void;
}



export const FindCommandsInput = (props: FindCommandsInputProps) => {
  const styles = useStyles();

  const afterId = useId("content-after");

    const [value, setValue] = React.useState("");
  return (
    <div className={styles.root}>
      <div>
        <Input
        style={{backgroundColor: 'white'}}
          contentAfter={
            <Button
            appearance="transparent"
            icon={<Search24Filled />}
            size="small"
            onClick={() => {
               if (value && value.length > 0) {
                props.onSearch(value);
               }
            }}
          />
          }
          id={afterId}
          value={value}
          onChange={(ev) => setValue(ev.target.value)}
          onKeyDown={(e) => {
            //check enter
            if (e.key === 'Enter') {
            if (value && value.length >0)  {
                props.onSearch(value)
            }
            }
          }}
          
        />
      </div>
    </div>
  );
};