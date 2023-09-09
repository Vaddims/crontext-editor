import { useEffect, useState } from "react";
import SelectInputField from "../../components/SelectInputField"
import useInputField, { InputField } from "./useInputField";

export interface SelectInputFieldOption {
  readonly title: string;
  readonly value: string;
  readonly defaultSelection?: boolean;
}

interface SelectInputFieldOptions {
  readonly value?: any;
  readonly options: SelectInputFieldOption[];
  readonly required?: boolean;
  readonly dynamicClassName?: (state: SelectInputFieldOption) => string | undefined;
}

export interface SelectInputFieldState {
  readonly defaultOption: SelectInputFieldOption;
}

export const defaultSelectInputFieldOption: SelectInputFieldOption = {
  title: 'None',
  value: '',
}

export const mixedValuesSelectInputFieldOption: SelectInputFieldOption = {
  title: 'Using existing values (Click to modify)',
  value: 'mixed_values',
}

const disabledInputFieldOptions = [defaultSelectInputFieldOption.value, mixedValuesSelectInputFieldOption.value];

type SelectInputFieldHook = InputField.GenericHook<SelectInputFieldOptions, SelectInputFieldState, SelectInputFieldOption, SelectInputFieldOption>;
const useSelectInputField: SelectInputFieldHook = (selectorOptions) => {
  const {
    label,
    options,
    required = false,
  } = selectorOptions;

  const inputField = useInputField<SelectInputFieldOption, SelectInputFieldOption>({
    validate: (option) => option,
    ...selectorOptions,
    value: selectorOptions.value ?? defaultSelectInputFieldOption,
    anchor: selectorOptions.anchor ?? defaultSelectInputFieldOption,
    onValueChange(state) {
      selectorOptions.onChange?.(state);
    }
  });

  const displayOptions = [...options];
  if (selectorOptions.mixedValuesState) {
    displayOptions.unshift(mixedValuesSelectInputFieldOption)
  }
  displayOptions.unshift(defaultSelectInputFieldOption);

  const restoreValue = () => {
    inputField.setValue(inputField.anchor);
  }

  const clearValue = () => {
    inputField.setValue(defaultSelectInputFieldOption);
  }

  const findOption = (optionValue: string) => {
    return displayOptions.find(option => option.value === optionValue);
  }

  const onInputChange: React.ChangeEventHandler<HTMLSelectElement> = (event) => {
    inputField.setValue(findOption(event.target.value) ?? defaultSelectInputFieldOption)
  }

  const setValue = (option: SelectInputFieldOption | null, useAsAnchor = false) => {
    inputField.setValue(option ?? defaultSelectInputFieldOption, useAsAnchor);
    if (typeof inputField.mixedValuesState !== 'undefined') {
      inputField.setMixedValuesState(false);
    }
  }

  const mixedValueStateClickHandler = () => {
    inputField.setMixedValuesState((state) => {
      const nextState = !state;

      if (nextState) {
        setValue(mixedValuesSelectInputFieldOption);
        inputField.statusApplier.restoreDefault();
      }

      return nextState;
    });

    return true;
  }

  const shouldAllowInputRestore = inputField.value !== inputField.anchor && !disabledInputFieldOptions.includes(inputField.anchor.value) && !selectorOptions.hideRestore;
  const shouldAllowInputClear = inputField.value.value !== '' && !selectorOptions.required && !selectorOptions.hideClear;

  const dynamicClassName = selectorOptions.dynamicClassName ? selectorOptions.dynamicClassName(inputField.value) : undefined;

  const render = () => (
    <SelectInputField
      label={label} 
      markAsRequired={required}
      onInputRestore={shouldAllowInputRestore && restoreValue}
      onInputClear={shouldAllowInputClear && clearValue}
      onChange={onInputChange}
      {...inputField.inputFieldComponentProps}

      fieldClassName={[dynamicClassName, selectorOptions.className].join(' ')}
      mixedValuesState={inputField.mixedValuesState}
      onMixedValueStateClick={mixedValueStateClickHandler}
    >
      {displayOptions.map(option => (
        <option 
          selected={option.value === inputField.value.value} 
          disabled={disabledInputFieldOptions.includes(option.value) && required}
          value={option.value}
        >
          {(option.value === '' && required) ? (selectorOptions.placeholder ?? `Choose option`) : option.title}
        </option>
      ))}
    </SelectInputField>
  );

  return {
    ...inputField,
    defaultOption: defaultSelectInputFieldOption,
    restoreValue,
    clearValue,
    setValue,
    render,
  }
}

export default useSelectInputField;