import {
    Circle24Regular
  } from "@fluentui/react-icons";
  import {
    Toolbar,
    ToolbarButton,
    ToolbarDivider,
  } from "@fluentui/react-components";
  import type { ToolbarProps } from "@fluentui/react-components";
import { CreateFileDialog } from "../createFileDialog";
import { translate } from "../../localization/localization";
import { ConstStyles } from "../constStyles";
 
  export interface UserFilesToolbarProps extends ToolbarProps {
    /**
     * The title of the application.
     */
    refreshFiles?: () => void;
  }
  
  export const UserFilesToolbar = (props: UserFilesToolbarProps) => (
    <Toolbar aria-label="Default" {...props} style={{backgroundColor: '#1E90FF#1E90FF'}}>
  
        <ToolbarButton
            aria-label="Refresh"
            appearance="primary"
            icon={<Circle24Regular />}
            title={translate('ui.refresh', 'Refresh')}
            onClick={() => {
                console.log("CLICKED REFRESH 1111");
                if (props.refreshFiles) {
                    console.log("CLICKED REFRESH 2222");
                    props.refreshFiles();
                }
            }}
            >
               {translate('ui.refresh', 'Refresh')}
            </ToolbarButton>
  
      <ToolbarDivider />
      <CreateFileDialog
      refreshFiles={props.refreshFiles}
      width={ConstStyles.createFileDialogWidth}
      height={ConstStyles.createFileDialogHeight}
        
      />
    
    </Toolbar>
  );
  