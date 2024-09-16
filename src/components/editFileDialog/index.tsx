import * as React from "react";
import {
    Dialog,
    DialogSurface,
    DialogTitle,
    DialogContent,
    DialogBody,
    DialogActions,
    Button,
    makeStyles,
    Field,
    Input,
    useId,
} from "@fluentui/react-components";
import { ApiUserFilesNode } from "../../api/ApiUserFiles/userFiles";
import { UserProfile } from "../../users";
import { translate } from "../../localization/localization";
const useStyles = makeStyles({
    content: {
        display: "flex",
        flexDirection: "column",
        rowGap: "10px",
    },
});

export interface EditFileDialogProps {
    refreshFiles?: () => void;
    open: boolean;
    fileId: number;
    fileName: string;
    closeDialog: () => void;
    width?: string;
    height?: string;
}

type ValidationState = "none" | "error" | "warning" | "success";

export const EditFileDialog = (props: EditFileDialogProps) => {
    const styles = useStyles();
    const inputId = useId("input");
    const [fileId, setFileId] = React.useState<number>(props.fileId);
    const [fileName, setFileName] = React.useState(props.fileName);
    const [validationMessage, setValidationMessage] = React.useState('');
    const [validationState, setValidationState] = React.useState<ValidationState>('none');

    React.useEffect(() => {
        setFileId(props.fileId);
        setFileName(props.fileName);
    }, [props.open]);

    const handleSubmit = async (ev: React.FormEvent) => {
        ev.preventDefault();
        try {
            if (!fileName || fileName === '') {
                setValidationMessage('File Name cannot be empty');
                setValidationState('error');
                return;
            }
            const userId = UserProfile.getCurrentUserIdNumber();
            if (!userId) {
                console.error("Error fetching files: User not found");
                return;
            }
            if (!fileId || fileId === 0) {
                console.error("Error fetching files: File not found");
                return;
            }

            if (!fileName || fileName === '') {
                console.error("Error fetching files: File name not found");
                return;
            }
            await ApiUserFilesNode.renameFileNode(fileId, fileName);
            //clear input
            props.closeDialog();
            props.refreshFiles && props.refreshFiles();

        } catch (error) {
            console.error("Error fetching files:", error);

        }
    };

    // Dynamic styles based on props
    const dialogSurfaceStyle = {
        width: props.width || "400px", // Fallback to default if width is not provided
        height: props.height || "400px", // Fallback to auto if height is not provided
    };

    return (
        <Dialog
            modalType="non-modal"
            open={props.open}
            onOpenChange={(_ev, data) =>
                data.open ? null : props.closeDialog()}
        >
            <DialogSurface aria-describedby={undefined} style={dialogSurfaceStyle} >
                    <DialogBody>
                        <DialogTitle>
                            {translate('drive.rename.file', 'Rename File')}
                        </DialogTitle>
                        <DialogContent className={styles.content}>
                            <Field 
                              validationMessage={validationMessage}
                              validationState={validationState}
                            >
                                <Input
                                    id={inputId}
                                    value={fileName}
                                    onChange={(ev) => 
                                        {
                                        if (ev.target.value.length > 0 ) { 
                                            setFileName(ev.target.value)
                                            setValidationMessage('');
                                            setValidationState('none');
                                        } else {
                                            setValidationMessage('File Name cannot be empty');
                                            setValidationState('error');
                                            setFileName('');
                                        }
                                    }}
                                />
                            </Field>
                        </DialogContent>
                        <DialogActions>
                            <Button  
                            appearance="primary"
                            onClick={handleSubmit}
                            >
                                {translate('ui.save', 'Save')}
                            </Button>
                        </DialogActions>
                    </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};