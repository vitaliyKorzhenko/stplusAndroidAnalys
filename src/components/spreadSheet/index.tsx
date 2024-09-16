import React from 'react';

import { SpreadAppContext } from './SpreadContext';
import { ISpreadComponentProps, ISpreadComponentState } from './types';

import './Charts/spread-d3.css'


export class SpreadComponent extends React.Component<ISpreadComponentProps, ISpreadComponentState> {

  // References
  private refSpread = React.createRef<HTMLDivElement>();
  private refFormulaBar = React.createRef<HTMLDivElement>();
  private refFormulaElem = React.createRef<HTMLDivElement>();
  private refPositionBox = React.createRef<HTMLInputElement>();
  private refStyleElem = React.createRef<HTMLInputElement>();


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
