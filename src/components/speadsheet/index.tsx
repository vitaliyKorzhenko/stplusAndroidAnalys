import Spreadsheet from "react-spreadsheet";

export const SpreadsheetComponent = () => {
  const columnLabels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", 
  "K", "L", "M", "N", "O", "P"];
  const countRows = 100;

  let rowLabels = []
  for (let i = 1; i <= countRows; i++) {
    rowLabels.push(`${i}`);
  }
  const data: [] = [];
  return (
    <Spreadsheet
      columnLabels={columnLabels}
      rowLabels={rowLabels}
      data={data}
    />
  );
}