import CheckboxField from "../../components/inputField/CheckboxField";
import useInputField, { InputFieldUtils } from "./useInputField";

interface CheckboxFieldOptions {
  readonly onChange?: (select: boolean) => void;
}

interface CheckboxFieldResult {
  readonly toggleValue: () => void;
}

type CheckboxFieldHook = InputFieldUtils.GenericHook<CheckboxFieldOptions, CheckboxFieldResult, boolean, boolean>;
const useCheckboxInputField: CheckboxFieldHook = (options) => {
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
      label={options.label}
      select={inputField.value}
      helperText={options.helperText || undefined}
      mixedValuesState={inputField.mixedValuesState}
      checkboxProps={{
        onClick: checkboxClickHandler
      }}
      fieldProps={{
        // ...inputField.inputFieldProps,
      }}
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

export default useCheckboxInputField;