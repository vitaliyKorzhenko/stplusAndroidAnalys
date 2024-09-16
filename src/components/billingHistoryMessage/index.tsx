import {
  MessageBar,
  MessageBarBody,
  MessageBarIntent,
  Link,
  makeStyles,
  shorthands,
} from "@fluentui/react-components";
import { translate } from "../../localization/localization";

const useClasses = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("10px"),
  },
});
const intentSuccess: MessageBarIntent = "warning";

const intentMessage: string  = translate("ui.sub.noactive", "You do not have an active subscription. Upgrade now to unlock the full potential.");
;
// 


const intentLinkText: string = translate("ui.billinghistory:", "Billing History");


export const BillingHistoryIntent = () => {
  const classes = useClasses();

  return (
    <div className={classes.container}>
        <MessageBar key={intentSuccess} intent={intentSuccess}>
          <MessageBarBody>
            {intentMessage}
            <div>
                <Link href="https://www.microsoft.com" target="_blank">
                    {intentLinkText}
                </Link>
            </div>
          </MessageBarBody>
        </MessageBar>
     
    </div>
  );
};