/*

  Format toolbar for the spread component.

  TODO: move formatter methods to formathelper.ts
  
  TODO: check how checkMarks in overflow (narrow width) result in bad color selectors rendering.



*/
/// <reference path="gcspread.sheets.d.ts" />

import React, { CSSProperties } from 'react';

import { Text, Callout, ColorPicker, CommandBar, CommandButton, ContextualMenuItemType, DirectionalHint, Dropdown, FocusZoneDirection, getColorFromString, IButtonProps, IButtonStyles, IColor, ICommandBarItemProps, Icon, IconButton, IContextualMenuItem, IIconStyles, IImageProps, ImageFit, IStyle, mergeStyleSets, ResponsiveMode, VerticalDivider, Dialog, DialogType, TextField, SpinButton, Position, Toggle } from 'office-ui-fabric-react';
import { useBoolean, useId } from '@uifabric/react-hooks';

import { commandBarTheme } from '../../themes/brandtheme';
import { IUITheme } from 'src/types';
import { spreadDefFont, spreadDefFontSize } from './spread-font';
import { translate } from '../../../../shared/localization/localization';
import { IChartSpreadOptionAxis, IChartSpreadOptions, ISpreadSelectionFormat } from './types-format'
import { SpreadActionFunc } from './spread-action';

const classNames = mergeStyleSets({
  menu: {
    textAlign: 'center',
    maxWidth: 180,
    selectors: {
      '.ms-ContextualMenu-item': {
        height: 'auto',
      },
    },
  },
  item: {
    display: 'inline-block',
    width: 40,
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    verticalAlign: 'middle',
    marginBottom: 8,
    cursor: 'pointer',
    selectors: {
      '&:hover': {
        backgroundColor: '#eaeaea',
      },
    },
  },
});

const maxWidthFormat = 760;
const maxWidthChart  = 400;


export interface ISpreadToolbarFormatProps {
  // Callback to apply format
  action: SpreadActionFunc;

  // Move to context
  uitheme: IUITheme;
  openDialogPrompt: any;
}

export interface ISpreadToolbarFormatState extends ISpreadSelectionFormat{
  visible: boolean;

  // Chart Object. If present - render chart edit toolbar  
  chart: any;
  chartEditAxis: {
    axis: IChartSpreadOptionAxis;
    title: string;
  };
}

export class SpreadToolbarFormat extends React.Component<ISpreadToolbarFormatProps, ISpreadToolbarFormatState>{
  
  constructor(props) {
    super(props);
    this.state = {
      visible: false,  

      fontSize: spreadDefFontSize,
      fontName: spreadDefFont,
      colorFont: '',
      colorFill: '',
      
      isBold: false,
      isItalic: false,
      isUnderline: false,

      canMerge: true,
      hAlign: GcSpread.Sheets.HorizontalAlign.general,
      vAlign: GcSpread.Sheets.VerticalAlign.center,   

      isBorderTop: false, isBorderBottom: false, isBorderLeft: false, isBorderRight: false,

      canUndo: false,
      canRedo: false,  
      
      // Chart Object. If present - render chart edit toolbar
      chart: null,
      chartEditAxis: null,
    }
    this.iconStyles = { root: { color: this.props.uitheme.theme.semanticColors.buttonText + ' !important'} };
  }

  private iconStyles: IIconStyles;

  public setVisible(value: boolean) {
    this.setState({ visible: value });
  }

  // When valid chart is present - chart edit toolbar buttons are shown    
  public setChart(chart: any) {
    this.setState({ chart: chart })
  }

  private fontToKey(fnt: string): any {
    return fnt.toLowerCase().replace(/\s+/g, '');
  }  

  public updateFontStyle = (values: ISpreadSelectionFormat) => {
    //
    this.setState( { ...values});
  }

  // Format - Align buttons (no text)
  renderMenuItemAlign = (item: any, dismissMenu: () => void) => {
    return (
      <IconButton
        {...item}
        iconProps={{ iconName: item.key }}
        styles={this.iconStyles}
        className="ms-ContextualMenu-link"
        data-is-focusable
        onClick={() => { item.onClick(); dismissMenu(); }}
        data-no-vertical-wrap
      />
    );
  }

  // Color selector menu item (Font, Fill)  
  renderMenuItemColor = (item: any, dismissMenu: () => void, color: string, defaultColor: string, action: (hex?: string) => void, isContextMenu: boolean) => {
    // Renders color selector
    // Compare with https://casesandberg.github.io/react-color/#examples
    const MenuItemColor: React.FunctionComponent = () => {
      // Convert color to IColor and create a state hook
      const colorDefined = color && color.length > 1;
      const [isColorSelectorShown, { toggle: toggleColorSelectorShown, setFalse: falseColorSelectorShown }] = useBoolean(false);
      const [selColor, setColor] = React.useState(getColorFromString(colorDefined ? color : defaultColor)!);
      // Button ID
      const _buttonId = useId('color-selector');      

      let iconButtonRootStyle = { height: "auto", width: "52px" };
      if (this.iconStyles && this.iconStyles.root)
        iconButtonRootStyle = { ...iconButtonRootStyle, ...(this.iconStyles.root as object) };

      const renderedInOverflow = !!item.renderedInOverflow || isContextMenu;
      const divColorRect = <div
        style={{
          width: 20,
          height: 5,
          position: "absolute",
          left: 6,
          top: 30 /* when no border - use 32 */,
          border: `1px ${this.props.uitheme.theme.semanticColors.inputBorder} solid`,
          backgroundColor: `#${selColor.hex}`
        }}
      >
      </div>;
      return <>
          {renderedInOverflow ?
            <CommandButton
              {...item}
              id={_buttonId}
              styles={{
                root: {
                  width: "100%"
                },
                textContainer: {
                  flexGrow: 1,
                  textAlign: "left",
                  paddingLeft: 2
                },            
              }}
              className="ms-ContextualMenu-link"              
              menuProps={{}}
              onMenuClick={() => { toggleColorSelectorShown() }}
            >
              {!isContextMenu && divColorRect}
            </CommandButton>
            :
            <IconButton
              {...item}
              id={_buttonId}
              styles={{ root: iconButtonRootStyle }}
              className="ms-ContextualMenu-link"
              menuProps={{}}
              onMenuClick={() => { toggleColorSelectorShown() }}
            // onRenderIcon={(props,defaultRenderer) => {
            //   return <Icon iconName={props.iconProps.iconName}/>
            // }}
            >
              {divColorRect}
            </IconButton>
          }
          {isColorSelectorShown &&
            <Callout
              gapSpace={0}
              target={`#${_buttonId}`}
              onDismiss={toggleColorSelectorShown}
              setInitialFocus={true}
              hidden={!isColorSelectorShown}
              directionalHint={DirectionalHint.bottomLeftEdge}
              /*
              dismissOnTargetClick={true} doNotLayer={true}
              styles={{ root: { opacity: "1 !important", filter: "none !important" } }}
              */
            >
              <ColorPicker
                color={selColor}
                alphaType='none'
                onChange={(ev: React.SyntheticEvent<HTMLElement>, color: IColor)=> {
                  const hex = `#${color.hex}`;
                  const hexColor = defaultColor && (hex.toLowerCase() == defaultColor.toLowerCase()) ? null : hex;
                  action(hexColor)
                  setColor(color);
                }}
              />
            </Callout>
          }
        </>;
    }
    return <MenuItemColor/>;
  }

  _imageFromLegacyClass = (name: string, width?: number, height?: number): IImageProps => {
    if (!width)
      width = 16;
    if (!height)
      height = 16;      
    return {
      src: '',
      className: name,
      imageFit: ImageFit.contain,
      shouldStartVisible: true,
      styles: { image: { opacity: 1 } },
      width: width, height: height,
    }
  }

  // Format - Borders buttons (no text)
  renderMenuItemBorders = (item: any, dismissMenu: () => void) => {
    return (
      <IconButton
        {...item}
        iconProps={{
          imageProps: this._imageFromLegacyClass(item.key)
        }}
        title={item.text}
        ariaLabel={item.text}
        className="ms-ContextualMenu-link"
        data-is-focusable
        onClick={() => {
          this.props.action(item.key, !item.checked);
          dismissMenu();
        }}
        //data-no-vertical-wrap
      />
    );
  }  

  // Font Name 
  renderMenuItemFontName = (item: any, dismissMenu: () => void) => {
    const fontsList = ["Arial", "Arial Black", "Courier New", "Georgia", "Helvetica", "Menlo", "Palatino", "Tahoma", "Times", "Times New Roman", "Trebuchet MS", "Verdana"];
    const fontsListAsDropdownOpts = fontsList.map((fnt, idx) => { return { text: fnt.toString(), key: this.fontToKey(fnt) } });
    return (<Dropdown
      label=""
      selectedKey={this.fontToKey(this.state.fontName)}
      onChange={(event, option, index)=> {
        const name = option.text;
        this.props.action("fontStyle", name);        
        this.setState({ fontName: option.text});
      }}
      placeholder={spreadDefFont}
      responsiveMode={ResponsiveMode.large}
      options={fontsListAsDropdownOpts}
      styles={{
        dropdown: {
          width: 120,
          margin: "0 auto",
        },
        root: {
          paddingTop: 6,
        }
      }}
    />

    );
  }

  // Font Size dropdown
  renderMenuItemFontSize = (item: any, dismissMenu: () => void) => {
    const fontSizeOpts = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 26, 28, 36, 48, 72].map(sz => { return { text: sz.toString(), key: sz } });
    const renderedInOverflow = !!item.renderedInOverflow;
    return (<>
      {renderedInOverflow &&
        <Text
          block={false}
          styles={{ root: { paddingLeft: 32, paddingRight: 16 } }}
        >
          {item.text}
        </Text>
      }
      <Dropdown
        label=""
        aria-label={item.text}
        selectedKey={this.state.fontSize}
        onChange={(event, option, index) => {
          const size = parseInt(option.text);
          this.props.action("fontSize", size);
          this.setState({ fontSize: size });
        }}
        placeholder={spreadDefFontSize.toString()}
        responsiveMode={ResponsiveMode.large}
        options={fontSizeOpts}
        styles={{
          dropdown: {
            width: 60,
            margin: "0 auto",
          },
          root: {
            paddingTop: 6,
            paddingRight: 12,
            display: renderedInOverflow ? "inline-flex" : null,
          }
        }}
      />
    </>);
  }

  commandBarSeparator(id: string): IContextualMenuItem {
    return {
      key: id,
      text: '',
      itemType: ContextualMenuItemType.Divider,
      onRender: () => <VerticalDivider />
    }
  }

  // Some texts in localization are too long. Leave first word until we update localization. Used in "Unmerge cells".
  private _firstWord = (str: string) => str.trimLeft().replace(/ .*/,'');

  render() {
    if (!this.state.visible)
      return <></>;
    if (this.state.chart)
      return this.renderChartFormat();
    else
      return this.renderCellFormat();
  }

  getChartOptionsObj = (obj: any) => {
    return obj["options"] as IChartSpreadOptions;
  }
 
  private getChartBarItems = (opts: IChartSpreadOptions) => {
    const textTitle = translate("ui.chartpanel.label.title", "Title");
    const textAxisLeft = translate("ui.chartpanel.label.left", "Left Axis");
    const textAxisBottom = translate("ui.chartpanel.label.bottom", "Bottom Axis");
    // Add ... to menu names
    const _ellipsis = (str: string) => str + '...';

    // Chart toolbar -> Series submenu
    const _itemsSeries: IContextualMenuItem[] = opts.series.map((ser, idx) => {
      const serColorValid = ser.color && ser.color.length == 7;
      const iconProps = serColorValid ? {
        iconName: "CircleShapeSolid",
        styles: {
          root: {
            color: ser.color,
          }
        }
      } : null;
      const _key = 'chartSeries_' + idx.toString();
      return {
        iconProps: iconProps,
        key: _key,
        text: ser.label,
        subMenuProps: {
          onDismiss: () => { this.updateChart()},
          items: [
            {
              key: _key + '_title',
              text: _ellipsis(textTitle),
              onClick: () => {
                this.props.openDialogPrompt(ser.label, textTitle,
                  (value) => {
                    ser.label = value;
                    this.updateChart();
                  },
                  false);
              }
            },
            {
              key: _key + '_color',
              text: translate("ui.chartpanel.label.color", "Color"),
              onRender: (item, dismissMenu) => this.
                renderMenuItemColor(item, dismissMenu, ser.color, "#000000",
                  (hex?: string) => {
                    if (hex) {
                      ser.color = hex;
                      this.updateChart(false);
                    }
                  },
                  true),
              // renderContextMenuItemColor(item, dismissMenu, this.state.colorFill, "", ""),
            }
          ]
        }
      };
      // iconProps: { iconName: 'Bold', styles: this.iconStyles },
      // onClick: () => { this.props.action("bold") },
    });

    // Define gridlines
    opts.axis.y.gridlines = opts.axis.y.gridlines ? true : false;
    opts.axis.x.gridlines = opts.axis.x.gridlines ? false : true;
  

    return [
      // {
      //   key: 'chartIconEdit',
      //   iconProps: { iconName: 'BarChartVerticalEdit', styles: this.iconStyles },
      //   disabled: true,
      //   text: 'Edit Chart',
      //   buttonStyles: { rootDisabled: { color: this.props.uitheme.theme.semanticColors.buttonText } },
      // },
      {
        key: 'chartTitle',
        text: _ellipsis(textTitle),
        onClick: () => {
          this.props.openDialogPrompt(opts.title, textTitle,
            (value) => {
              opts.title = value.replace("\r\n", "\n").replace("\n", "\r\n");
              this.updateChart();
            },
            true);
        },
      },
      {
        key: 'chartAxes',
        text: translate("ui.chartpanel.label.axes", "Axes"),
        subMenuProps: {
          items: [
            {
              key: 'axisLeft', text: _ellipsis(textAxisLeft),
              onClick: () => {
                this.setState({ chartEditAxis: { axis: opts.axis.y, title: textAxisLeft } })
              },
            },
            {
              key: 'axisBottom', text: _ellipsis(textAxisBottom),
              onClick: () => {
                this.setState({ chartEditAxis: { axis: opts.axis.x, title: textAxisBottom } })
              },
            },
          ],
        },
      },
      {
        key: 'chartSeries',
        text: translate("ui.chartpanel.label.series", "Series"),
        subMenuProps: {
          items: _itemsSeries,
        },
        // iconProps: { iconName: 'Bold', styles: this.iconStyles },
        onClick: () => { this.props.action("bold") },
      },
      this.commandBarSeparator('chartSeparator2'),      
      {
        key: 'chartLegend',
        text: translate("ui.chartpanel.label.legend", "Legend"),
        checked: opts.legend != 0,
        canCheck: true,
        // iconProps: { iconName: 'Bold', styles: this.iconStyles },
        onClick: (ev?, item?: IContextualMenuItem) => {
          opts.legend = !item.checked ? 3 : 0;
          this.updateChart();
        },
      },      
    ];
  }

  renderChartDialogEditAxis() {
    if (!this.state.chartEditAxis)
      return <></>;
    const axis = this.state.chartEditAxis.axis;
    const axisName = this.state.chartEditAxis.title;
    const categoricalAxis = !!axis.categories;

    // TODO: test on non-US culture with comma
    // Check if Globalize is available

    // Change axis.min value
    const spinEventMin = (value: string, delta: number) => {
      const v = parseFloat(value) + delta;
      if (isFinite(v) && v < axis.max) {
        axis.min = v;
        this.updateChart();
        return v.toString();
      }
    }  
    // Change axis.max value
    const spinEventMax = (value: string, delta: number) => {
      const v = parseFloat(value) + delta;
      if (isFinite(v) && v > axis.min) {
        axis.max = v;
        this.updateChart();
        return v.toString();
      }
    }  
    // Change axis.majorunit value
    const spinEventMajorUnit = (value: string, delta: number) => {
      const v = parseFloat(value) + delta;
      if (isFinite(v) && v > 0 && v <= (axis.max - axis.min)) {
        axis.majorunit = v;
        this.updateChart();
        return v.toString();
      }
    }        
    
    // Step for min/max spin buttons   
    const majorunitDelta = isFinite(axis.majorunit) ? axis.majorunit : 1;
    // Step for major unit spin control
    const majorUnitStep = 1;
    // JSX
    return <Dialog
      hidden={false}
      onDismiss={()=> this.setState({ chartEditAxis: null})}
      dialogContentProps={{
        type: DialogType.close,
        title: axisName,
        className: '',
      }}
    >
      <TextField
        label={translate("ui.chartpanel.label.title", "Title")}
        defaultValue={axis.label}
        onChange={(e, newValue?: string) => {
          axis.label = newValue;
          this.updateChart();
        }}
      />
      {!categoricalAxis && <>
        <SpinButton
          label={translate("ui.chartpanel.label.minimum", "Minimum")}
          labelPosition={Position.top}
          value={axis.min.toString()}
          onIncrement={(value: string, event?: any) => spinEventMin(value, majorunitDelta)}
          onDecrement={(value: string, event?: any) => spinEventMin(value, -majorunitDelta)}
          onValidate={(value: string, event?: any) => spinEventMin(value, 0)}
          step={majorunitDelta}
          incrementButtonAriaLabel="Increase value"
          decrementButtonAriaLabel="Decrease value"
        />
        <SpinButton
          label={translate("ui.chartpanel.label.maximum", "Maximum")}
          labelPosition={Position.top}
          value={axis.max.toString()}
          onIncrement={(value: string, event?: any) => spinEventMax(value, majorunitDelta)}
          onDecrement={(value: string, event?: any) => spinEventMax(value, -majorunitDelta)}
          onValidate={(value: string, event?: any) => spinEventMax(value, 0)}
          step={majorunitDelta}
          incrementButtonAriaLabel="Increase value"
          decrementButtonAriaLabel="Decrease value"
        />
        <SpinButton
          label={translate("ui.chartpanel.label.majorunit", "Major Unit")}
          labelPosition={Position.top}
          defaultValue={axis.majorunit ? axis.majorunit.toString() : ""}
          min={0}
          max={axis.max - axis.min}
          step={majorUnitStep}
          onIncrement={(value: string, event?: any) => spinEventMajorUnit(value, majorUnitStep)}
          onDecrement={(value: string, event?: any) => spinEventMajorUnit(value, -majorUnitStep)}
          onValidate={(value: string, event?: any) => spinEventMajorUnit(value, 0)}
          incrementButtonAriaLabel="Increase value"
          decrementButtonAriaLabel="Decrease value"
        />
      </>}
      <Toggle
        label={translate("ui.chartpanel.label.gridlines", "Gridlines")}
        defaultChecked={axis.gridlines}
        onText="On"
        offText="Off"
        onChange={(e, checked?: boolean) => {
          axis.gridlines = checked;
          this.updateChart();
        }}
      />   
    </Dialog>
  }

  // Render Chart toolbar
  renderChartFormat() {
    const opts = this.getChartOptionsObj(this.state.chart);
    if (!opts)
      return <></>;
    const _itemsChart = this.getChartBarItems(opts);
    return <>
      <CommandBar
        items={_itemsChart}
        // overflowItems={_overflowItems}
        overflowButtonProps={{ ariaLabel: 'More commands', menuProps: { styles: { header: this.styleContextualHeader }, items: [] } }}
        farItems={[
          this.commandBarItemClose
        ]}
        ariaLabel="Format"
        style={this.styleCommandBarCss(maxWidthChart)}
        styles={{ root: this.styleCommandBarRoot }}
      // primaryGroupAriaLabel="Email actions"
      // farItemsGroupAriaLabel="More actions"
      />
      {this.state.chartEditAxis && this.renderChartDialogEditAxis()}
    </>;
  }
  private updateChart(updateState: boolean = true) {
    if (updateState)
      this.setState({ chart: this.state.chart }, () => this.repaintChartForEdit());
    else
      this.repaintChartForEdit();
  }

  private repaintChartForEdit(chart?: any) {
    if (!chart)
      chart = this.state.chart;
    chart.repaint();
    // chartPrepareImg(false);
  }

  private styleCommandBarCss = (maxWidth: number): CSSProperties => {
  return {
    position: "absolute", top: "50px",
    // this does not work with auto-sizing of the CommandBar left: "50%", transform: "translate(-50%, 0)"
    left: 0, right: 0, marginLeft: "auto", marginRight: "auto", maxWidth: maxWidth,
  }
};

  private readonly styleCommandBarRoot = {
    border: "solid", borderWidth: "1px", borderColor: commandBarTheme.semanticColors.bodyBackground,
  };

  private readonly styleContextualHeader: IStyle = {
    color: this.props.uitheme.theme.semanticColors.menuItemText,
    fontWeight: "bold",
  };

  private readonly commandBarItemClose = {
    key: 'close',
    text: 'Close',
    ariaLabel: 'Close toolbar',
    iconOnly: true,
    iconProps: { iconName: 'Cancel' },
    onClick: () => {
      this.setState({ visible: false });
      this.props.action("focus");
    },
  };

  // Render Format toolbar (cell font, colors, borders, cell operations - merge, insert, remove, clear)
  renderCellFormat() {
    const _itemFontName: ICommandBarItemProps = {
      key: 'fontName',
      text: 'Font Name',
      onRender: this.renderMenuItemFontName,
    };
    const _itemFontSize: ICommandBarItemProps = {
      key: 'fontSize',
      text: 'Font Size',
      onRender: this.renderMenuItemFontSize,
    };

    // Very narrow screen - put BUI before font name
    const isNarrow = window.innerWidth < 440;
        
    const _itemsBIU: ICommandBarItemProps[] = [
      {
        key: 'formatBold',
        text: 'Bold',
        checked: this.state.isBold,
        // canCheck: true,
        iconOnly: true,
        iconProps: { iconName: 'Bold', styles: this.iconStyles },
        onClick: () => { this.props.action("bold") },
      },
      {
        key: 'formatItalic',
        text: 'Italic',
        checked: this.state.isItalic,
        // canCheck: true,
        iconOnly: true,
        iconProps: { iconName: 'Italic', styles: this.iconStyles },
        onClick: () => { this.props.action("italic") },
      },
      {
        key: 'formatUnderline',
        text: 'Underline',
        checked: this.state.isUnderline,
        canCheck: true,
        iconOnly: true,
        iconProps: { iconName: 'Underline', styles: this.iconStyles },
        onClick: (ev, item) => {
          this.setState({ isUnderline: !item.checked });
          this.props.action("underline");
        },
      },
    ];
    const _items: ICommandBarItemProps[] = [  
      {
        key: 'formatColorFill',
        text: 'Fill Color',
        canCheck: false,
        iconOnly: true,
        iconProps: { iconName: 'BucketColor', styles: this.iconStyles },
        onRender: (item, dismissMenu) => this.renderMenuItemColor(item,
          dismissMenu,
          this.state.colorFill,
          "#FFFFFF",
          (hex?: string) => this.props.action("backColor", hex),
          false
        ),
      },
      {
        key: 'formatColorFont',
        text: 'Font Color',
        canCheck: false,
        iconOnly: true,
        iconProps: { iconName: 'FontColorA', styles: this.iconStyles },
        onRender: (item, dismissMenu) => this.renderMenuItemColor(item,
          dismissMenu,
          this.state.colorFont,
          "#000000",
          (hex?: string) => this.props.action("foreColor", hex),
          false
        ),
      },
      {
        key: 'formatBorders',
        text: translate("ui.label.border", "Borders"),
        iconOnly: true,
        iconProps: {
          imageProps: this._imageFromLegacyClass("allBorders"), styles: this.iconStyles
        },
        subMenuProps: {
          focusZoneProps: {
            direction: FocusZoneDirection.bidirectional, checkForNoWrap: true,
          },
          styles: { header: this.styleContextualHeader, root: {minWidth: 160, maxWidth: 160} },
          items: [
            // don't use "canCheck" as this will show empty space before each menu item
            { key: 'bordersBottom', text: 'Bottom Border', checked: this.state.isBorderBottom, onRender: this.renderMenuItemBorders, className: classNames.item },
            { key: 'bordersTop', text: 'Top Border', checked: this.state.isBorderTop, onRender: this.renderMenuItemBorders, className: classNames.item },
            { key: 'bordersLeft', text: 'Left Border', checked: this.state.isBorderLeft, onRender: this.renderMenuItemBorders, className: classNames.item },
            { key: 'bordersRight', text: 'Right Border', checked: this.state.isBorderRight, onRender: this.renderMenuItemBorders, className: classNames.item},

            { key: 'noBorders', text: 'No Border', checked: false,onRender: this.renderMenuItemBorders, className: classNames.item },
            { key: 'allBorders', text: 'All Borders', checked: false, onRender: this.renderMenuItemBorders, className: classNames.item },
            { key: 'outsideBorders', text: 'Outside Borders', checked: false, onRender: this.renderMenuItemBorders, className: classNames.item },
            { key: 'thickBoxBorder', text: 'Thick Outside Borders', checked: false, onRender: this.renderMenuItemBorders, className: classNames.item},

            { key: 'topDoubleBottomBordes', text: 'Top and Double Bottom Border', checked: false,onRender: this.renderMenuItemBorders, className: classNames.item },
            { key: 'topThickBottomBorders', text: 'Top and Thick Bottom Border', checked: false, onRender: this.renderMenuItemBorders, className: classNames.item },
            { key: 'doubleBottomBorders', text: 'Bottom Double Border', checked: false, onRender: this.renderMenuItemBorders, className: classNames.item },
            { key: 'topBottomBorders', text: 'Top and Bottom Border', checked: false, onRender: this.renderMenuItemBorders, className: classNames.item},            
          ],
        },
      },      
      this.commandBarSeparator('formatSeparator1'),
      {
        key: 'formatAlignMenu',
        text: 'Text Alignment',
        iconOnly: true,
        iconProps: { iconName: "AlignLeft", styles: this.iconStyles },
        subMenuProps: {
          focusZoneProps: {
            direction: FocusZoneDirection.bidirectional,
            checkForNoWrap: true,
          },
          styles: { header: this.styleContextualHeader },
          items: [
            { key: 'alignAlignHeader', text: 'Text Alignment', 'data-no-horizontal-wrap': true, itemType: ContextualMenuItemType.Header,
              onRenderIcon: () => (<></>),
            },
            // don't use "canCheck" as this will show empty space before each menu item
            {
              key: 'AlignLeft', title: 'Align Text Left', checked: this.state.hAlign == 0, onRender: this.renderMenuItemAlign, className: classNames.item,
              onClick: () => this.props.action("leftAlign")
            },
            {
              key: 'AlignCenter', title: 'Center', checked: this.state.hAlign == 1, onRender: this.renderMenuItemAlign, className: classNames.item,
              onClick: () => this.props.action("centerAlign")
            },
            {
              key: 'AlignRight', title: 'Align Text Right', checked: this.state.hAlign == 2, onRender: this.renderMenuItemAlign, className: classNames.item,
              onClick: () => this.props.action("rightAlign")
            },
            {
              key: 'AlignVerticalTop', title: 'Top Align', checked: this.state.vAlign == 0, onRender: this.renderMenuItemAlign, className: classNames.item,
              onClick: () => this.props.action("topAlign")
            },
            {
              key: 'AlignVerticalCenter', title: 'Middle Align', checked: this.state.vAlign == 1, onRender: this.renderMenuItemAlign, className: classNames.item,
              onClick: () => this.props.action("middleAlign")
            },
            {
              key: 'AlignVerticalBottom', title: 'Bottom Align', checked: this.state.vAlign == 2, onRender: this.renderMenuItemAlign, className: classNames.item,
              onClick: () => this.props.action("bottomAlign")
            },
            
            { key: 'alignDivider1', text: '', 'data-no-horizontal-wrap': true, itemType: ContextualMenuItemType.Divider },            

            { key: 'alignIndentHeader', text: 'Indent', 'data-no-horizontal-wrap': true, itemType: ContextualMenuItemType.Header,
              onRenderIcon: () => (<></>),
            },
            {
              key: 'alignIndentIncrease', text: 'Increase', 'data-no-horizontal-wrap': true, iconProps: {
                iconName: 'IncreaseIndentLegacy', styles: this.iconStyles
              },
              onClick: () => this.props.action("increaseIndent")
            },
            {
              key: 'alignIndentDecrease', text: 'Decrease', 'data-no-horizontal-wrap': true, iconProps: { iconName: 'DecreaseIndentLegacy', styles: this.iconStyles },
              onClick: () => this.props.action("decreaseIndent")
            },
          ],
        },
      },
      {
        key: 'formatMergeAction',
        text: this.state.canMerge ? this._firstWord(translate("ui.hint.mergeCenter", "Merge")) : this._firstWord(translate("ui.hint.unmerge", "Unmerge cells")),
        iconProps: { iconName: this.state.canMerge ? 'Combine' : 'Split', styles: this.iconStyles },
        onClick: () => this.props.action(this.state.canMerge ? "mergeCenter" : "unmerge")
      },
      this.commandBarSeparator('formatSeparator2'),    
    ];

    if (isNarrow) {
      _items.unshift(_itemFontSize, ..._itemsBIU, _itemFontName, );
    } else {
      _items.unshift(_itemFontName, _itemFontSize, ..._itemsBIU);
    }

    const _overflowItems: ICommandBarItemProps[] = this.prepareCellActionsMenuItems();
    if (this.state.canUndo || this.state.canRedo) {
      _overflowItems.push(this.commandBarSeparator('formatSeparatorOverflowLast'));
      if (this.state.canUndo)
        _overflowItems.push({
          key: 'formatUndo', text: 'Undo Typing/Clipboard',
          iconProps: { iconName: 'Undo', styles: this.iconStyles },
          onClick: () => this.props.action("undo")
        });
      if (this.state.canRedo)
        _overflowItems.push({
          key: 'formatRedo', text: 'Redo Typing',
          iconProps: { iconName: 'Redo', styles: this.iconStyles },
          onClick: () => this.props.action("redo")
        });
  }

    return <CommandBar
      items={_items}
      overflowItems={_overflowItems}
      overflowButtonProps={{ ariaLabel: 'More commands', menuProps: { styles: { header: this.styleContextualHeader }, items: [] } }}
      farItems={[
        this.commandBarItemClose
      ]}
      ariaLabel="Format"
      style={this.styleCommandBarCss(maxWidthFormat)}
      styles={{ root: this.styleCommandBarRoot }}
    // primaryGroupAriaLabel="Email actions"
    // farItemsGroupAriaLabel="More actions"
    />;
  }

  public prepareCellActionsMenuItems(): ICommandBarItemProps[] {
    return [
      { key: 'headerCells', text: translate("ui.label.cells", "Cells"), itemType: ContextualMenuItemType.Header, onRenderIcon: () => (<></>), },
      {
        key: 'formatCellsInsert',
        text: translate("ui.label.insert", "Insert"),
        title: translate("ui.hint.add", "Insert row, column or sheet"),
        iconProps: { imageProps: this._imageFromLegacyClass("rmn-insert-rows", 23), styles: { root: { width: 23 } } },
        subMenuProps: {
          items: [
            this.itemCellsAction("addCellsRight"),
            this.itemCellsAction("addCellsDown"),
            this.itemCellsAction("addRow"),
            this.itemCellsAction("addCol"),
            this.itemCellsAction("addSheet")
          ]
        }
      },
      {
        key: 'formatCellsDelete',
        text: translate("ui.label.delete", "Delete"),
        title: translate("ui.hint.delete", "Delete row, column or sheet"),
        iconProps: { imageProps: this._imageFromLegacyClass("rmn-remove-rows", 23), styles: { root: { width: 23 } } },
        subMenuProps: {
          items: [
            this.itemCellsAction("deleteCellsLeft"),
            this.itemCellsAction("deleteCellsUp"),
            this.itemCellsAction("deleteRow"),
            this.itemCellsAction("deleteCol"),
            this.itemCellsAction("deleteSheet")
          ]
        }
      },
      {
        key: 'formatCellsClear',
        text: translate("ui.label.clear", "Clear"),
        title: translate("ui.hint.clear", "Clear cell"),
        iconProps: { imageProps: this._imageFromLegacyClass("rmn-clear", 23), styles: { root: { width: 23 } } },
        subMenuProps: {
          items: [
            this.itemCellsAction("clearAll"),
            this.itemCellsAction("clearFormat"),
            this.itemCellsAction("clearContent"),
            this.itemCellsAction("clearComments")
          ]
        }
      },
    ]
  }

  private itemCellsAction(action: string, name?: string): IContextualMenuItem {
    const text = translate("ui.label." + action, name ? name : "");
    return {
      key: 'cells_' + action,
      text: text,
      onClick: () => this.props.action(action),
    }
  }
}
