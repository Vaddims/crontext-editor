import CheckboxField from "../../components/CheckboxField";
import useInputField, { InputField } from "./useInputField";

interface CheckboxFieldOptions {
  readonly onChange?: (select: boolean) => void;
}

interface CheckboxFieldResult {
  readonly toggleValue: () => void;
}

type CheckboxFieldHook = InputField.GenericHook<CheckboxFieldOptions, CheckboxFieldResult, boolean, boolean>;
const useCheckboxField: CheckboxFieldHook = (options) => {
  const defaultValue = options.value ?? false;

  const inputField = useInputField({
    value: defaultValue,
    anchor: defaultValue,
    validate: (input) => input,
    onValueChange: (data) => options.onChange?.(data),
    ...options,
  })

  const toggleValue = () => {
    // stages

    // mixed value -> no select
    if (inputField.mixedValuesState) {
      inputField.setMixedValuesState(false);
      inputField.setValue(false);
      return;
    }

    // no select -> select
    if (!inputField.value) {
      inputField.setValue(true);
      return;
    }

    // select -> [, mixed values]
    if (options.mixedValuesState) {
      inputField.setMixedValuesState(true);
      return;
    }

    // select -> no select
    inputField.setValue(false);
  }

  const checkboxClickHandler: React.MouseEventHandler<HTMLButtonElement> = () => {
    toggleValue();
  }

  const restoreValue = () => {
    inputField.setValue(inputField.anchor);
  }

  const clearValue = () => {
    inputField.setValue(defaultValue);
  }

  const render = () => (
    <CheckboxField
      label=''
      {...inputField.inputFieldComponentProps}
      select={inputField.value}
      mixedValuesState={inputField.mixedValuesState}
      onClick={checkboxClickHandler}
    />
  );

  return {
    ...inputField,
    toggleValue,
    restoreValue,
    clearValue,
    render,
  }
}

export default useCheckboxField;