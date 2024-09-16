//create function component for logout button use fluentv2 with icon and text

import { KeyCommandRegular } from "@fluentui/react-icons";
import { CompoundButton } from "@fluentui/react-components";

export interface TitleButtonProps {
title: string;    
}
export const TitleButton = (props: TitleButtonProps) => (
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
    {props.title}
  </CompoundButton>
);