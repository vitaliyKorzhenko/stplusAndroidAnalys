import {
  makeStyles,
  Button,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  tokens,
  Text
} from "@fluentui/react-components";
import { InfoRegular, ChatHelp24Regular } from "@fluentui/react-icons";

import { translate } from "../../../localization/localization";

const useStyles = makeStyles({
  contentHeader: {
    marginTop: "0",
  },
  container: {
    width: '300px',
    textAlign: 'center', // Выравнивание текста по центру
  },
  button: {
    marginTop: '20px', // Отступ между текстом и кнопкой
    width: '90%', // Ширина кнопки
  },
});

const useLayoutStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    rowGap: tokens.spacingVerticalMNudge,
  },
});

export interface InfoPropoverProps {
    description: string;

}
const InfoContent = (props: InfoPropoverProps) => {
    const styles = useStyles();
    return (
        <>
      <div className={styles.container}>
        <Text size={300}>
          {props.description}
        </Text>
      </div>
      <div>
        <Button 
          size="medium" 
          icon={<ChatHelp24Regular />}
          className={styles.button} // Применяем стили для кнопки
        >
          {translate('ui.button.help', 'Help')}
        </Button>
      </div>
    </>
    );
  };


export const InfoPropover = (props: InfoPropoverProps) => {
  const layoutStyles = useLayoutStyles();

  return (
    <div className={layoutStyles.root}>

      <Popover>
        <PopoverTrigger disableButtonEnhancement>
        <Button 
         style={{
            backgroundColor: "#1E90FF",
            color: "white",
            borderRadius: "20px",
            padding: "5px 20px"
         }}
         icon={<InfoRegular fontSize={16} />}>
          {translate('ui.label.info', 'Info')}
         </Button>
        </PopoverTrigger>

        <PopoverSurface tabIndex={-1}>
          <InfoContent description={props.description}/>
            
        </PopoverSurface>
      </Popover>
    </div>
  );
};