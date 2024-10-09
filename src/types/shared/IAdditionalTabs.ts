// TODO:
// var additionalTabs: any[] = [];
// additionalTabs.push({
//   name: helpText,
//   data: { description: data && data.description ? data.description : "" }
// });
export interface IAdditionalTabs {
    name: string;
    data: { description: string};
}