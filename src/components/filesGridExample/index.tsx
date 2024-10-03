import {
  OpenRegular,
  DocumentRegular,
  TextDescription24Regular,
  Info20Filled
} from "@fluentui/react-icons";
import {
  PresenceBadgeStatus,
  Avatar,
  DataGridBody,
  DataGridRow,
  DataGrid,
  DataGridHeader,
  DataGridHeaderCell,
  DataGridCell,
  TableCellLayout,
  TableColumnDefinition,
  createTableColumn,
  Button,
  TableColumnId,
  DataGridCellFocusMode,
  tokens,
  PopoverTrigger,
  PopoverSurface,
  Popover,
  makeStyles,
} from "@fluentui/react-components";
import { IExampleFileNodeModel } from "../../types/files";
import { translate } from "../../localization/localization";

type FileCell = {
  label: string;
  icon: JSX.Element;
};

type AuthorCell = {
  label: string;
  status: PresenceBadgeStatus;
};

type FileDescriptionCell = {
    label: string;
    };


type Item = {
  file: FileCell;
description: FileDescriptionCell;
};

function parseNodeModelsToItems(files: IExampleFileNodeModel[]): Item[] {
  let author1: AuthorCell = { label: "Vitaliy Korzhenko", status: 'available' };
  let author2: AuthorCell = { label: "Alex Simachov", status: 'busy' };
  
  return files.map((file: IExampleFileNodeModel) => {
    return {
      file: { label: file.file_name, icon: <DocumentRegular /> },
      description: { label: file.description, icon: <TextDescription24Regular/> }
    };
  });
}



const getCellFocusMode = (columnId: TableColumnId): DataGridCellFocusMode => {
  switch (columnId) {
    case "singleAction":
      return "none";
    case "actions":
      return "group";
    default:
      return "cell";
  }
};

const useStyles = makeStyles({
  contentHeader: {
    marginTop: "0",
  },
});

const truncateText = (text: string, maxLength: number) => {
  if (text.length > maxLength) {
    return text.slice(0, maxLength) + "...";
  }
  return text;
};

interface PropoverProps {
  item: Item
}

const PropoverContent = ({ description, header }: { description: string, header: string }) => {
  const styles = useStyles();
  
  return (
    <div
      style={{
        maxWidth: '300px',   // Ограничение ширины
        padding: '10px',     // Отступы внутри прямоугольника
        backgroundColor: tokens.colorBrandBackground2, // Цвет фона (бренд)
        color: tokens.colorNeutralForeground1, // Цвет текста        overflowWrap: 'break-word', // Перенос слов, если они слишком длинные
      }}
    >
      {header && <h3 className={styles.contentHeader}>{header}</h3>}
      {description && <div>{description}</div>}
    </div>
  );
};


export const PropoverDescription = (props: PropoverProps) => (
  <Popover {...props}>
    <PopoverTrigger disableButtonEnhancement>
      <Button icon={<Info20Filled /> } aria-label="More info" />
    </PopoverTrigger>

    <PopoverSurface tabIndex={-1}>
      <PropoverContent 
      description={props.item.description.label} 
      header={props.item.file.label}
       />
    </PopoverSurface>
  </Popover>
);

export interface FilesExampleGridProps {
  files: IExampleFileNodeModel[];
  changeDriveMode?: () => void;
  setFileNameHandler: (name: string) => void;
}
export const FilesExampleGrid = (props: FilesExampleGridProps) => {

  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: "file",
      compare: (a, b) => {
        return a.file.label.localeCompare(b.file.label);
      },
      renderHeaderCell: () => {
        return translate("file.name", 'Name');
      },
      renderCell: (item) => {
        return (
          <TableCellLayout 
          media={item.file.icon}
          style={{
            fontWeight: "bold",
            fontStyle: "italic",
            color: tokens.colorBrandBackground,

          }}
          >
              <a
        href="#"
        style={{
          color: tokens.colorBrandBackground,
          textDecoration: 'none',
          padding: '2px 4px',
          borderRadius: '4px',
          fontWeight: 'bold',
        }}
        onClick={() => {
          props.setFileNameHandler && props.setFileNameHandler(item.file.label);
          props.changeDriveMode && props.changeDriveMode();
        }}
        onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'} // добавляем подчеркивание при наведении
        onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'} // убираем подчеркивание
      >
        {item.file.label}
      </a>
          </TableCellLayout>
        );
      },
    }),
      createTableColumn<Item>({
          columnId: "description",
          compare: (a, b) => {
          return a.description.label.localeCompare(b.description.label);
          },
          renderHeaderCell: () => {
          return translate('file.description', 'Description');
          },
          renderCell: (item) => {
          if (item.description.label && item.description.label.length > 0) {

          return (
              <TableCellLayout>
              <PropoverDescription item={item} />
              {truncateText(item.description.label, 50)}
              </TableCellLayout>
          );
        } else {
          return (<></>)
        }
          },
      }),   
  ];


  return (
    <DataGrid
      items={parseNodeModelsToItems(props.files)}
      columns={columns}
      sortable
      getRowId={(item) => item.file.label}
      style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        overflow: 'auto' // Включите скроллинг

       }}   
    >
      <DataGridHeader>
        <DataGridRow
        >
          {({ renderHeaderCell }) => (
            <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
          )}
        </DataGridRow>
      </DataGridHeader>
      <DataGridBody<Item>>
        {({ item, rowId }) => (
          <DataGridRow<Item>
            key={rowId}
          >
            {({ renderCell, columnId }) => (
              <DataGridCell focusMode={getCellFocusMode(columnId)}>
                {renderCell(item)}
              </DataGridCell>
            )}
          </DataGridRow>
        )}
      </DataGridBody>
    </DataGrid>
  );
};