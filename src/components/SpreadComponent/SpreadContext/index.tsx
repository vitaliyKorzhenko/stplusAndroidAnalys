import { createContext, useContext } from 'react'
import { IUITheme } from '../../../types/IUITheme'

//TODO:2 темы?
export type SpreadContextType = {
    uitheme: IUITheme,
    language: string
    startProgress:(message: string, short: boolean, level?: number) => any
    stopProgress: (level?: number) => any,
    showErrorMessage: (message: string, title?: any) => void
}

export const SpreadAppContext = createContext<SpreadContextType>({
    uitheme: null,
    language: 'en',
    startProgress: () => {},
    stopProgress: () => {},
    showErrorMessage: () => {}
})


export const useAppContext = () => useContext(SpreadAppContext);