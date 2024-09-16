  import {
    Toolbar
  } from "@fluentui/react-components";
  import type { ToolbarProps } from "@fluentui/react-components";
import { AcceptedTrashDialog } from "../acceptTrashDialog";
 
  export interface UserFilesToolbarProps extends ToolbarProps {
    /**
     * The title of the application.
     */
    refreshFiles?: () => void;
  }
  
  export const UserTrashFilesToolbar = (props: UserFilesToolbarProps) => (
    <Toolbar aria-label="Default" {...props} style={{backgroundColor: '#1E90FF#1E90FF'}}>
  
        <AcceptedTrashDialog
            refreshFiles={props.refreshFiles ? props.refreshFiles : () => {}}
        />  
    </Toolbar>
  );
  