//countries dropdown component

import React, { useEffect } from 'react';

import { Dropdown, Option, useId } from '@fluentui/react-components';

import contriesList from './contries.json';
import { flag } from 'country-emoji';

export interface CountriesDropdownProps {
    selectedCountry: string;
    onChange: (country: string) => void;
}

export const CountriesDropdown = (props: CountriesDropdownProps) => {

    const comboId = useId("combo-controlled");

    const [selectedOptions, setSelectedOptions] = React.useState<string[]>([
       props.selectedCountry
      ]);
      const [value] = React.useState(props.selectedCountry);
    

   //options for dropdown with flags country codes
 
const createText = (countryCode: string) => {
    const flagValue = flag(countryCode);
    return (typeof flagValue === "undefined" ? "   " :  flagValue + "  ") + countryCode;
}
 const createCountryOption = () => {
    const allCountries = contriesList.countries ? contriesList.countries : [];

    const countriesJSX= allCountries.map((country) => {
        return (
            <Option value={country.countryCode} key={country.countryCode} disabled={false}>
            {createText(country.countryCode)}
            </Option>
        )
    });
    return countriesJSX
}


useEffect(() => {
    setSelectedOptions([props.selectedCountry]); // Update selected country when props change
}, [props.selectedCountry]);


    return (
        <Dropdown
        id={`${comboId}-default`}
        aria-label='Countries'
        placeholder='Select a country'
        defaultValue={createText(value)}
        defaultSelectedOptions={selectedOptions}
        multiselect={false}
        onOptionSelect={(_ev, data) => {
            if (data.optionValue)
            props.onChange(data.optionValue);
        }}
          >
            {createCountryOption()}
        </Dropdown>
    );
};