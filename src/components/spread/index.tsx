import React from "react";
import { MainTopPanelSpread } from "../topPanelSpread";
import { SpreadsheetComponent } from "../speadsheet";
import { ApiUserFilesNode } from "../../api/ApiUserFiles/userFiles";
import { Command } from "../../types/commands";



export interface SpreadProps {
  changeTheme: () => void;
  changeDriveMode: () => void;
  changeAuth: () => void;
  fileId: number;
  src: string;
  fileName: string;
  updateLanguage: (langCode: string) => void;
}

export interface SpreadState {
  isOpenCommnadPanel: boolean;
  data: any[];
  isOpenInputPanel: boolean;
  selectedCommand: Command;
}

class MainSpread extends React.Component<SpreadProps, SpreadState> {

    constructor(props: SpreadProps) {
        super(props);

        this.state = {
            isOpenCommnadPanel: false,
            isOpenInputPanel: false,
            data: [],
            selectedCommand: {id: 0, title: '', description: '', visbilility: false, isenabled: false, commandIdOld: '', subscription: '', window: '', advancedwindow: ''}
        };
    }


   async componentDidMount() {
     try {
      console.log('MainSpread componentDidMount');
      let file = await ApiUserFilesNode.openFileNode(this.props.fileId);

      console.log(file);
      let fileData = file.file_data;
      let data = JSON.parse(fileData);
      console.log('DATA',typeof data);
      let objData = JSON.parse(data);
     
      if (objData.workbook !== undefined) {
        console.log('Workbook exists in data');
        const workbook = objData.workbook;
        // Теперь у вас есть доступ к объекту 'workbook', вы можете выполнять с ним необходимые операции
        console.log('Workbook:', workbook);
        let sheet = workbook.sheets["Sheet1"];
        console.log('Sheet:', sheet);
    } else {
        console.log('Workbook does not exist in data');
    }
      
     } catch (error) {
        console.error('MainSpread Error: ', error);
      
     }
   }

  //open input panel
   openInputPanel = (card: Command) => {
    console.log('openInputPanel', this.state.isOpenInputPanel)
    console.log("COMMAND NOW", card)
    this.setState({ isOpenInputPanel: true, selectedCommand: card});
  }

  //close input panel
  closeInputPanel = () => {
    console.log('closeInputPanel', this.state.isOpenInputPanel)
    this.setState({ isOpenInputPanel: false });
  }

  render() {
    return (
      <div
        style={{
          height: '100vh',
          width: '100vw',
        }}
      >
        <MainTopPanelSpread
          changeTheme={this.props.changeTheme}
          changeDriveMode={this.props.changeDriveMode}
          changeAuth={this.props.changeAuth}
          isOpenCommnadPanel={this.state.isOpenCommnadPanel}
          isOpenInputPanel={this.state.isOpenInputPanel}
          openInputPanel={this.openInputPanel}
          closeInputPanel={this.closeInputPanel}
          command={this.state.selectedCommand}
          fileName={this.props.fileName}
          updateLanguage={this.props.updateLanguage}

        />
        <SpreadsheetComponent
        />
      
      </div>
    );
  }




 
}

export { MainSpread };
