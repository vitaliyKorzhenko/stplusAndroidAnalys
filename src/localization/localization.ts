import { tooltips } from "./tooltipsjs";


export const languagesList = Object.keys(tooltips);

let selectedLanguage = "en";
let selectedLanguageData: any;

export interface AppLocalizationUiInfo {
   code: string;
   display: string;
}

// Returns list of available languages
export function getAvailableLanguagesUiList(): AppLocalizationUiInfo[] {
   const langs: AppLocalizationUiInfo[] = [];
   languagesList.forEach(li => {
      //TODO: filter langs
      //if (li != 'ru')
      langs.push({ code: li, display: tooltips[li]["name.display"] });
   })
   return langs;
}

export function activateLanguage(langCode: string): string {
   // TODO: Release, EN Submit only: 
   if (tooltips[langCode])
      selectedLanguage = langCode;
   else
      selectedLanguage = "en";
   selectedLanguageData = tooltips[selectedLanguage];
   // setTimeout(() => {
   //    if (window.hasOwnProperty("updateLanguage"))
   //       window["updateLanguage"].call(null, selectedLanguage);
   // }, 3000);
   return selectedLanguage;
}

// Returns language used to process translate requests
export function getActiveLanguage(): string {
   return selectedLanguage;
}

// Returns display name for language defined by langCode (en, es, de, etc.)
export function getLanguageDisplayName(langCode: string): string {
   if (tooltips[langCode])
      return tooltips[langCode]['name.display']
   else
      return '';
}

// Returns active language display name
export function getActiveLanguageDisplayName(): string {
   return tooltips[selectedLanguage]['name.display'];

}

// Returns language name (code) to pass to core call
export function getLanguageCoreName(langCode: string): string {
   if (tooltips[langCode])
      return tooltips[langCode]['name.core']
   else
      return '';
}

// Returns active language name (code) to pass to core call
export function getActiveLanguageCoreName(): string {
   if (tooltips[selectedLanguage] && tooltips[selectedLanguage]['name.core'])
      return tooltips[selectedLanguage]['name.core']
   else
      return 'English';
}


export function translate(key: string, defaultText: string) {
   return selectedLanguageData && selectedLanguageData[key] ? selectedLanguageData[key] : defaultText;
}

/*
Splits label text by first bracket (square or round) occurrence.
"Some Statistics (By group)" => ["Some Statistics", "(By group)"]
"Compare Apples [Paired]" => ["Compare Apples","[Paired]"]
"No brackets" => ["No brackets"]
*/
export function splitByBrackets(text: string): string[] {
   if (!text)
      return [text];
   const posr = text.indexOf('(');
   const poss = text.indexOf('[');
   const pos = posr > -1 ? posr : poss;
   if (pos === -1)
      return [text];
   return [text.substr(0, pos).trim(), text.substr(pos, text.length - pos)];
}