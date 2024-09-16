import { IOptionItem } from "../../../types/options";

export interface IMainOtionItem {
    selectedTab: string;
    addOptionElement: (tabName: string, item: IOptionItem) => void;
}