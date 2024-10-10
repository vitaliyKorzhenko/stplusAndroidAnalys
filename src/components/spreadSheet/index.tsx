import React from 'react';

import { SpreadAppContext } from './SpreadContext';
import { ISpreadComponentProps, ISpreadComponentState } from './types';

import './Charts/spread-d3.css'

//const spreadNS = GcSpread.Sheets;

let lastId = 0;
export function newId(prefix='id') {
    lastId++;
    return lastId == 1 ? prefix : `${prefix}${lastId}`;
}

export class SpreadComponent extends React.Component<ISpreadComponentProps, ISpreadComponentState> {

  // References
  private refSpread = React.createRef<HTMLDivElement>();
  private refFormulaBar = React.createRef<HTMLDivElement>();
  private refFormulaElem = React.createRef<HTMLDivElement>();
  private refPositionBox = React.createRef<HTMLInputElement>();
  private refStyleElem = React.createRef<HTMLInputElement>();

  // HTML IDs
  private idSpread = newId("spread");
  // TODO: УДАЛИТЬ ВСЕ после сравнения spreadToJson vs spreadToJsonOld
  private idSpreadToSave= "ssForSave";

    // Secondary for save; TODO: remove
    private spreadToSave?: GcSpread.Sheets.Spread;

  constructor(props: any) {
    super(props);

    this.state = {}
  }

  public spread: GcSpread.Sheets.Spread | null = null;
  public spreadFormulaTextBox: GcSpread.Sheets.FormulaTextBox | null = null;

  initTips = () => {
    if (!this.spread) return;

    this.spread.showScrollTip(3);
    this.spread.showResizeTip(3);
    this.spread.showDragDropTip(true);
    this.spread.showDragFillTip(true);
  }

  public blurFocus(): void {
    console.log('blurFocus...');
  }

  private spreadKeyDown(e: KeyboardEvent) {
    //TODO:
    console.log('copy spread key down');
  }

  public loadDataFromJson = (jsonData: string | object): boolean => {
    //TODO: copy !
    return true;
  }

  private unloadSpread() {
    console.log("===before unload====");
    // this.props.dataProvider.saveData(this.spreadToJson());
  }

  private initSpread() {
    //TODO: defSheetNameLocValue
    /* was: document.getElementById(this.idSpread) */
    //this.spread = new spreadNS.Spread(this.refSpread.current, { sheetCount: 1 });//window['initspread'](this.idSpread);//

    
    this.initTips();
    //this.spread.useWijmoTheme = true;this.spread.repaint();



    // Default style
    // const style = new spreadNS.Style();
    // style.hAlign = 2;
    // style.vAlign = spreadNS.VerticalAlign.bottom;
    // // New: autofit sometimes does not work, shrink numbers
    // style.shrinkToFit = true;
    // style.name = 'styleDefNumber';
    // // style.formatter = data.namedStyles[i].formatter;
    // this.spread.addNamedStyle(style);

    // bind event when selection is changed
    // this.spread.bind(spreadNS.Events.SelectionChanged,this.selectionChanged );
    // this.spread.bind(spreadNS.Events.ActiveSheetChanged, this.activeSheetChanged);
    // this.spread.bind(spreadNS.Events.SheetTabClick, (sender: any, args: any) => {
    //   if (args.sheet === null && args.sheetName === null) {
    //     setTimeout(()=> {
    //       if (this.spread) {
    //       const activeSheet = this.spread.getActiveSheet();
    //       const defStyle = new spreadNS.Style();
    //       defStyle.vAlign = 2;
    //       activeSheet.setDefaultStyle(defStyle);
    //       }
    //     }, 300);
    //   }
    // });

    // TODO: any changes/events to active sheet must be also in fromJSON()
    // if no data to load
    //var activeSheet = this.spread.getActiveSheet();
   // activeSheet.setActiveCell(0, 0);
   // activeSheet.bind(spreadNS.Events.ClipboardPasted, this.clipboardPasted);
    // // if debug
    // window['spread'] = this.spread;

    // Secondary SpreadJS instance, used to save file
   // this.spreadToSave = new spreadNS.Spread(document.getElementById(this.idSpreadToSave), { sheetCount: 1 });

    console.log('initSpread DONE');

    this.props.dataProvider.loadData().then((value: string) => this.loadDataFromJson(value));

    // ALERT ACHTUNG
    // setInterval(()=> { const s1 = this.spreadToJson(); const s2 = this.spreadToJsonOld(); console.log(s1); console.log(s2); console.log(s1 === s2)}, 10000)
   // this.spread.focus();

  }

  componentDidMount(): void {
    /*
    const MINUTE_MS = 90000;
    this.interval = setInterval(async () => {
      this.props.dataProvider.saveData(this.spreadToJson());
    }, MINUTE_MS);
    */

    console.error('MOUNT SPREAD', this.refSpread.current)
    window.addEventListener('beforeunload', this.unloadSpread);

    this.initSpread();
    const spreadElem = this.refSpread.current;
    if (spreadElem)
      spreadElem.addEventListener("keydown", this.spreadKeyDown);
  }

  componentWillUnmount(): void {
    //clearInterval(this.interval);
    const spreadElem = this.refSpread.current;
    if (spreadElem)
      spreadElem.removeEventListener("keydown", this.spreadKeyDown);
      
    window.removeEventListener('beforeunload', this.unloadSpread);
  }

  render() {
    console.error('Spread render...')

    return (
      <SpreadAppContext.Consumer>
        {
          _context => (
            <>
              <div id="" className="pusher" style={{ width: '100%', height: 'calc(100% - 50px)' }}>
                <input id="styleElem" type="text" ref={this.refStyleElem} style={{ display: "none" }} />
                <div id="formulaBar" className="formulaBarConteiner" ref={this.refFormulaBar}>
                  <table>
                    <tbody>
                      <tr>
                        <td width="10%">
                          <input type="text" readOnly ref={this.refPositionBox} id="positionbox" />
                        </td>
                        <td className="noselect">
                          <img id="office-splitter" alt=":" 
                            style={{ maxWidth: "100%", verticalAlign: "middle", boxSizing: "border-box"}}
                            src={"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAYAAAAKCAYAAACXDi8zAAAAAXNSR0IDN8dNUwAAAAlwSFlzAAAOwwAADsMBx2+oZAAAACpJREFUCNdjvHfvHgMINDQ0/IfSjCCaiQEHYITpQAc4dcAlQHbA7BlwOwCqJhXcrljHngAAAABJRU5ErkJggg=="}
                          />
                        </td>
                        <td width="90%">
                          <div className="formulaBox" contentEditable="true" spellCheck="false" ref={this.refFormulaElem}></div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div
                  id="spreadComponent"
                  ref={this.refSpread}
                  className="spreadcomponent"
                  style={{ height: "calc(100% - 30px)" }}
                  onContextMenu={() => {
                    console.log('SpreadComponent onContextMenu...');
                    return false;
                   }}
                ></div>
              </div>
            </>
          )
        }
      </SpreadAppContext.Consumer>
    );
  }

}

SpreadComponent.contextType = SpreadAppContext;
