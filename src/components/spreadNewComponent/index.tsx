import * as GC from '@mescius/spread-sheets';
import { SpreadSheets, Worksheet } from '@mescius/spread-sheets-react';
import '@mescius/spread-sheets/styles/gc.spread.sheets.excel2013white.css';

const hostStyle: React.CSSProperties = {
  width: '100%',
  height: '600px',
  border: '1px solid darkgray',
};

const initSpread = (spread: GC.Spread.Sheets.Workbook) => {
  const sheet = spread.getActiveSheet();
  sheet.getCell(0, 0).vAlign(GC.Spread.Sheets.VerticalAlign.center).value('Hello SpreadJS!');
};

const SpreadComponent: React.FC = () => {
  return (
    <div className="spread-component">
      <SpreadSheets workbookInitialized={initSpread} hostStyle={hostStyle}>
        <Worksheet />
      </SpreadSheets>
    </div>
  );
};

export default SpreadComponent;
