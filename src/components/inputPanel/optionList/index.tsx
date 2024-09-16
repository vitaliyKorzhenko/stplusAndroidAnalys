import { Label, Select } from '@fluentui/react-components';
import React from 'react';
import { IOptionItem } from '../../../types/options';
import { IMainOtionItem } from '../types/optionProps';

interface OptionListProps extends IMainOtionItem {
   option: IOptionItem

}

//state interface

interface OptionListState {
    optionValues: string[];
    selectedValue: string;
}

class OptionList extends React.Component<OptionListProps, OptionListState> {
    constructor(props: OptionListProps) {
        let values: string[] = props.option.value.split('\\n')
        super(props);
        this.state = {
           optionValues: values,
           selectedValue: this.props.option.currentvalue ? this.props.option.currentvalue : values[0],
        };

    }
    
    render() {
        console.log('OptionList', this.props.option);
        return (
            <div style={{
                width: '100%',
            }}
            key = {this.props.option.name}
            >
                
                <Label >{this.props.option.name}</Label>

   
                <Select
                    value={this.state.selectedValue}
                    style={{
                        width: '100%',
                        minWidth: '200px',
                    }}
                   // multiple={this.props.multiple}
                    onChange={(event) => {
                        console.log('selected value', event.target.value);
                        console.log('tab and option', this.props.selectedTab, this.props.option);
                        this.setState({ selectedValue: event.target.value })
                        //update in parent
                        let newOtion = this.props.option;
                        newOtion.currentvalue = event.target.value;
                        this.props.addOptionElement(this.props.selectedTab, newOtion);
                    }
                }
                >
                    {this.state.optionValues.map((option) => (
                        <option key={option} value={option}>
                            {option}
                        </option>
                    ))}
                </Select>
            </div>
        );
 }
}


export default OptionList;
