import { Label, Select, useId } from "@fluentui/react-components";
import { translate } from "../../../localization/localization";

export const ColumnsFor = () => {
  const selectId = useId();

  const sheetOptions = [
    { key: "sheet1", text: "Sheet1" },
    { key: "sheet2", text: "Sheet2" },
    { key: "sheet3", text: "Sheet3" },
  ];

  return (
    <>
    <div>
      <Label weight="semibold">{translate('ui.label.columnsfor', 'Columns For')}</Label>
      <Select 
      defaultValue="sheet1" 
      id={selectId}
      style={{ 
        width: '100%',
        minWidth: '250px',
      }}
      >
        {sheetOptions.map((option) => (
          <option key={option.key} value={option.key}>
            {option.text}
          </option>
        ))}
      </Select>
      </div>
    </>
  );
};