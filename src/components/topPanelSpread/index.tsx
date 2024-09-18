import React from "react";
import {
  Apps24Regular,
  DarkTheme24Filled,
  Question24Regular,
  LocalLanguage24Regular
} from "@fluentui/react-icons";
import {
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  tokens,
  Label,
  MenuPopover,
  MenuList,
  MenuItem,
  Menu,
  MenuTrigger,
} from "@fluentui/react-components";
import type { ToolbarProps } from "@fluentui/react-components";
import { UserPanel } from "../userPanel";
import { CardsPanel, CardsPanelHandle } from "../cardsBasicPanel";
import { InputPanel } from "../inputPanel";
import { Command } from "../../types/commands";
import { getAvailableLanguagesUiList, translate } from "../../localization/localization";
import { FeedbackDialog } from "../feedbackDialog";
import { FindCommandsInput } from "../findCommands";

export interface MainTopPanelProps extends ToolbarProps {
  changeTheme?: () => void;
  changeDriveMode?: () => void;
  changeAuth?: () => void;
  isOpenCommnadPanel?: boolean;
  isOpenInputPanel: boolean;
  openInputPanel: (currentCommand: Command) => void;
  closeInputPanel: () => void;
  command: Command;
  fileName: string;
  updateLanguage: (langCode: string) => void;
}

export const MainTopPanelSpread = (props: MainTopPanelProps) => {
  const [openFeedback, setOpenFeedback] = React.useState(false);
  const cardsPanelRef = React.useRef<CardsPanelHandle>(null);

  const openFeedbackDialog = () => {
    setOpenFeedback(true);
  };

  const closeFeedbackDialog = () => {
    setOpenFeedback(false);
  };

  const whiteButtonStyle = {
    color: 'white',
    backgroundColor: 'transparent',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
  };

  const whiteIconStyle = { color: 'white' };

  return (
    <Toolbar
      aria-label="Default"
      {...props}
      style={{
        backgroundColor: tokens.colorBrandBackground,
        flexWrap: 'wrap', // Позволяет элементам автоматически переноситься на новую строку
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
        <ToolbarButton
          aria-label="StatPlus.io"
          appearance="primary"
          icon={<Apps24Regular />}
          title="StatPlus.io"
          style={whiteButtonStyle}
          onClick={() => {
            props.changeDriveMode && props.changeDriveMode();
          }}
        >
          {'StatPlus.io'}
        </ToolbarButton>

        {/* Информация о версии скрыта на маленьких экранах */}
        <Label style={{ color: 'red', display: 'none' }}>{'v' + "1.0"}</Label>

        <Label style={whiteButtonStyle}>{props.fileName}</Label>

        <ToolbarButton
          aria-label="Feedback"
          onClick={openFeedbackDialog}
          icon={<Question24Regular style={whiteIconStyle} />}
          appearance="primary"
          style={whiteButtonStyle}
        >
          {translate("ui.label.feedback", 'Feedback')}
        </ToolbarButton>

        <FindCommandsInput
          onSearch={(searchText) => {
            if (cardsPanelRef.current && searchText.length > 0) {
              cardsPanelRef.current.openWithFilter(searchText);
            }
          }}
        />
      </div>

      <ToolbarDivider />

      <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', flexWrap: 'wrap' }}>
        <CardsPanel openInputPanel={props.openInputPanel} ref={cardsPanelRef} />
        <ToolbarButton
          aria-label="Dark Theme"
          icon={<DarkTheme24Filled style={whiteIconStyle} />}
          onClick={props.changeTheme}
          style={whiteButtonStyle}
        />

        <Menu>
          <MenuTrigger>
            <ToolbarButton
              style={whiteButtonStyle}
              aria-label="ChangeLanguage"
              icon={<LocalLanguage24Regular style={whiteIconStyle} />}
            />
          </MenuTrigger>
          <MenuPopover>
            <MenuList>
              {getAvailableLanguagesUiList().map((language) => (
                <MenuItem
                  key={language.code}
                  onClick={() => props.updateLanguage && props.updateLanguage(language.code)}
                >
                  {language.display}
                </MenuItem>
              ))}
            </MenuList>
          </MenuPopover>
        </Menu>

        <ToolbarDivider />
        <UserPanel />
        <InputPanel
          isOpen={props.isOpenInputPanel}
          closeInputPanel={props.closeInputPanel}
          command={props.command}
        />
      </div>

      <FeedbackDialog open={openFeedback} closeDialog={closeFeedbackDialog} />
    </Toolbar>
  );
};
