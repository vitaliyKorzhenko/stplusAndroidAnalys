import * as React from "react";
import {
  DrawerBody,
  DrawerHeader,
  DrawerHeaderTitle,
  OverlayDrawer,
  Button,
  tokens,
  makeStyles,
  shorthands,
  Input,
  ButtonProps,
} from "@fluentui/react-components";
import { Dismiss24Regular, List24Filled, SearchRegular, ArrowLeft24Regular } from "@fluentui/react-icons";
import { BasicCard } from "../basicCard";
import { CommandCard } from "../commandCard";
import { ApiCommands } from "../../api/ApiCommands";
import { BasicCommand, Command, parseSubscription } from "../../types/commands";
import { translate } from "../../localization/localization";

const useStyles = makeStyles({
  root: {
    display: "flex",
    flexDirection: "column",
    ...shorthands.gap("20px"),
    // Prevent the example from taking the full width of the page (optional)
    maxWidth: "400px",
    // Stack the label above the field (with 2px gap per the design system)
    "> div": {
      display: "flex",
      flexDirection: "column",
      ...shorthands.gap("10px"),
    },
  },
  main: {
    display: "grid",
    justifyContent: "flex-start",
    gridRowGap: tokens.spacingVerticalXXL,
  },

  field: {
    display: "grid",
    gridRowGap: tokens.spacingVerticalS,
  },
});

export interface CardsPanelProps {
  openInputPanel: (command: Command) => void;
}

export interface CardsPanelHandle {
  openWithFilter: (filter: string) => void;
}

export const CardsPanel = React.forwardRef<CardsPanelHandle, CardsPanelProps>((props, ref) => {
  const styles = useStyles();
  const [open, setOpen] = React.useState(false);
  const [customSize] = React.useState(400);
  const [isBasicMode, setIsBasicMode] = React.useState(true);

  const [basicCommands, setBasicCommands] = React.useState<BasicCommand[]>([]); // Добавьте тип для данных, которые вы ожидаете получить

  const [commands, setCommands] = React.useState<Command[]>([]); // Добавьте тип для данных, которые вы ожидаете получить

  const [searhValue, setSearchValue] = React.useState<string>('');

  const changeMode = (basicCard?: BasicCommand) => {
    console.log('changeMode', basicCard)
    if (basicCard) {
    setCommands(basicCard.commands);
    setIsBasicMode(!isBasicMode);
    } else {
      setIsBasicMode(!isBasicMode);
    }
  }

  function openWithFilter(filter: string) {
    setOpen(true);
    searchCommands(filter);
  }

  const onClickBack = () => {
    console.log('onClickBack', isBasicMode)
    if (!isBasicMode) {
      changeMode()
    } else {
      setOpen(false)
    }
  }
 // 
  function renderBodyForChildCards (): JSX.Element {
    return <DrawerBody>
      <div className={styles.root}>
        <div>
          {
            commands.map((card: Command) => {
              return <CommandCard
                description={card.description}
                subcription={parseSubscription(card.subscription)}
                title={card.title}
                onClick={() => {
                  console.log('onClick', card);
                  const window = JSON.parse(card.window);
                  console.log('window', window);
                }}
                openInputPanel={props.openInputPanel}
                coomandCard={card}
              />
            })
          }
        </div>
    </div>
  </DrawerBody>
  }

  // React.useImperativeHandle(ref, () => ({
  //   openWithFilter
  // }));

  React.useImperativeHandle(ref, () => ({
    openWithFilter,
  }));

  const MicButton: React.FC<ButtonProps> = (props) => {
    return (
      <Button
        {...props}
        appearance="transparent"
        icon={<SearchRegular />}
        size="small"
      />
    );
  };

  const searchCommands = (search: string) => {
    //get all child commands where title includes search or description includes search
    //for each all basic commands that have child commands
    if (search && search.length > 0) {
    let resultCommands = [];
    for (let i = 0; i < basicCommands.length; i++) {
      const basicCommand = basicCommands[i];
      const childCommands = basicCommand.commands;
      for (let j = 0; j < childCommands.length; j++) {
        const childCommand = childCommands[j];
        //all to lower case
        search = search.toLowerCase();
        let titleL = childCommand.title.toLowerCase();
        let descriptionL = childCommand.description.toLowerCase();
        if (titleL.includes(search) || descriptionL.includes(search)) {
          //add to result
          resultCommands.push(childCommand);
        }
      }
      setCommands(resultCommands);
      setIsBasicMode(false);
    }
  } else {
    setCommands([]);
    setIsBasicMode(true);
  }
  }


  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const basicCommands = await ApiCommands.findAllCommandsByLanguage('en');
        console.log("COMMANDS", basicCommands); // Делайте что-то с полученными данными
        setBasicCommands(basicCommands);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Обработка ошибки, если это необходимо
      }
    };

    fetchData(); // Вызываем асинхронную функцию fetchData
  }, []);

  function renderBodyForBasicCards (): JSX.Element {
    return <DrawerBody>
      <div className={styles.root}>
        <div>
          {
            basicCommands.map((card) => {
              return <BasicCard 
              name={card.title}
              changeMode = {() => changeMode(card)}
              countCommands={card.commands.length}
              description={card.description}
              id = {card.groupId.toString()}
              />
            })
          }
        </div>
      </div>
    </DrawerBody>
  }

  return (
    <div>
      <OverlayDrawer
        open={open}
        position="end"
        onOpenChange={(_, state) => setOpen(state.open)}
        style={{ width: `${customSize}px` }}
      >
        <DrawerHeader>
          <DrawerHeaderTitle
            action={
              <Button
                appearance="subtle"
                aria-label="Close"
                icon={<Dismiss24Regular />}
                onClick={() => setOpen(false)}
              />
            }
          >
         <Button size="small" 
         icon={<ArrowLeft24Regular 
          />}
          appearance="subtle"

          onClick={() => {
            console.log('onClickBack', isBasicMode);
            onClickBack()
          
          }}
          style={{
            marginRight: "10px",
          
          }}
            >
            {translate("ui.label.back", 'Back')}
        </Button>
        <Input
        autoFocus={true}
          contentAfter={<MicButton 
            onClick={() => {
              searchCommands(searhValue)
            }}
            aria-label={translate('ui.label.search', 'Search')} />}
          value={searhValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ width: "100%", maxWidth: '230px' }}
          placeholder={translate('ui.label.search', 'Search')}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              searchCommands(searhValue)
            }
          
          }}
        />
          </DrawerHeaderTitle>
        </DrawerHeader>

       {
          isBasicMode ? 
          renderBodyForBasicCards() : 
          renderBodyForChildCards()
       }
      </OverlayDrawer>

      <div className={styles.main}>
        <Button 
        appearance="primary" 
        onClick={() => setOpen(true)}
        icon={<List24Filled/>}
        >
         {translate("ui.label.commands", 'Commands')}
        </Button>
      </div>
    </div>
  );
});
