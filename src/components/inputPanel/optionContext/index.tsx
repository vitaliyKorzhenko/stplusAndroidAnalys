import React, { createContext, useState, useContext, ReactNode } from 'react';
import { IOptionItem } from '../../../types/options';

interface OptionContextProps {
    options: Record<string, IOptionItem>;
    setOptionValue: (name: string, value: any) => void;
}

const OptionContext = createContext<OptionContextProps | undefined>(undefined);

export const OptionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [options, setOptions] = useState<Record<string, IOptionItem>>({});

    const setOptionValue = (name: string, value: any) => {
        setOptions(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                value,
            },
        }));
    };

    return (
        <OptionContext.Provider value={{ options, setOptionValue }}>
            {children}
        </OptionContext.Provider>
    );
};

export const useOptionContext = (): OptionContextProps => {
    const context = useContext(OptionContext);
    if (!context) {
        throw new Error('useOptionContext must be used within an OptionProvider');
    }
    return context;
};
