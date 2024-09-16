import {
  FolderRegular,
  DocumentRegular,
  ApprovalsApp24Regular
} from "@fluentui/react-icons";
import {
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
} from "@fluentui/react-components";
import { IUserFileNodeModel } from "../../types/files";
import { AuthorCell, Item, parseSizeToMbLabel } from "../../helpers/fileGridHelper";
import { ApiUserFilesNode } from "../../api/ApiUserFiles/userFiles";
import { useProgressBar } from "../progressBar/progressContext";
import { translate } from "../../localization/localization";
import { UserTrashFilesToolbar } from "../userFileTrashBar";





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


export interface FilesTrashGridProps {
  refreshFiles: () => void;
  trashedFiles: IUserFileNodeModel[];
}

function parseNodeModelsToItems(files: IUserFileNodeModel[]): Item[] {
  let author1: AuthorCell = { label: "Vitaliy Korzhenko", status: 'available' };
  let author2: AuthorCell = { label: "Alex Simachov", status: 'busy' };
  
  return files.map((file: IUserFileNodeModel) => {
    let mathRandom = Math.round(Math.random());
    return {
      file: {id: file.id, label: file.file_name, icon: mathRandom ? <DocumentRegular /> : <FolderRegular /> },
      fileSize: { label: file.file_size.toString(), size: file.file_size },
      lastUpdated: { label: new Date().toLocaleDateString(), timestamp: Date.now() },
      author: mathRandom ? author1 : author2
    }
  });
}
 

export const FilesTrashGrid = (props: FilesTrashGridProps) => {

  const { startProgressBar, stopProgressBar } = useProgressBar(); 

  const handleRestoreFile = async (fileId: number) => {
    try {
      startProgressBar();
      await ApiUserFilesNode.restoreFileNode(fileId);
      stopProgressBar();
    } catch (error) {
      console.error("deleteFileNode Error: ", error);
    }
  }

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
            {item.file.label}
          </TableCellLayout>
        );
      },
    }),
   
    createTableColumn<Item>({
      columnId: "lastUpdated",
      compare: (a, b) => {
        return a.lastUpdated.timestamp - b.lastUpdated.timestamp;
      },
      renderHeaderCell: () => {
        return translate('file.date.mod', 'Last updated');

      },
      renderCell: (item) => {
        return (
          <TableCellLayout
            style={{
              fontWeight: "bold",
              color: 'blue'
            }}
            >
            {item.lastUpdated.label}
            </TableCellLayout>
        )
      },
    }),   
    createTableColumn<Item>({
      columnId: "fileSize",
      compare: (a, b) => {
        return a.fileSize && b.fileSize? a.fileSize.size - b.fileSize.size : 0;
      },
      renderHeaderCell: () => {
        return translate('file.size', 'Size');
      },
      renderCell: (item) => {
        return (
          <TableCellLayout
            style={{
              fontWeight: "bold",
              color: 'green'
            }}
            >
            {parseSizeToMbLabel(item.fileSize?.size)}
            </TableCellLayout>
        )
        return item.fileSize?.label;
      },
    }),
  
    createTableColumn<Item>({
      columnId: "singleAction",
      renderHeaderCell: () => {
        return "";
      },
      renderCell: (item: Item) => {
        return <Button
        style={{
          width: "100%",
        
          color: "red",
  
        }}
         icon={<ApprovalsApp24Regular />
         }
         onClick={async () => {
          await handleRestoreFile(item.file.id);
          props.refreshFiles && props.refreshFiles();
         }}
         >
        
        
          Restore
          </Button>;
      },
    }),
    createTableColumn<Item>({
      columnId: "actions",
      renderHeaderCell: () => {
        return "";
      },
      renderCell: () => {
        return (
          <>
          </>
        );
      },
    }),
  ];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
    <UserTrashFilesToolbar refreshFiles={props.refreshFiles} />
    <DataGrid
      items={parseNodeModelsToItems(props.trashedFiles)}
      columns={columns}
      sortable
      getRowId={(item) => item.file.label}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}   
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
    </div>
  );
};