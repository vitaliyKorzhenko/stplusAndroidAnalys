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
    Textarea,
} from "@fluentui/react-components";
import { UserProfile } from "../../users";
import { ApiUserNode } from "../../api/ApiUser";
import { translate } from "../../localization/localization";

const useStyles = makeStyles({
    content: {
        display: "flex",
        flexDirection: "column",
        rowGap: "10px",
    },
});

export interface FeedbackDialogProps {
    open: boolean;
    closeDialog: () => void;
}

type ValidationState = "none" | "error" | "warning" | "success";


export const FeedbackDialog = (props: FeedbackDialogProps) => {
    const styles = useStyles();
    const [feedback, setFeedback] = React.useState("");
    const [validationMessage, setValidationMessage] = React.useState('');
    const [validationState, setValidationState] = React.useState<ValidationState>('none');

    const handleSubmit = async () => {
       
        try {
            if (!feedback || feedback === '') {
                setValidationMessage('Feedback cannot be empty');
                setValidationState('error');
                return;
            }
            const userId = UserProfile.getCurrentUserId();
            if (!userId) {
                console.error("Error fetching files: User not found");
                return;
            }
            if (!feedback || feedback === '') {
                console.error("Error fetching files: Feedback not found");
                return;
            }
            await ApiUserNode.sendFeedback(userId, feedback);
            setFeedback('');
            props.closeDialog();
            //close dialog

        } catch (error) {
            
        }
    };

    React.useEffect(() => {
        setFeedback('');
    }
    , [props.open]);

    return (
        <Dialog 
        modalType="non-modal"
        open={props.open}
        onOpenChange={(_ev, data) => {
            if (!data.open) {
               props.closeDialog();
            }
        }}
        >
            <DialogSurface aria-describedby={undefined}>
                    <DialogBody>
                        <DialogTitle>{translate('ui.label.feedback', 'Feedback')}</DialogTitle>
                        <DialogContent className={styles.content}>
                            <Field 
                            validationMessage={validationMessage} 
                            validationState={validationState}>
                                <Textarea
                                    appearance="outline"
                                    placeholder="type here..."
                                    resize="both"
                                    value={feedback}
                                    onChange={(ev) => {
                                        if (ev.target.value.length == 0) {
                                            setValidationMessage('Feedback cannot be empty');
                                            setValidationState('error');
                                        } else {
                                            setValidationMessage('');
                                            setValidationState('none');
                                        }
                                        setFeedback(ev.target.value);
                                    
                                    }}
                                />
                            </Field>
                        </DialogContent>
                        <DialogActions>
                            <Button  appearance="primary" onClick={handleSubmit}>
                                {translate('ui.label.submit', 'Submit')}
                            </Button>
                        </DialogActions>
                    </DialogBody>
            </DialogSurface>
        </Dialog>
    );
};