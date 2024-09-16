import { Label, Select, useId } from "@fluentui/react-components";
import { translate } from "../../../localization/localization";

export const HeadersSelect = () => {
  const selectId = useId();

  const headerOptions = [
    { key: "noheaders", text: translate("ui.addrange.label.nolabels", "No headers")},
    { key: "nameinfirstrow", text: translate("ui.addrange.label.labels", "Labels in first row")},
  ];

  return (
    <>
    <div>
    <Label weight="semibold">{translate('ui.label.headers', 'Headers')}</Label>
      <Select 
      defaultValue="sheet1" id={selectId}
      style={{ width: "250px" }}
      >
        {headerOptions.map((option) => (
          <option key={option.key} value={option.key}>
            {option.text}
          </option>
        ))}
      </Select>
    </div>
    </>
  );
};