import { Button, Input, Label, Select, Switch } from '@fluentui/react-components';
import React from 'react';
import {
    Info24Regular,
    SelectObject20Filled,
    AddSquareRegular,
} from "@fluentui/react-icons";
import { InfoLabel } from '../../InfoLabel';

interface ConstsubstituteRangeProps {
    size: number;
    multiple: boolean;
    defaultValue: string;
    options: { key: string; text: string }[];
    label: string;
    description: string;
}

//state interface

interface ConstsubstituteRangeState {
    selectedValue: string;
    useConstantValue: boolean;
}

class ConstsubstituteRange extends React.Component<ConstsubstituteRangeProps, ConstsubstituteRangeState> {
    constructor(props: ConstsubstituteRangeProps) {
        super(props);
        this.state = {
            selectedValue: props.defaultValue,
            useConstantValue: false,
        };

    }


    renderInputRange() {
        return (<div style={{
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
                    <Button
                        size="small"
                        icon={<Info24Regular />}
                        appearance="subtle" // Применение стиля primary
                        style={{ marginLeft: '5px' }} // Маленький отступ слева
                    />
                </div>

            </div>
            <Input
                style={{
                    width: '100%',
                    minWidth: '200px',
                }}
                type='number'
            />

            <Switch
                label="Use constant value"
                checked={this.state.useConstantValue}
                onChange={() => {
                    this.setState({ useConstantValue: !this.state.useConstantValue });

                }}
            />
        </div>
        );
    }

    renderSingleRange() {
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
                <Switch
                label="Use constant value"
                checked={this.state.useConstantValue}
                onChange={() => {
                    this.setState({ useConstantValue: !this.state.useConstantValue });

                }}
            />

            </div>
        );
    }

    render(): JSX.Element {
        return (
            <div>
                {this.state.useConstantValue ? this.renderInputRange() : this.renderSingleRange()}
            </div>
        );
    }
}

export default ConstsubstituteRange;
