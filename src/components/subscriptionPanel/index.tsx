import * as React from "react";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  tokens,
  makeStyles,
  shorthands,
  ToolbarButton,
  Text
} from "@fluentui/react-components";
import { TextSubscript24Filled} from "@fluentui/react-icons";
import { ActiveDiscountIntent } from "../activeDiscountMessage";
import { BillingHistoryIntent } from "../billingHistoryMessage";
import { PricesButton } from "../showPricesButton";
import { TablePrices } from "../pricesTable";
import { SubscriptionLabel } from "../subscriptionLabel";
import { translate } from "../../localization/localization";


const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("5px"),
    // Prevent the example from taking the full width of the page (optional)
    maxWidth: "400px",
    // Stack the label above the field (with 2px gap per the design system)
    "> div": {
      display: "flex",
      flexDirection: "column",
      ...shorthands.gap("2px"),
    },
  },
  main: {
    display: "grid",
    justifyContent: "flex-start",
    gridRowGap: tokens.spacingVerticalXXL,
  },

  field: {
    display: "grid",
    gridRowGap: tokens.spacingVerticalS,
  },
});



export const SubscriptionPanel = () => {
  const styles = useStyles();
 

  const [open, setOpen] = React.useState(false);
  const [customSize] = React.useState(400);



  return (
    <div>
      <OverlayDrawer
        open={open}
        position="end"
        onOpenChange={(_, state) => setOpen(state.open)}
        style={{ width: customSize }}
      >
        <DrawerHeader
       style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          <DrawerHeaderTitle
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
         <SubscriptionLabel/>
          </div>  
          </DrawerHeaderTitle>
        </DrawerHeader>

        <DrawerBody>
          <div className={styles.root}>
            <ActiveDiscountIntent/>
            <BillingHistoryIntent/>
            <PricesButton/>
          </div>
          <TablePrices/>
          <Text size={100}>
            {translate('ui.sub.policy', 'By subscribing, you agree to our {0}.')}
          </Text>
        </DrawerBody>
      </OverlayDrawer>

      <div className={styles.main}>
      <ToolbarButton
  aria-label="Subscription"
  onClick={() => setOpen(true)}
  style={{ color: 'white',
   backgroundColor: 'transparent',
   border: 'none',
   outline: 'none', 
  }} // Устанавливаем цвет текста и фон
  icon={<TextSubscript24Filled style={{color: 'white'}} />}
>
  FREE
</ToolbarButton>
      </div>
    </div>
  );
};
