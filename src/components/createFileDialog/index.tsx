import * as React from "react";
import {
    Dialog,
    DialogTrigger,
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
import {
    Add24Regular
  } from "@fluentui/react-icons";
import { ApiUserFilesNode } from "../../api/ApiUserFiles/userFiles";
import { UserProfile } from "../../users";
import { translate } from "../../localization/localization";
const useStyles = makeStyles({
    content: {
        display: "flex",
        flexDirection: "column",
        rowGap: "10px",
    }
});

export interface CreateFileDialogProps {
    refreshFiles?: () => void;
    width?: string;
    height?: string;
}

type ValidationState = "none" | "error" | "warning" | "success";


export const  CreateFileDialog = (props: CreateFileDialogProps) => {
    console.log('CreateFileDialog', props);
    const styles = useStyles();
    const inputId = useId("input");
    const [fileName, setFileName] = React.useState('');
    const [validationMessage, setValidationMessage] = React.useState('');
    const [validationState, setValidationState] = React.useState<ValidationState>('none');
    const [open, setOpen] = React.useState(false);


        // Dynamic styles based on props
        const dialogSurfaceStyle = {
            width: props.width || "400px", // Fallback to default if width is not provided
            height: props.height || "400px", // Fallback to auto if height is not provided
        };
    
    const handleSubmit = async (ev: React.FormEvent) => {
        if (!fileName || fileName === '') {
            setValidationMessage('File Name cannot be empty');
            setValidationState('error');
            return;
        } else {
            setValidationMessage('');
            setValidationState('none');
        }
        ev.preventDefault();
        try {
            const userId = UserProfile.getCurrentUserIdNumber();
            if (!userId) {
                console.error("Error fetching files: User not found");
                return;
            }
            await ApiUserFilesNode.createNewFileNode(fileName, userId);
            //clear input
            setFileName('');
            //close dialog
            setOpen(false);
            //refresh files
            props.refreshFiles && props.refreshFiles();

        } catch (error) {
            console.error("Error fetching files:", error);
            
        }
    };
    
    return (
        <Dialog 
        modalType="non-modal"
        open={open}
        onOpenChange={(_ev, data) =>
             setOpen(data.open)}
        >
            <DialogTrigger disableButtonEnhancement>
                <Button
                appearance="subtle"
                icon={<Add24Regular/>}
                onClick={() => setOpen(true)}
                >
                    {translate('drive.createFile', 'Create File')}
                </Button>
            </DialogTrigger>
            <DialogSurface style={dialogSurfaceStyle} aria-describedby={undefined} >
                    <DialogBody >
                        <DialogTitle>
                            {translate('drive.createFile', 'Create File')}
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
                                    if (ev.target.value.length > 0) { 
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