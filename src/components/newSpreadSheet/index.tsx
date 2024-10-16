import React, { useState } from 'react';
import { Cell, Sheet } from './types'; // Импорт типов для ячеек и листов
import styles from './table.module.css'; // Импорт CSS стилей

// Генерация букв для заголовков колонок (A-Z, AA и т.д.)
const generateColumnHeaders = (n: number) => {
  const letters = [];
  for (let i = 0; i < n; i++) {
    let letter = '';
    let temp = i;
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    letters.push(letter);
  }
  return letters;
};

// Генерация пустых данных для таблицы
const generateEmptyData = (rows: number, cols: number) => {
  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ value: '' }))
  );
};

const ExcelLikeTable: React.FC = () => {
  const [sheets, setSheets] = useState<Sheet[]>([
    { name: 'Sheet 1', data: generateEmptyData(500, 20) } // 500 строк и 20 колонок
  ]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [cellValue, setCellValue] = useState<string>('');

  // Изменение значения в конкретной ячейке
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newSheets = [...sheets];
    const updatedSheet = { ...newSheets[activeSheetIndex] };
    updatedSheet.data = updatedSheet.data.map((row, rIdx) => {
      if (rIdx === rowIndex) {
        return row.map((cell, cIdx) => (cIdx === colIndex ? { value } : cell));
      }
      return row;
    });
    newSheets[activeSheetIndex] = updatedSheet;
    setSheets(newSheets);
    
    // Если ячейка выбрана, обновляем значение в поле
    if (selectedCell && selectedCell.row === rowIndex && selectedCell.col === colIndex) {
      setCellValue(value);
    }
  };

  // Выбор ячейки
  const handleCellSelect = (rowIndex: number, colIndex: number) => {
    setSelectedCell({ row: rowIndex, col: colIndex });
    setCellValue(String(sheets[activeSheetIndex].data[rowIndex][colIndex].value)); // Обновлено: значение должно соответствовать выбранной ячейке
  };

  // Добавление нового листа
  const addNewSheet = () => {
    setSheets([
      ...sheets,
      { name: `Sheet ${sheets.length + 1}`, data: generateEmptyData(500, 20) }
    ]);
  };

  const columnHeaders = generateColumnHeaders(20); // Генерация 20 колонок (от A до T)

  return (
    <div className={styles.container}>
      {/* Панель листов */}
      <div className={styles.sheetPanel}>
        {sheets.map((sheet, index) => (
          <button
            key={index}
            onClick={() => setActiveSheetIndex(index)}
            className={styles.sheetButton}
          >
            {sheet.name}
          </button>
        ))}
        <button onClick={addNewSheet} className={styles.addSheetButton}>
          + Add Sheet
        </button>
        
        {/* Информация о выбранной ячейке и поле ввода */}
        <div className={styles.cellInfo}>
          {selectedCell ? (
            <>
              <span className={styles.cellLabel}>
                {`${generateColumnHeaders(selectedCell.col + 1)[0]}${selectedCell.row + 1} : `}
              </span>
              <input
                type="text"
                value={cellValue}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setCellValue(newValue);
                  handleCellChange(selectedCell.row, selectedCell.col, newValue);
                }}
                className={styles.cellInput}
              />
            </>
          ) : (
            <span>No cell selected</span>
          )}
        </div>
      </div>

      {/* Таблица с прокруткой */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th></th> {/* Пустая ячейка в углу */}
              {columnHeaders.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sheets[activeSheetIndex].data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                <td className={styles.rowHeader}>{rowIndex + 1}</td> {/* Нумерация строк */}
                {row.map((cell, colIndex) => (
                  <td key={colIndex} onClick={() => handleCellSelect(rowIndex, colIndex)}>
                    <input
                      type="text"
                      value={cell.value}
                      onChange={(e) =>
                        handleCellChange(rowIndex, colIndex, e.target.value)
                      }
                      className={styles.cellInput}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelLikeTable;
