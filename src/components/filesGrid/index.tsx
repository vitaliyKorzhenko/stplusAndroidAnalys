import {
  FolderRegular,
  EditRegular,
  OpenRegular,
  DocumentRegular,
  DeleteRegular,
  DoubleSwipeUpRegular
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
  tokens
} from "@fluentui/react-components";
import { IUserFileNodeModel } from "../../types/files";
import { UserFilesToolbar } from "../userFilesToolbar";
import { EditFileDialog } from "../editFileDialog";
import React from "react";
import { ApiUserFilesNode } from "../../api/ApiUserFiles/userFiles";
import { useProgressBar } from "../progressBar/progressContext";
import { AuthorCell, Item, parseSizeToMbLabel } from "../../helpers/fileGridHelper";
import { translate } from "../../localization/localization";
import { ConstStyles } from "../constStyles";



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

export interface FilesGridProps {
  files: IUserFileNodeModel[],
  refreshFiles?: () => void;
  changeDriveMode?: () => void;
  setFileNameHandler: (name: string) => void;
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
      
export const FilesGrid = (props: FilesGridProps) => {

  const [isOpenEditFileDialog, setIsOpenEditFileDialog] = React.useState(false);
  const [fileId, setFileId] = React.useState(0);
  const [fileName, setFileName] = React.useState('');

  const { startProgressBar, stopProgressBar } = useProgressBar(); 
  const handleEditFile = (fileId: number, fileName: string) => {
    setFileId(fileId);
    setFileName(fileName);
    setIsOpenEditFileDialog(true);
  };

  const handleDuplicateFile = async (fileId: number) => {
    try {
      startProgressBar();
      await ApiUserFilesNode.duplicateFileNode(fileId);
      stopProgressBar();
    } catch (error) {
      console.error("duplicateFileNode Error: ", error);
    }
  }


  const handleDeleteFile = async (fileId: number) => {
    try {
      startProgressBar();
      await ApiUserFilesNode.deleteFileNode(fileId);
      stopProgressBar();
    } catch (error) {
      console.error("deleteFileNode Error: ", error);
    }
  }

  const closeEditFileDialog = () => {
    setIsOpenEditFileDialog(false);
  }


  const columns: TableColumnDefinition<Item>[] = [
    createTableColumn<Item>({
      columnId: "file",
      compare: (a, b) => {
        return a.file.label.localeCompare(b.file.label);
      },
      renderHeaderCell: () => {
        return translate('file.name', 'Name');
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
      >
        {item.file.label}
      </a>
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
              color: 'red'
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
        
          color: "#1E90FF",
  
        }}
         icon={<OpenRegular />}
         onClick={() => {
          props.setFileNameHandler && props.setFileNameHandler(item.file.label);
          props.changeDriveMode && props.changeDriveMode();
         }}
         >
                 {translate('ui.label.open', 'Open')}
          </Button>;
      },
    }),
    createTableColumn<Item>({
      columnId: "actions",
      renderHeaderCell: () => {
        return "";
      },
      renderCell: (item: Item) => {
        return (
          <>
            <Button style={
              {color: 'orange'}} 
            aria-label="Edit" 
            icon={<EditRegular />} 
            onClick={() => {
              console.log('edit file', item.file.id, item.file.label);
              handleEditFile(item.file.id, item.file.label);
            }}
            />
            <Button 
            style={{color: 'red'}} 
            aria-label="Delete" 
            icon={<DeleteRegular 
            onClick={async () => {
              console.log('delete file', item.file.id);
              await handleDeleteFile(item.file.id);
              props.refreshFiles && props.refreshFiles();
            }
            }
            />} />
            <Button 
            style= {{color: 'green'}} 
            aria-label="Duplicate" 
            onClick={async () => {
              console.log('duplicate file', item.file.id);
              await handleDuplicateFile(item.file.id);
              props.refreshFiles && props.refreshFiles();
            }}
            icon={<DoubleSwipeUpRegular />} 

            />
          </>
        );
      },
    }),
  ];


  return (
    <>
    <UserFilesToolbar
      refreshFiles={props.refreshFiles}
     />
  <div style={{ width: '100%', height: '100%', position: 'relative' }}>
     <DataGrid
      items={parseNodeModelsToItems(props.files)}
      columns={columns}
      sortable
      focusMode="cell"
      getRowId={(item) => item.file.label}
      style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}    >
      <DataGridHeader 
      >
        <DataGridRow
        >
          {({ renderHeaderCell }) => (
            <DataGridHeaderCell>{renderHeaderCell()}</DataGridHeaderCell>
          )}
        </DataGridRow>
      </DataGridHeader>
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
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
      </div>
    </DataGrid>
    </div>
    <EditFileDialog 
     refreshFiles={props.refreshFiles}
      open={isOpenEditFileDialog}
      fileId={fileId}
      fileName={fileName}
      closeDialog={closeEditFileDialog}
      width={ConstStyles.editFileDialogWidth}
      height={ConstStyles.editFileDialogHeight}

      />
    </>
  );
};