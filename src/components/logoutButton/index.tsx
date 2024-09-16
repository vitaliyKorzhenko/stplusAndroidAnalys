//create function component for logout button use fluentv2 with icon and text
import { SignOut24Regular } from "@fluentui/react-icons";
import { CompoundButton } from "@fluentui/react-components";
import { logout } from "../../firebase";
import { translate } from "../../localization/localization";

export interface LogoutButtonProps {
  changeAuth?: () => void;
}

export const LogoutButton = (props: LogoutButtonProps) => (
  <CompoundButton
    icon={<SignOut24Regular />}
    appearance="outline"
    {...props}
    shape="circular"
    onClick={async () => {
      await logout();
      props.changeAuth && props.changeAuth();
    }}
  >
    {translate('ui.label.signOut', 'Sign out')}
  </CompoundButton>
);