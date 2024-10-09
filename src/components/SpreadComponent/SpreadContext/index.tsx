import { createContext, useContext } from 'react'

//TODO:2 темы?
export type SpreadContextType = {
    language: string
    startProgress:(message: string, short: boolean, level?: number) => any
    stopProgress: (level?: number) => any,
    showErrorMessage: (message: string, title?: any) => void
}

export const SpreadAppContext = createContext<SpreadContextType>({
    language: 'en',
    startProgress: () => {},
    stopProgress: () => {},
    showErrorMessage: () => {}
})


export const useAppContext = () => useContext(SpreadAppContext);