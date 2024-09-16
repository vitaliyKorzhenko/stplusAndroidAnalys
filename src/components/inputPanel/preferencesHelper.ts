import { IPreferencesOptions, IPreferencesSections } from "../preferences/types"

//class for preferences helper
export class PreferencesHelper {

    public static mainItems: IPreferencesSections[] = [];

    public static parseItemsFromJsonToPrefOptions(item: any): IPreferencesOptions[] {
        let result: IPreferencesOptions[] = item.items.map((item: any) => {
            return {
                nodename: item.nodename ?? '',
                value: item.value ?? '',
                name: item.name ?? '',
                select: item.select ?? '',
                returnname: item.returnname ?? '',
                min: item.min ?? 0,
                max: item.max ?? 0,
            }
        })

        return result;
    }

    //get main options
    public static getMainItems(): IPreferencesSections[] {
        return this.mainItems;
    }

    //  get const outOptions = preferences.sections.filter((section) => section.name == 'Output Options');
    //get output options
    public static getOutputOptions(): IPreferencesOptions[] {
        return this.mainItems.filter((item: IPreferencesSections) => item.name == 'Output Options')[0].items;
    }

    //numericFormatOptions
    public static getNumericFormatOptions(): IPreferencesOptions[] {
        return this.mainItems.filter((item) => item.name == 'Numeric Format')[0].items;
    }

    //statisticsOptions
    public static getStatisticsOptions(): IPreferencesOptions[] {
        return this.mainItems.filter((item) => item.name == 'Statistics')[0].items;
    }



    public static parsePreferencesJson(preferences: any): IPreferencesSections[] {
        const parsedPreferences = typeof preferences === 'string' 
        ? JSON.parse(preferences) 
        : preferences;

        const mainPrefences: IPreferencesSections[] = parsedPreferences.sections.map((section: any) => ({
            name: section.name,
            items: section.items.map((item: any) => ({
                nodename: item.nodename ?? '',
                value: item.value ?? '',
                name: item.name ?? '',
                select: item.select ?? '',
                returnname: item.returnname ?? '',
                min: item.min ?? 0,
                max: item.max ?? 0,
            }))
        }));

        PreferencesHelper.mainItems = mainPrefences;
        console.log('Prefrences Helper, main PREFERENCES', mainPrefences);
        return mainPrefences;
    }


    //compare to preferenceOptions option1 and option2
    public static comparePreferenceOptions(option1: IPreferencesOptions, option2: IPreferencesOptions): boolean {
        return option1.name == option2.name && option1.nodename == option2.nodename;
    }
    
}