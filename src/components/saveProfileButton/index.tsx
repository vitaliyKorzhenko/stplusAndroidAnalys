//create function component for logout button use fluentv2 with icon and text
import { Save24Regular } from "@fluentui/react-icons";
import { CompoundButton} from "@fluentui/react-components";
import { translate } from "../../localization/localization";

interface SaveProfileButtonProps {
    onClick: () => void;
}


export const SaveProfileButton = (props: SaveProfileButtonProps) => (
  <CompoundButton
    icon={<Save24Regular />}
    appearance="outline"
    {...props}
    shape="circular"
    style={{
        backgroundColor: "#1E90FF",
        color: "white",
    }}
    onClick={() => {
        props.onClick();
    
    }}
  >
    {translate('ui.save', 'Save')}
  </CompoundButton>
);