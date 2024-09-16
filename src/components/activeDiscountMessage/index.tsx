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
const intentSuccess: MessageBarIntent = "success";

const intentMessage: string  = translate("ui.sub.promo50","Activate today and get a lifetime discount.");// "get up to 50% off for a lifetime."

const intentLinkText: string = translate("ui.offer.stdacad.linktext", "Are you a student, a researcher or an academic?");



export const ActiveDiscountIntent = () => {
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