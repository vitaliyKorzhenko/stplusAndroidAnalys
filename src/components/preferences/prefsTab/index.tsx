import React from 'react';
import OptionSections from '../outputOptions';
import { IPreferencesOptions, IPreferencesSections } from '../types';
import NumericFormatSections from '../numericFormatOptions';
import PreferencesStatisticsSection from '../prefsStatistics';

interface PreferencesOptionsSection {
    mainOptions: IPreferencesSections[]; 
    outOptions: IPreferencesOptions[];
    numericFormatOptions: IPreferencesOptions[];
    statisticsOptions: IPreferencesOptions[];
    updatePrefsOptions: (sectionName: string, item: IPreferencesOptions, newValue: any) => void;
}

const PrefsTab: React.FC<PreferencesOptionsSection> = ({outOptions, statisticsOptions, numericFormatOptions, updatePrefsOptions}) => {

    return (
        <div style={{
            width: '100%',    
            height: '600px',
            overflowY: 'auto', // Enable vertical scrolling   
 
        }}>
           <OptionSections
            name={'Output Options'}
            items={outOptions}
            updatePrefsOptions={updatePrefsOptions}
           />
           <NumericFormatSections
            name={'Numeric Format'}
            items={numericFormatOptions}
            updatePrefsOptions={updatePrefsOptions}

            
            />
            <PreferencesStatisticsSection
            name={'Statistics'}
            items={statisticsOptions}
            updatePrefsOptions={updatePrefsOptions}
            />
        </div>
    );
};

export default PrefsTab;
