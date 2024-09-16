//create function component for logout button use fluentv2 with icon and text

import { KeyCommandRegular } from "@fluentui/react-icons";
import { CompoundButton, CompoundButtonProps } from "@fluentui/react-components";

export const CommandsButton = (props: CompoundButtonProps) => (
  <CompoundButton
    icon={<KeyCommandRegular />}
    appearance="outline"
    {...props}
    shape="circular"
    size="small"
    style={{
        backgroundColor: "#1E90FF",
        color: "white",
        
    }}
  >
    Commands
  </CompoundButton>
);