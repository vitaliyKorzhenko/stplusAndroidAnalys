import { CompoundButton } from "@fluentui/react-components";
import { MoneyRegular } from "@fluentui/react-icons";
import type { CompoundButtonProps } from "@fluentui/react-components";
import { translate } from "../../localization/localization";

export const PricesButton = (props: CompoundButtonProps) => (
  <CompoundButton
    icon={<MoneyRegular />}
    secondaryContent=""
    shape="circular"
    size="small"
    style={{
        backgroundColor: "white",
        color: "#1E90FF",
    }}
    {...props}
  >
   {translate("ui.payment.pricesin", "Show prices in") + '$USD' }
  </CompoundButton>
);