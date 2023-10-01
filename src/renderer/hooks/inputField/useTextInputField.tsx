import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import TextInputField, { TextInputFieldUtils } from "../../components/inputField/TextInputField";
import useInputField, { InputFieldError, InputFieldUtils, useInputFieldUnbounding } from "./useInputField";
import useFunctionDebounce from "renderer/middleware/hooks/useFunctionDebounce";

export interface GenericTextInputOptions {
  readonly placeholder?: string;
  readonly type?: 'text' | 'datetime-local' | 'email' | 'password' | 'date';
  readonly disabled?: boolean;
  readonly allowEmptyValue?: boolean;
  readonly datalist?: TextInputFieldUtils.DatalistItem[];
  readonly submitActions?: {
    readonly blurInput?: boolean;
  }
}

export interface GenericTextInputResult {
  readonly inputIsFocused: boolean;
}

const placeholderInputTypeSwap = [
  'datetime-local',
  'password',
]

export type TextInputFieldHook<T> = InputFieldUtils.GenericHook<GenericTextInputOptions, GenericTextInputResult, string, T>;
const useTextInputField = function<T = string>(options: Parameters<TextInputFieldHook<T>>[0]): ReturnType<TextInputFieldHook<T>> {
  const inputField = useInputField({
    onValueChange(data) {
      debounceValueChange(data);
    },
    ...options,
    validate: (data) => {
      if (options.markAsRequired && data.trim() === '' && !options.allowEmptyValue) {
        throw new InputFieldError('This field is required');
      }
      
      if (options.validate) {
        return options.validate(data);
      }
      
      // console.warn(`No validation function provided for the (${options.label}) TextInputField hook. By default no formation will be applied for the validated returned value`)
      return data as any;
    },
    value: options.value?.toString() ?? '',
    anchor: options.anchor?.toString() ?? '',
  });

  const [ isFocused, setIsFocused ] = useState(false);

  const handleValueChange = (data: string) => {
    options?.onChange?.(data);
  }

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceValueChange = useFunctionDebounce(handleValueChange, options.changeDebouncingTimeout);

  const placeholder = inputField.mixedValuesState ? 'Using existing values (Click to modify)' : options.placeholder;
  const [ inputType, setInputType ] = useState<GenericTextInputOptions['type']>((placeholder && placeholderInputTypeSwap.includes(options.type as any)) ? 'text' : (options.type ?? 'text'));

  useEffect(() => {
    const shouldSwapType = (placeholder && placeholderInputTypeSwap.includes(options.type as any));
    if (shouldSwapType) {
      const inputType = shouldSwapType ? 'text' : (options.type ?? 'text');
      setInputType(inputType);
    } else {
      setInputType(options.type);
    }
  }, [placeholder, options.type])

  const restoreValue = () => {
    inputField.setValue(inputField.anchor);
    options?.onRestore?.();
  }

  const clearValue = () => {
    inputField.setValue('');
    options?.onClear?.();
  }

  const handleInputClick: React.MouseEventHandler<HTMLInputElement> = (event) => {
    inputField.statusApplier.restoreDefault()
    options?.onClick?.();
  }

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    inputField.setValue(event.target.value)
  }

  const handleInputFocus: React.FocusEventHandler<HTMLInputElement> = () => {
    inputFieldUnbounding.onFocus();
    setIsFocused(true);

    if (inputType !== options.type) {
      setInputType(options.type);
    }

    if (inputField.mixedValuesState) {
      inputField.setMixedValuesState(false)
    }
  }

  const handleInputBlur = () => {
    setIsFocused(false);
    if (options.validationTimings?.includes(InputFieldUtils.ValidationTiming.Blur)) {
      inputField.validate();
    }
  }

  const inputFieldUnbounding = useInputFieldUnbounding(handleInputBlur);

  const handleKeyPress: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
    if (event.key !== 'Enter') {
      return;
    }

    if (!options.validationTimings?.includes(InputFieldUtils.ValidationTiming.Submit)) {
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

  const handleMixedValueStateClick = () => {
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

  const shouldAllowInputClear = (
    !!inputField.value &&
    !options.disabled &&
    !options.hideClear
  );

  const shouldAllowInputRestore = (
    inputField.value !== inputField.anchor && 
    inputField.anchor !== '' && 
    !options.disabled && 
    !options.hideRestore
  );

  const render = () => (
    <TextInputField
      {...options}
      fieldProps={{
        ...options.fieldProps,
      }}
      inputRef={inputRef}
      helperText={inputField.helperText || undefined}
      inputPrefix={options.inputPrefix}
      inputDatalist={options.datalist}
      mixedValuesState={inputField.mixedValuesState}
      onInputClear={shouldAllowInputClear && clearValue}
      onInputRestore={shouldAllowInputRestore && restoreValue}
      onMixedValueStateClick={handleMixedValueStateClick}
      onUnbound={() => inputFieldUnbounding.onUnbound()}

      inputProps={{
        type: inputType,
        value: inputField.value,
        placeholder: placeholder,
        disabled: options.disabled,

        onChange: handleInputChange,
        onClick: handleInputClick,
        onKeyPress: handleKeyPress,
        onFocus: handleInputFocus,
      }}
    />
  )

  return {
    ...inputField,
    inputIsFocused: isFocused,
    restoreValue,
    clearValue,
    render,
  }
}

export default useTextInputField;
