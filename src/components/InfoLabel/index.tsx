import {
    makeStyles,
    Button,
    Popover,
    PopoverSurface,
    PopoverTrigger,
    tokens,
    Text
  } from "@fluentui/react-components";
  import { Info24Regular, Check24Filled } from "@fluentui/react-icons";
import { translate } from "../../localization/localization";
import React, { useEffect } from "react";
    
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
  const InfoContent = (props: InfoPropoverProps & { onClose: () => void }) => {
      const styles = useStyles();

      useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === "Escape") {
            props.onClose();
          }
        };
    
        document.addEventListener("keydown", handleKeyDown);
        return () => {
          document.removeEventListener("keydown", handleKeyDown);
        };
      }, [props]);

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
            icon={< Check24Filled/>}
            className={styles.button} 
            onClick={props.onClose} 
          >
            {translate('ui.label.OK', 'OK')}
          </Button>
        </div>
      </>
      );
    };
  
  
  export const InfoLabel = (props: InfoPropoverProps) => {
    const layoutStyles = useLayoutStyles();

    const [isOpen, setIsOpen] = React.useState(false);

    
    const handleOpen = () => {
      setIsOpen(true);
    }

    const handleClose = () => {
      setIsOpen(false);
    }
  
    return (
      <div className={layoutStyles.root}>
  
        <Popover 
        open={isOpen}
        onOpenChange={handleOpen}
        >
          <PopoverTrigger disableButtonEnhancement>
          <Button 
            size="small" 
            icon={<Info24Regular />} 
            appearance="subtle" // Применение стиля primary
            style={{ marginLeft: '5px' }} // Маленький отступ слева
        />
          </PopoverTrigger>
  
          <PopoverSurface tabIndex={-1}>
            <InfoContent 
            description={props.description}
            onClose={handleClose}
            />
              
          </PopoverSurface>
        </Popover>
      </div>
    );
  };