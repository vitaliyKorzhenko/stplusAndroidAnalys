import { Button, Label, Select } from '@fluentui/react-components';
import React from 'react';
import {
   SelectObject20Filled,
   AddSquareRegular,
} from "@fluentui/react-icons";
import { InfoLabel } from '../../InfoLabel';

interface VariablesInputProps {
    size: number;
    multiple: boolean;
    defaultValue: string;
    options: { key: string; text: string }[];
    label: string;
    description: string;
}

//state interface

interface VariablesInputState {
    selectedValue: string;
}

class VarRangeSingle extends React.Component<VariablesInputProps, VariablesInputState> {
    constructor(props: VariablesInputProps) {
        super(props);
        this.state = {
            selectedValue: props.defaultValue,
        };

    }

    
    render() {
        return (
            <div style={{
                width: '100%',
            }}>
                <div style={{ 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    width: '100%',
}}>
    <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        padding: '5px', 
        flex: 1,  // Занимает всю доступную ширину
    }}>
        <Label required={true}>{this.props.label}</Label>
        <InfoLabel description={this.props.description ?? ''} />

    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button 
            size="medium"
            appearance="subtle" 
            icon={<SelectObject20Filled />}
            style={{ marginRight: '2px' }} // Небольшой отступ между кнопками
        >
            Cols
        </Button>
        <Button 
            size="medium"
            appearance="subtle"
            icon={<AddSquareRegular />}
        >
            Range
        </Button>
    </div>
</div>
                <Select
                    value={this.state.selectedValue}
                    style={{
                        width: '100%',
                        minWidth: '200px',
                    }}
                   // multiple={this.props.multiple}
                    onChange={(event) => this.setState({ selectedValue: event.target.value })}
                >
                    {this.props.options.map((option) => (
                        <option key={option.key} value={option.key}>
                            {option.text}
                        </option>
                    ))}
                </Select>
            </div>
        );
    }
}

export default VarRangeSingle;
