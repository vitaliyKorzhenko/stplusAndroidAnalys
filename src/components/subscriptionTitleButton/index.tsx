import { CompoundButton } from "@fluentui/react-components";
import { PaymentRegular } from "@fluentui/react-icons";
import type { CompoundButtonProps } from "@fluentui/react-components";

export const SubscriptionTitleButton = (props: CompoundButtonProps) => (
  <CompoundButton
    icon={<PaymentRegular />}
    secondaryContent=""
    shape="circular"
    size="small"
    style={{
        backgroundColor: "#1E90FF",
        color: "white",
        width: '100%',
        
    }}
    {...props}
  >
    Subscription
  </CompoundButton>
);