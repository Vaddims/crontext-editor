import TextareaInputField from "../../components/TextareaInputField";
import useInputField, { InputField } from "./useInputField";

interface TextareaInputFieldOptions {
  readonly label?: string;
}

export type AppTextareaInputHook = InputField.GenericHook<TextareaInputFieldOptions, {}, string, string>;
const useTextareaInputField: AppTextareaInputHook = (options) => {
  const inputField = useInputField({
    validate: (data) => data,
    ...options,
    value: options.value ?? '',
    anchor: options.anchor ?? '',
  })

  const {
    label,
  } = options;

  const inputChangeHandler: React.ChangeEventHandler<HTMLTextAreaElement> = (event) => {
    inputField.setValue(event.target.value)
  }

  const restoreValue = () => {
    inputField.setValue(inputField.anchor);
  }

  const clearValue = () => {
    inputField.setValue('');
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

  const inputClickHandler = () => {
    inputField.setMixedValuesState(false);
    inputField.statusApplier.restoreDefault()
  }

  const shouldAllowInputRestore = inputField.value !== inputField.anchor;
  const shouldAllowInputClear = inputField.value.trim() !== '';

  const placeholder = inputField.mixedValuesState ? 'Using existing values (Click to modify)' : options.placeholder; 

  const render = () => (
    <TextareaInputField
      label={label ?? ''}
      value={inputField.value}
      onInputRestore={shouldAllowInputRestore && restoreValue}
      onInputClear={shouldAllowInputClear && clearValue}
      onChange={inputChangeHandler}
      placeholder={placeholder}
      onClick={inputClickHandler}

      {...inputField.inputFieldComponentProps}

      mixedValuesState={inputField.mixedValuesState}
      onMixedValueStateClick={mixedValueStateClickHandler}
    />
  )

  return {
    ...inputField,
    restoreValue,
    clearValue,
    render,
  }
}

export default useTextareaInputField;