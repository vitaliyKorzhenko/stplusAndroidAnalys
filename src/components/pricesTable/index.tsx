import {
    CheckmarkCircle24Regular,
    Dismiss24Regular

} from "@fluentui/react-icons";
import {
  TableBody,
  TableCell,
  TableRow,
  Table,
  TableHeader,
  TableHeaderCell,
  TableCellLayout,
  Button,
  tokens,
} from "@fluentui/react-components";

const items = [
  {
    pro: { label: "All Basic Data& Charts", icon: <CheckmarkCircle24Regular style={{color: 'green'}} /> },
    premium: { label: "All Basic Data& Charts", icon: <CheckmarkCircle24Regular style={{color: 'green'}} /> },
   
  },
  {
    pro: { label: "Regression Model", icon: <CheckmarkCircle24Regular style={{color: 'green'}}/> },
    premium: { label: "Regression Model", icon: <CheckmarkCircle24Regular style={{color: 'green'}}/> },
  },
  {
    pro: {label: "Anova & Multivariate Analysis", icon: <CheckmarkCircle24Regular style={{color: 'green'}}/>},
    premium: {label: "Anova & Multivariate Analysis", icon: <CheckmarkCircle24Regular style={{color: 'green'}} />},
  },
  {
    pro: {label: "Non-Parametric Statistics", icon: <CheckmarkCircle24Regular style={{color: 'green'}}/>},
    premium: {label: "Non-Parametric Statistics", icon: <CheckmarkCircle24Regular style={{color: 'green'}} />},
  },
  {
    pro: {label: "Time Series & Survival Analysis", icon: <Dismiss24Regular style={{color: 'red'}}/>},
    premium: {label: "Time Series & Survival Analysis", icon: <CheckmarkCircle24Regular style={{color: 'green'}}/>},
  },
  {
    pro: {label: "Feature on request", icon: <Dismiss24Regular style={{color: 'red'}}/>},
    premium: {label: "Feature on request", icon: <CheckmarkCircle24Regular style={{color: 'green'}}/>}

  },
];

const buttonItems = [
    {
        pro: {label: "8.49 /month", key: 'buttonMonthly'},
        premium: {label: "12.74 /month", key: 'buttonMonthly'},
      },
      {
        pro: {label: "84.99 /year", key: 'buttonYearly'},
        premium: {label: "127.49 /year", key: 'buttonYearly'},
      }
];

const columns = [
  { columnKey: "pro", label: "PRO" },
  { columnKey: "premium", label: "PREMIUM" },
];

export const TablePrices = () => {
  return (
    <Table size="small" aria-label="Table with small size" style={{backgroundColor: tokens.colorBrandBackground2}}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHeaderCell key={column.columnKey} 
            style={{
                backgroundColor: tokens.colorNeutralBackground1Pressed,
                fontWeight: 'bold',
                color: tokens.colorBrandForegroundLinkPressed
                
            }}
            >
              {column.label}
            </TableHeaderCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.pro.label}>

            <TableCell>
              <TableCellLayout 
              media={item.pro.icon} 
              style={{
                //fontWeight: 'bold',
                color: tokens.colorBrandForegroundLinkPressed
              }}
              >
                {item.pro.label}
              </TableCellLayout>
            </TableCell>
            <TableCell>
              <TableCellLayout media={item.premium.icon} 
              style={{
                //fontWeight: 'bold',
                color: tokens.colorBrandForegroundLinkPressed
              }}
              >
                {item.premium.label}
              </TableCellLayout>
            </TableCell>
          </TableRow>
        ))}
            {buttonItems.map((buttonItem) => (
               <TableRow>
                     <TableCell>
                     <Button
                      content={buttonItem.pro.label}
                      key={buttonItem.pro.key}
                      style={{
                        backgroundColor: tokens.colorNeutralBackground5Pressed,
                        color: tokens.colorBrandForegroundLinkPressed,
                        width: '100%',
                        fontWeight: 'bold'
                      }}
                      >
                        {buttonItem.pro.label}
                        </Button>
                     </TableCell>
                     <TableCell>
                     <Button
                      content={buttonItem.premium.label}
                      key={buttonItem.premium.key}
                      style={{
                            backgroundColor: tokens.colorNeutralBackground5Pressed,
                            color: tokens.colorBrandForegroundLinkPressed,
                            width: '100%'
                      }}
                      >
                        {buttonItem.premium.label}
                        </Button>
                     </TableCell>
               </TableRow>
            ))}
      </TableBody>
    </Table>
  );
};