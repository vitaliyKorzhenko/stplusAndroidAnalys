import { createContext, useContext } from 'react'

//TODO:2 темы?
export type SpreadContextType = {
    language: string
}

export const SpreadAppContext = createContext<SpreadContextType>({
    language: 'en'
})


export const useAppContext = () => useContext(SpreadAppContext);