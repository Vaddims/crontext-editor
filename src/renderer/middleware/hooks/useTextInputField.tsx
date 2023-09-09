import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import TextInputField, { InputFieldDatalistElement } from "../../components/TextInputField";
import useInputField, { InputField, InputFieldError, useInputFieldUnbounding } from "./useInputField";

import useFunctionDebounce from "./useFunctionDebounce";
import { ArgumentTypes } from "renderer/utilities/types";

export interface GenericTextInputOptions {
  readonly placeholder?: string;
  readonly type?: 'text' | 'datetime-local' | 'email' | 'password' | 'date';
  readonly disabled?: boolean;
  readonly allowEmptyValue?: boolean;
  readonly datalist?: InputFieldDatalistElement[];
  readonly submitActions?: {
    readonly blurInput?: boolean;
  }
}

const placeholderInputTypeSwap = [
  'datetime-local',
  'password',
]

export type TextInputFieldHook<T> = InputField.GenericHook<GenericTextInputOptions, {}, string, T>;
const useTextInputField = function<T = string>(options: ArgumentTypes<TextInputFieldHook<T>>[0]): ReturnType<TextInputFieldHook<T>> {
  const valueChangeHandler = (data: string) => {
    return options.onChange?.(data)
  }

  const debounceChange = useFunctionDebounce(valueChangeHandler, options.changeDebouncingTimeout);

  const inputRef = useRef<HTMLInputElement>(null);
  const inputField = useInputField({
    onValueChange(data) {
      debounceChange(data);
    },
    ...options,
    validate: (data) => {
      if (options.required && data.trim() === '') {
        throw new InputFieldError('No input provided');
      }
      
      if (options.validate) {
        return options.validate(data);
      }
      
      console.warn(`No validation function provided for the (${options.label}) TextInputField hook. By default no formation will be applied for the validated returned value`)
      return data as any;
    },
    value: options.value?.toString() ?? '',
    anchor: options.anchor?.toString() ?? '',
  });

  const placeholder = inputField.mixedValuesState ? 'Using existing values (Click to modify)' : options.placeholder; 

  const [ inputType, setInputType ] = useState<GenericTextInputOptions['type']>((placeholder && placeholderInputTypeSwap.includes(options.type as any)) ? 'text' : (options.type ?? 'text'));

  useEffect(() => {
    const e = (placeholder && placeholderInputTypeSwap.includes(options.type as any));
    const a = e ? 'text' : (options.type ?? 'text');
    if (e) {
      setInputType(a);
    } else {
      setInputType(options.type);
    }
  }, [placeholder, options.type])

  const inputBlurHandler = () => {
    if (options.validationTimings?.includes(InputField.ValidationTiming.Blur)) {
      inputField.validate();
    }
  }

  const inputFieldUnbounding = useInputFieldUnbounding(inputBlurHandler);

  const inputClickHandler: React.MouseEventHandler<HTMLInputElement> = (event) => {
    inputField.statusApplier.restoreDefault()
  }

  const keyPressHandler: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    if (!options.validationTimings?.includes(InputField.ValidationTiming.Submit)) {
      return;
    }

    const validatedResult = inputField.validate();
    if (!validatedResult.isValid) {
      return;
    }

    options.onSubmit?.(validatedResult.data);
    if (options.submitActions?.blurInput) {
      inputRef.current?.blur();
    }
  }

  const changeHandler: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    inputField.setValue(event.target.value);
    // debounceChange(event.target.value);
  }

  const focusHandler: React.FocusEventHandler<HTMLInputElement> = () => {
    inputFieldUnbounding.onFocus();

    if (inputType !== options.type) {
      setInputType(options.type);
    }

    if (inputField.mixedValuesState) {
      inputField.setMixedValuesState(false)
    }
  }

  const restoreValue = () => {
    inputField.setValue(inputField.anchor);
    options?.onRestore?.();
  }

  const clearValue = () => {
    inputField.setValue('');
    options?.onClear?.();
  }

  const mixedValueStateClickHandler = () => {
    inputField.setMixedValuesState((state) => {
      const nextState = !state;

      if (nextState) {
        clearValue();
        inputField.statusApplier.restoreDefault();
      }

      return nextState;
    });

    return true;
  }

  const shouldAllowInputClear = !!inputField.value && !options.disabled && !options.hideClear;
  const shouldAllowInputRestore = inputField.value !== inputField.anchor && inputField.anchor !== '' && !options.disabled && !options.hideRestore;

  const render = () => (
    <TextInputField
      label=''
      type={inputType}
      value={inputField.value}
      placeholder={placeholder}
      {...inputField.inputFieldComponentProps}
      onInputClear={shouldAllowInputClear && clearValue}
      onInputRestore={shouldAllowInputRestore && restoreValue}
      disabled={options.disabled}
      
      mixedValuesState={inputField.mixedValuesState}
      onMixedValueStateClick={mixedValueStateClickHandler}
      onUnbound={() => inputFieldUnbounding.onUnbound()}
      onChange={changeHandler}
      onClick={inputClickHandler}
      onKeyPress={keyPressHandler}
      onFocus={focusHandler}
      inputDatalist={options.datalist}
      inputRef={inputRef}
    />
  )

  return {
    ...inputField,
    restoreValue,
    clearValue,
    render,
  }
}

export default useTextInputField;
