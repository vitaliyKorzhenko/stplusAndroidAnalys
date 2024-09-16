import {
  Apps24Regular,
  DarkTheme24Filled,
  Question24Regular,
  LocalLanguage24Regular
} from "@fluentui/react-icons";
import {
  Label,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  Tooltip,
  tokens,
  Image
} from "@fluentui/react-components";
import type { ToolbarProps } from "@fluentui/react-components";
import { FeedbackDialog } from "../feedbackDialog";
import { UserPanel } from "../userPanel";
import { SubscriptionPanel } from "../subscriptionPanel";
import { VersionHelper } from "../../helpers/versionHelper";
import React from "react";
import { getAvailableLanguagesUiList, translate } from "../../localization/localization";

export interface MainTopPanelProps extends ToolbarProps {
  /**
   * The title of the application.
   */
 changeTheme?: () => void;

 changeDriveMode?: () => void;

 changeAuth?: () => void;

 updateLanguage?: (langCode: string) => void;

}

export const MainTopPanel = (props: MainTopPanelProps) => {

  const [openFeedback, setOpenFeedback] = React.useState(false);

  const openFeedbackDialog = () => {
    setOpenFeedback(true);
  }

  const closeFeedbackDialog = () => {
    setOpenFeedback(false);
  }

  return (

  <Toolbar aria-label="Default" {...props} style={{backgroundColor: tokens.colorBrandBackground}}>
  <div style={{ display: 'flex', alignItems: 'center' }}>
<Tooltip  relationship="label"  
content={
  <>
    <div style={{ padding: "20px", maxWidth: "250px" }}>
      <div style={{ fontWeight: "lighter", fontSize: "larger" }}>
        {translate("drive.ad.xl", "Enhance your experience with StatPlus add-in for Microsoft Excel.")}
      </div>
      <div style={{ marginTop: "10px" }}>
        <a href="https://appsource.microsoft.com/en-us/product/office/WA200002512?tab=Overview" target="_blank">
          <Image
            src="https://img.icons8.com/color/452/microsoft-excel-2019--v1.png"
            alt="Get add-in for Microsoft Excel"
            height={60}
          />
        </a>
      </div>
    </div>
  </>
}>
    <ToolbarButton
      appearance="primary"
      icon={<Apps24Regular />}
    >
     { 'StatPlus.io '}
     <Label style={{color: 'red'}}>{'v' + VersionHelper.getVersion()}</Label>
    </ToolbarButton>
</Tooltip>
    <SubscriptionPanel/>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>

    <Menu>
      <MenuTrigger>
        <ToolbarButton
          style={{
            color: 'white',
            backgroundColor: 'transparent',
            border: 'none', 
            outline: 'none',
          }}
 aria-label="ChangeLanguage" icon={<LocalLanguage24Regular style={{color: 'white'}} />} />
      </MenuTrigger>

      <MenuPopover>
        <MenuList
        onSelect={(value) => {
          console.log("Selected language: ", value);
          // props.updateLanguage && props.updateLanguage(value)
        
        }}
        >
          {getAvailableLanguagesUiList().map((language) => (
            <MenuItem 
            key={language.code}
            onClick={() => {
              console.log('CLICK language: ');
              // alert('Selected language: ' + language.code)
              if (props.updateLanguage) {
                console.log('UPDATE language: ', language.code)
                props.updateLanguage(language.code);

              } else {
                console.log('NOT DEFINED UPDATE language: ');
              }
             }}
            >
            {language.display}
            </MenuItem>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  

    <ToolbarDivider />
    <ToolbarButton
      aria-label="Dark Theme"
      icon={<DarkTheme24Filled style={{color: 'white'}} />}
      onClick={props.changeTheme}
      style={{ color: 'white', backgroundColor: 'transparent' }} // Устанавливаем цвет текста и фон

    />
    <ToolbarButton
      aria-label="Feedback"
      onClick={openFeedbackDialog}
      icon={<Question24Regular style={{color: 'white'}} />}
      style={{ color: 'white', backgroundColor: 'transparent' }} // Устанавливаем цвет текста и фон
    >
      {translate("ui.label.feedback", 'Feedback')}
    </ToolbarButton>
     <FeedbackDialog 
      open={openFeedback}
      closeDialog={closeFeedbackDialog}
     />
    

    <ToolbarDivider />  
    <UserPanel 
    changeAuth={props.changeAuth}
    />
    </div>
  </Toolbar>
  );
};
