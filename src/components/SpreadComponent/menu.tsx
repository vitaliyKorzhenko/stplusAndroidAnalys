import * as React from 'react';
import { Menu, MenuTrigger, MenuPopover, MenuList, MenuItem } from '@fluentui/react-components';
import { Clipboard } from './clipboard';

export interface ISpreadMenuProps {}

export interface ISpreadMenuState {
  visible: boolean;
  position: { x: number; y: number } | null; // Объект для позиции
  spread: GcSpread.Sheets.Spread | null;
}

export class ContextualMenuSpread extends React.Component<ISpreadMenuProps, ISpreadMenuState> {
  private clipboardAvailable = Clipboard.isSupported();

  constructor(props: ISpreadMenuProps) {
    super(props);
    this.state = {
      visible: false,
      position: null,
      spread: null,
    };
  }

  render() {
    const { visible, position, spread } = this.state;
    const sheet = visible && spread?.getActiveSheet();

    return (
      <Menu open={visible} onOpenChange={(e, data) => this.setState({ visible: data.open })}>
        <MenuTrigger>
          <div />
        </MenuTrigger>
        {visible && position && sheet ? ( // Убедимся, что все значения определены
          <MenuPopover style={{ position: 'absolute', top: position.y, left: position.x }}>
            <MenuList>
              {this.clipboardAvailable && (
                <>
                  <MenuItem
                    icon={<span className="icon-copy" />}
                    onClick={async () => {
                      await Clipboard.copy(sheet._doCopy(false));
                    }}
                  >
                    Copy
                  </MenuItem>
                  <MenuItem
                    icon={<span className="icon-cut" />}
                    onClick={async () => {
                      await Clipboard.copy(sheet._doCut(false));
                    }}
                  >
                    Cut
                  </MenuItem>
                  <MenuItem
                    icon={<span className="icon-paste" />}
                    onClick={() => {
                      sheet._doPaste();
                    }}
                  >
                    Paste
                  </MenuItem>
                </>
              )}
            </MenuList>
          </MenuPopover>
        ): <></>}
      </Menu>
    );
  }

  public showContextualMenu(position: { x: number; y: number }, spread: GcSpread.Sheets.Spread) {
    this.setState({
      visible: true,
      position,
      spread,
    });
  }
}
