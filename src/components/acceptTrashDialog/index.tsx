import * as React from "react";
import {
    Dialog,
    DialogSurface,
    DialogContent,
    DialogBody,
    DialogActions,
    Button,
    makeStyles,
    ToolbarButton,
} from "@fluentui/react-components";
import { UserProfile } from "../../users";
import { translate } from "../../localization/localization";
import { ApiUserFilesNode } from "../../api/ApiUserFiles/userFiles";
import {
    DeleteRegular
  } from "@fluentui/react-icons";
const useStyles = makeStyles({
    content: {
        display: "flex",
        flexDirection: "column",
        rowGap: "10px",
    },
});

export interface AcceptedTrashDialogProps {
    refreshFiles: () => void;
}

export const AcceptedTrashDialog = (props: AcceptedTrashDialogProps) => {
    const styles = useStyles();

    const [open, setOpen] = React.useState(false);

    const openDialog = () => {
        setOpen(true);
    }

    return (
        <>
         <ToolbarButton
            aria-label="Empty Trash"
            appearance="primary"
            icon={<DeleteRegular />}
            title={translate('drive.emptytrash', 'Empty Trash')}
            onClick={() => {
                openDialog();
            }}
            >
               {translate('drive.emptytrash', 'Empty Trash')}
            </ToolbarButton>
            <Dialog
                modalType="non-modal"
                open={open}
                onOpenChange={(_ev, data) => {
                    setOpen(data.open);
                }}
            >
                <DialogSurface aria-describedby={undefined}>
                        <DialogBody>
                            <DialogContent className={styles.content}>
                                {translate("drive.empty.confirm", "Are you sure want to permanently delete these files?")}
                            </DialogContent>
                            <DialogActions>
                                <Button appearance="secondary" onClick={() => {
                                    setOpen(false);
                                }}>
                                    {translate('ui.label.no', 'No')}
                                </Button>
                                <Button 
                                 appearance="primary"
                                    onClick={async () => {
                                        let userId = UserProfile.getCurrentUserIdNumber();
                                        if (!userId) {
                                            console.error("Error fetching files: User not found");
                                            return;
                                        }
                                        if (userId) {
                                            await ApiUserFilesNode.emptyTrashNode(userId);
                                            if (props.refreshFiles)  props.refreshFiles();
                                        }
                                        setOpen(false);
                                    }
                                    }
                                 >
                                    {translate('ui.label.yes', 'Yes')}
                                </Button>
                            </DialogActions>
                        </DialogBody>
                </DialogSurface>
            </Dialog>
        </>

    );
};