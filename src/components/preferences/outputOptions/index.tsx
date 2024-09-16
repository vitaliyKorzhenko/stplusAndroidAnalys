import React from 'react';
import { Divider, Label } from '@fluentui/react-components';
import { IPreferencesOptions } from '../types';
import { PrefFont } from '../prefFont';
import { PrefFontSize } from '../prefFontSize';
import { PrefsCheckBox } from '../prefsCheckBox';

interface PreferencesOptionsSection {
    name: string;
    items: IPreferencesOptions[];
    updatePrefsOptions: (sectionName: string, item: IPreferencesOptions, newValue: any) => void;
}

const OptionSections: React.FC<PreferencesOptionsSection> = ({ name, items, updatePrefsOptions }) => {
   

   
    console.log('items', items);

    return (
        <div style={{
            width: '100%',     
        }}>
            <Divider appearance="strong">
                <Label size='large' style={{fontWeight: 'bold'}}>
                {name}
                </Label>
            </Divider>
           {items.map((item: IPreferencesOptions, index: number) => (
                <div key={index}
                style={{
                    width: '90%',
                    padding: '5px',
                }}
                >
                    {
                        item.nodename == 'font' ?
                        <PrefFont 
                        option={item}
                        name={name}
                        updatePrefsOptions={updatePrefsOptions}
                        />
                        :
                        item.nodename == 'fontsize' ?
                        <PrefFontSize
                        option={item}
                        name={name}
                        updatePrefsOptions={updatePrefsOptions}
                        />
                        :
                        item.nodename == 'checkbox' ?
                        <PrefsCheckBox
                        item={item}
                        name={name}
                        updatePrefsOptions={updatePrefsOptions}
                        />
                        :
                        <></>
                    }
                </div>
            ))}
        </div>
    );
};

export default OptionSections;
