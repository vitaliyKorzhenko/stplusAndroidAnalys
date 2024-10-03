/*

    Spread contextual menu.

*/

import React from 'react';

import { ContextualMenu, DirectionalHint, IContextualMenuItem, Point } from 'office-ui-fabric-react';

import { Clipboard } from './clipboard'

export interface ISpreadMenuProps {
}

export interface ISpreadMenuState {
  visible: boolean;
  position: Point;
  spread: GcSpread.Sheets.Spread;
}

export class ContextualMenuSpread extends React.Component<ISpreadMenuProps, ISpreadMenuState>{

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
      position: null,
      spread: null,
    }
  }

  private ref = React.createRef();

  private clipboardAvailable = Clipboard.isSupported();

  render() {
    let items: IContextualMenuItem[] = [];
    const sheet = this.state.visible && this.state.spread?.getActiveSheet();
    //
    if (sheet) {
      if (this.clipboardAvailable) {
        const itemsClipboard = [
          {
            key: 'contextmenu.copy',
            name: "Copy",
            iconProps: { iconName: "Copy" },
            onClick: async () => {
              await Clipboard.copy(sheet._doCopy(false));
            }
          },
          {
            key: 'contextmenu.cut',
            name: "Cut",
            iconProps: { iconName: "Cut" },
            onClick: async () => {
              await Clipboard.copy(sheet._doCut(false));
            }
          },
          {
            key: 'contextmenu.paste',
            name: "Paste",
            iconProps: { iconName: "Paste" },
            onClick: () => {
              sheet._doPaste();
            }
          }
        ];
        items.push(...itemsClipboard);
      }
    }

    return <ContextualMenu
      shouldFocusOnMount={true}
      hidden={!this.state.visible || !this.state.spread}
      onDismiss={() => this.setState({ visible: false })}
      target={this.state.position}
      directionalHint={DirectionalHint.rightTopEdge}
      items={items}
    />
  }

  public showContextualMenu(position: Point, spread: GcSpread.Sheets.Spread) {
    this.setState({
      visible: true,
      position: position,
      spread: spread,
    });
  }

}

