import { Label } from "@fluentui/react-components";
import { LabelProps, tokens } from "@fluentui/react-components";
import { Payment28Filled} from "@fluentui/react-icons";

import { translate } from "../../localization/localization";

export const SubscriptionLabel = (props: LabelProps) => (
    <>
      <Label style={{ color: tokens.colorBrandBackgroundHover, fontWeight: 'bold', fontSize: '20px' }} size="large" {...props}>
        {translate('ui.label.subscription', 'Subscription')}
      </Label>
      <Payment28Filled style={{ color: tokens.colorBrandBackgroundHover, fontSize: '24px', marginLeft: '8px' }}/>
    </>
);