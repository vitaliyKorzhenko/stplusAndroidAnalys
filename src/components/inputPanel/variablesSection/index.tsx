import React from 'react';
import { IWindowItem } from '../../../types/window';
import { VarRangeMulti } from '../varRangeMulti';
import VarRangeSingle from '../varRangeSingle';
import ConstsubstituteRange from '../constsubstituteRange';
import { CellRange } from '../cellRange';

interface VariablesSectionProps {
    window: string;
}

const VariablesSection: React.FC<VariablesSectionProps> = ({ window }) => {
    const parsedWindow = JSON.parse(window);
    const allItems: IWindowItem[] = parsedWindow.items;
    const items: IWindowItem[] = allItems.filter((item: IWindowItem) => { return ((item.nodename == 'VarRange' || item.nodename == 'VarRangeText') && !item.constsubstitute)});
    const constsubstituteItems: IWindowItem[] = parsedWindow.items.filter((item: IWindowItem) =>{ return (item.nodename == 'VarRange' || item.nodename == 'VarRangeText') && item.constsubstitute && item.constsubstitute == true});
    //cell items
    const cellItems: IWindowItem[] = allItems.filter((item: IWindowItem) => { return item.nodename == 'Cell' });
    const testOptions = [
        { key: '1', text: 'A' },
        { key: '2', text: 'B' },
        { key: '3', text: 'C' },
    ];


    return (
        <div style={{
            width: '100%',  
            maxHeight: '400px', // Set a fixed height for the container
        overflowY: 'auto', // Enable vertical scrolling   
        }}>
           {items.map((item: IWindowItem, index: number) => (
                <div key={index}
                style={{
                    width: '90%',
                    padding: '10px',
                }}
                >
            { item.multi ? 
            <VarRangeMulti
                options={testOptions}
                label={item.label}
                description={item.description}
            />
            :
                <VarRangeSingle
                        size={200}
                        multiple={item.multi}
                        defaultValue="1"
                        options={testOptions}
                        label={item.label}
                        description={item.description}
                    />
            }
                </div>
            
            
            ))}


            {
                constsubstituteItems.map((item: IWindowItem, index: number) => (
                    <div key={index}
                    style={{
                        width: '90%',
                        padding: '10px',
                    }}
                    >
                        <ConstsubstituteRange
                            size={200}
                            multiple={item.multi}
                            defaultValue="1"
                            options={testOptions}
                            label={item.label}
                            description={item.description}
                        />
                </div>
                ))
            } 
            {
                cellItems.map((item: IWindowItem, index: number) => (
                    <div key={index}
                    style={{
                        width: '90%',
                        padding: '10px',
                    }}
                    >
                       <CellRange
                          item={item}
                        />
                </div>
                ))
            }   
        </div>
    );
};

export default VariablesSection;
