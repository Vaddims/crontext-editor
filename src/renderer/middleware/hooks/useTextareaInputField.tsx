import useInputField, { InputFieldUtils } from "renderer/hooks/inputField/useInputField";
import TextareaInputField from "../../components/TextareaInputField";

interface TextareaInputFieldOptions {
  readonly label?: string;
}

export type AppTextareaInputHook = InputFieldUtils.GenericHook<TextareaInputFieldOptions, {}, string, string>;
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
    inputField.setMixedValuesState((state: any) => {
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

  const placeholder = inputField.mixedValuesState ? 'Using existing values (Click to modify)' : ''; 

  const render = () => (
    <TextareaInputField
      label={label ?? ''}
      onInputRestore={shouldAllowInputRestore && restoreValue}
      onInputClear={shouldAllowInputClear && clearValue}

      inputProps={{
        value: inputField.value,
        onChange: inputChangeHandler,
        placeholder: placeholder,
        onClick: inputClickHandler,
      }}

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