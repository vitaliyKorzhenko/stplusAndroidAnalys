//create function component for logout button use fluentv2 with icon and text

import {PersonAddRegular } from "@fluentui/react-icons";
import { CompoundButton, CompoundButtonProps } from "@fluentui/react-components";

export const AccountButton = (props: CompoundButtonProps) => (
  <CompoundButton
    icon={<PersonAddRegular />}
    appearance="outline"
    {...props}
    shape="circular"
  >
    Account
  </CompoundButton>
);