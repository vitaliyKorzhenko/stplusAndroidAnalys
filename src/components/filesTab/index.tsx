import * as React from "react";
import {
  makeStyles,
  shorthands,
  Tab,
  TabList,
} from "@fluentui/react-components";
import {
  CalendarMonthRegular,
  CalendarMonthFilled,
  bundleIcon,
  DocumentRegular,
  DeleteRegular   
} from "@fluentui/react-icons";
import { FilesGrid } from "../filesGrid";
import { FilesExampleGrid } from "../filesGridExample";
import { FilesTrashGrid } from "../filesGridTrash";
import { IExampleFileNodeModel, IUserFileNodeModel } from "../../types/files";
import { translate } from "../../localization/localization";

const CalendarMonth = bundleIcon(CalendarMonthFilled, CalendarMonthRegular);

const useStyles = makeStyles({
  root: {
    alignItems: "flex-start",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    ...shorthands.padding("2px", "2px"),
    rowGap: "20px",
    width: "100%",
    height: "100%",
  },
});

export interface FilesTabsProps {
  examples: IExampleFileNodeModel[];
  userFiles: IUserFileNodeModel[];
  trashFiles: IUserFileNodeModel[];
  refreshFiles: () => void;
  changeDriveMode: () => void;
  setFileNameHandler: (name: string) => void;
}

export const FilesTabs = (props :  FilesTabsProps) => {
  const styles = useStyles();


  const [selectedTab, setSelectedTab] = React.useState("myfiles");


  const renderTabs = () => {
    return (
      <>
        <Tab
        style = {{color: 'black', padding: '10px'}}
         icon={<DocumentRegular />} value="myfiles"
         onClick={() => setSelectedTab("myfiles")}

         >
           {translate('drive.data', 'Data')}
        </Tab>
        <Tab icon={<CalendarMonth />} 
        value="examples"
        onClick={() => setSelectedTab("examples")}
        >
          {translate('drive.examples', 'Examples')}
        </Tab>
        <Tab icon={<DeleteRegular />} 
        value="trash"
        onClick={() => setSelectedTab("trash")}
        >
          {translate('drive.trash', 'Trash')}
        </Tab>
      </>
    );
  };

  return (
    <div className={styles.root}>
      <TabList defaultSelectedValue="myfiles">{renderTabs()}
      </TabList>
        {
            selectedTab == "myfiles" ?
            <FilesGrid
            files={props.userFiles}
            refreshFiles={props.refreshFiles}
            changeDriveMode={props.changeDriveMode}
            setFileNameHandler={props.setFileNameHandler}
             /> :
            selectedTab == "examples" ?
            <FilesExampleGrid 
            files={props.examples}  
            changeDriveMode={props.changeDriveMode}
            setFileNameHandler={props.setFileNameHandler}
            /> :
            <FilesTrashGrid 
            trashedFiles={props.trashFiles}
            refreshFiles={props.refreshFiles}
            />
        }
    </div>
  );
};