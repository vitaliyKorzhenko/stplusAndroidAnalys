import { CompoundButton, tokens } from "@fluentui/react-components";
import { PaymentRegular } from "@fluentui/react-icons";
import type { CompoundButtonProps } from "@fluentui/react-components";

export const SubscriptionButton = (props: CompoundButtonProps) => (
  <CompoundButton
    icon={<PaymentRegular  style={{color: 'white'}}/>}
    secondaryContent=""
    shape="circular"
    style={{
        backgroundColor: "transparent",
        color: tokens.colorBrandBackground,
        fontWeight: "bold",
        width: "100px",
        height:'10px'

    }}
    {...props}
  >
    FREE
  </CompoundButton>
);