import * as React from "react";
import {
  DrawerHeader,
  OverlayDrawer,
  Button,
  Tab,
  TabList,
  Text,
  Label,
} from "@fluentui/react-components";
import {
  Settings24Filled,
  Options24Filled,
  ChatHelp24Regular,
  BracesVariable24Regular,
  CaretRight24Regular,
  ArrowCircleLeft24Filled
} from "@fluentui/react-icons";
import { Command } from "../../types/commands";
import { translate } from "../../localization/localization";
import { ColumnsFor } from "./columnsFor";
import { HeadersSelect } from "./headers";
import VariablesSection from "./variablesSection";
import OptionSections from "./optionsSection";
import PrefsTab from "../preferences/prefsTab";
import { IOptionItem } from "../../types/options";
import { AppNavigate } from "../../helpers/navigateHelper";
import { IPreferencesOptions, IPreferencesSections } from "../preferences/types";
import preferences from '../../helpers/preferences.json';
import { PreferencesHelper } from "./preferencesHelper";

export interface InputPanelProps {
  isOpen: boolean;
  closeInputPanel: () => void;
  command: Command
}

interface IOptionElement {
  tabName: string;
  item: IOptionItem;
}

export const InputPanel = (props: InputPanelProps) => {
  const [open, setOpen] = React.useState(props.isOpen);
  const [customSize] = React.useState(600);

  const [selectedTab, setSelectedTab] = React.useState("variables");

  const [optionElements, setOptionElements] = React.useState<IOptionElement[]>([]);

  const [key, setKey] = React.useState(1);

  const [mainPrefences, setMainPreferences] = React.useState<IPreferencesSections[]>(PreferencesHelper.parsePreferencesJson(preferences));

  console.log('mainPrefences', mainPrefences);

  const updatePrefsOptions = (sectionName: string, item: IPreferencesOptions, newValue: any) => {
    console.log('UPDATE PREFS OPTIONS', sectionName, item, newValue);
    let updatedMainPreferences;

    if (sectionName == 'Statistics') {
      if (item.nodename == 'list') {
        updatedMainPreferences = mainPrefences.map((section) =>
          section.name === sectionName ?
            {
              ...section,
              items: section.items.map((currentItem) =>
               PreferencesHelper.comparePreferenceOptions(item, currentItem) ?
                  { ...currentItem, select: newValue } :
                  currentItem
              )
            } :
            section
        );
      }

      if (item.nodename == 'numberint') {
        updatedMainPreferences = mainPrefences.map((section) =>
          section.name === sectionName ?
            {
              ...section,
              items: section.items.map((currentItem) =>
              PreferencesHelper.comparePreferenceOptions(item, currentItem) ?
                  { ...currentItem, value: newValue } :
                  currentItem
              )
            } :
            section
        );
      }
    } else {


      updatedMainPreferences = mainPrefences.map((section) =>
        section.name === sectionName ?
          {
            ...section,
            items: section.items.map((currentItem) =>
            PreferencesHelper.comparePreferenceOptions(item, currentItem) ?
                { ...currentItem, value: newValue } :
                currentItem
            )
          } :
          section
      );
    }
    console.log('UPDATED MAIN PREFS', updatedMainPreferences);
    setMainPreferences(updatedMainPreferences ? updatedMainPreferences : []);

  };



  //add option Elements
  const addOptionElement = (tabName: string, item: IOptionItem) => {
    // Check if item exists
    console.log('ADD OPTION ELEMENT', tabName, item);
    let optionElement = optionElements.find((element) => element.tabName == tabName && element.item.name == item.name && element.item.nodename == item.nodename);

    if (optionElement) {
      // Update item
      const updatedOptionElements = optionElements.map((element) =>
        element.tabName === tabName && element.item.name === item.name && element.item.nodename === item.nodename ?
          { ...element, item } :
          element
      );
      setOptionElements(updatedOptionElements);
    } else {
      // Add item
      setOptionElements([...optionElements, { tabName, item }]);
    }
  };

  //reset option Elements to empty array
  const resetOptionElements = (tabName: string) => {
    setOptionElements([]);
    setSelectedTab(tabName);
    //update key to force re-render
    setKey(key + 1);

  };


  React.useEffect(() => {
    setOpen(props.isOpen);
    // setCurrentOptions(parseOptionAdditionTabs()); 
    //setCurrentCommand(props.command);
  }
    , [props.isOpen, props.command, optionElements, selectedTab]);



  const parseAdwancedWindowItems = (items: any[]): IOptionItem[] => {
    if (!items || items.length == 0) {
      return [];
    }

    //loop for items
    let optionItems: IOptionItem[] = [];

    items.forEach((item: any) => {
      optionItems.push({
        nodename: item.nodename ?? '',
        name: item.name ?? '',
        value: item.value ?? '',
        tab: item.tab ?? '',
        actionEnabled: item['action-enabled'] ? item['action-enabled'] : undefined,
        indent: item.indent ?? undefined,
        valueex: item.valueex ?? 0,
        valueshort: item.valueshort ?? '',
        currentvalue: item.currentvalue ?? '',
      });

    })
    return optionItems;
  };


  const parseOptionAdditionTabs = () => {
    let optionTabs: { tab: string, items: IOptionItem[] }[] = [];
    if (props && props.command && props.command.advancedwindow && props.command.advancedwindow.length > 0) {
      let advancedwindow = JSON.parse(props.command.advancedwindow);
      if (advancedwindow) {
        const items: IOptionItem[] = parseAdwancedWindowItems(advancedwindow.items);
        //loop for items
        items.forEach((item) => {
          if (item.tab && item.tab != '') {
            let tab = optionTabs.find((tab) => tab.tab == item.tab);
            if (tab) {
              tab.items.push(item);
            } else {
              optionTabs.push({ tab: item.tab, items: [item] });
            }
          } else {
            //add to default tab Options
            let tab = optionTabs.find((tab) => tab.tab == 'Options');
            if (tab) {
              tab.items.push(item);
            } else {
              optionTabs.push({ tab: 'Options', items: [item] });
            }
          }
        });
      }
    }
    return optionTabs;
  };

  const renderTabs = () => {


    const tabStyle = {
      margin: '0 0px', // Устанавливаем отступы по горизонтали на 5px, а по вертикали - 0
    };

    const optionTabs = parseOptionAdditionTabs();
    return (
      <>
        <Tab
          style={{ ...tabStyle, color: 'black' }}
          icon={<BracesVariable24Regular />} value="variables"
          onClick={() => setSelectedTab("variables")}

        >
          {translate('ui.tab.variables', 'Variables')}
        </Tab>
        {
          optionTabs.map((optionTab) => {
            return (
              <Tab icon={<Options24Filled />}
                value={optionTab.tab}
                onClick={() => setSelectedTab(optionTab.tab)}
                style={tabStyle}
              >
                {optionTab.tab}
              </Tab>
            );
          })
        }
        <Tab icon={<ChatHelp24Regular />}
          value="help"
          onClick={() => setSelectedTab("Help")}
          style={tabStyle}
        >
          {translate('ui.label.help', 'Help')}
        </Tab>
        <Tab icon={<Settings24Filled />}
          value="preferences"
          onClick={() => setSelectedTab("Preferences")}
          style={tabStyle}
        >
          {translate('ui.tab.preferences', 'Preferences')}
        </Tab>
      </>
    );
  };


  //render Variables

  const renderVariables = (): JSX.Element => {
    return (
      <>
        <div style={{
          display: 'flex',
          margin: '10px',
          padding: '10px',
          width: '90%',
        }}>
          <ColumnsFor />
          <div style={{ marginLeft: 'auto' }}>
            <HeadersSelect />
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            margin: '10px',
            width: '100%',

          }}
        >
          <VariablesSection
            window={props.command.window}
          />
        </div>
      </>
    )
  }


  //render Options

  const updateSelectedOptions = (selectedOptions: { tab: string, items: IOptionItem[] }) => {

    // Create a copy of selectedOptions to avoid direct mutation
    const updatedSelectedOptions = { ...selectedOptions, items: [...selectedOptions.items] };

    for (let i = 0; i < updatedSelectedOptions.items.length; i++) {
      for (let j = 0; j < optionElements.length; j++) {
        if (
          updatedSelectedOptions.tab === optionElements[j].tabName &&
          updatedSelectedOptions.items[i].name === optionElements[j].item.name &&
          updatedSelectedOptions.items[i].nodename === optionElements[j].item.nodename
        ) {
          updatedSelectedOptions.items[i] = optionElements[j].item;
        }
      }
    }

    return updatedSelectedOptions;
  };


  const renderOptions = (tabName: string): JSX.Element => {
    const options = parseOptionAdditionTabs();
    let selectedOptions = options.find((option) => option.tab == tabName);
    if (!selectedOptions) {
      return <></>;
    }


    selectedOptions = updateSelectedOptions(selectedOptions);
    if (!selectedOptions) {
      return <></>;
    }
    return (
      <>
        <div
          style={{
            display: 'flex',
            margin: '10px',
            width: '100%',

          }}
        >
          <OptionSections
            items={selectedOptions.items}
            addOptionElement={addOptionElement}
            selectedTab={selectedOptions.tab}
            resetOptionElements={resetOptionElements}
          />
        </div>
      </>
    )
  }

  return (
    <div
      key={key}
    >
      <OverlayDrawer
        open={open}
        position="end"
        onOpenChange={(_, state) => {
          setOpen(state.open);
          props.closeInputPanel();
        }}
        style={{ width: `${customSize}px` }}
      >
        <DrawerHeader>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between', // Распределение элементов по ширине
            alignItems: 'center', // Выравнивание элементов по вертикали
            // padding: '10px'
          }}>
            <Button size="small"
              icon={<ArrowCircleLeft24Filled />}
              onClick={() => {
                props.closeInputPanel();
              }}
              style={{ marginRight: "10px" }}
            >
              {translate('ui.label.back', 'Back')}
            </Button>
            <Label size='large' weight="semibold">{props.command.title}</Label>
            <Button
              icon={<CaretRight24Regular />}
              appearance="outline"
              shape="circular"
              style={{
                backgroundColor: "#1E90FF",
                color: "white",
              }}
            >
              {translate('ui.label.run', 'Run')}
            </Button>
          </div>

        </DrawerHeader>

        <TabList selectedValue={selectedTab} defaultSelectedValue="variables">{renderTabs()}

        </TabList>
        {
          selectedTab == "variables" ?
            renderVariables() :
            selectedTab == "Help" ?
              <div style={{ padding: '5px', margin: '5px' }}>
                <div style={{ padding: '10px' }}>
                  <Text size={400}>
                    {props.command.description}
                  </Text>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '10px',
                  }}>
                    <Button
                      size="large"
                      style={{ width: '100%' }}
                      icon={<ChatHelp24Regular />}
                      onClick={() => {
                        AppNavigate.openHelpLink(props.command.commandIdOld);
                      }}
                    >
                      {translate('ui.button.help', 'Help')}
                    </Button>
                  </div>
                </div>

              </div> :

              selectedTab == 'Preferences' ?
                <div
                  style={{
                    width: '100%',

                  }}
                >
                  <PrefsTab
                    mainOptions={mainPrefences}
                    outOptions={mainPrefences.find(section => section?.name === 'Output Options')?.items ?? []}
                    numericFormatOptions={mainPrefences.find(section => section?.name === 'Numeric Format')?.items ?? []}
                    statisticsOptions={mainPrefences.find(section => section?.name === 'Statistics')?.items ?? []}
                    updatePrefsOptions={updatePrefsOptions}
                  />
                </div>
                : renderOptions(selectedTab)

        }

      </OverlayDrawer>
    </div>
  );
};
