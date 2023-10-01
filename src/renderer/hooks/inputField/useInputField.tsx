import { useEffect, useState } from "react";
import { InputFieldCommonOptions, InputFieldProps } from "../../components/inputField/InputField";
import { PartialBy } from "renderer/utilities/types";

const useInputField = function<T, K>(options: InputFieldUtils.Options<T, K>): InputFieldUtils.State<T, K> {
  const [ value, setRawValue ] = useState<T>(options.value);
  const [ anchor, setRawAnchor ] = useState(options.anchor);
  const [ status, setRawStatus ] = useState(InputFieldUtils.Status.Default);
  const [ helperText, setRawHelperText ] = useState<string | null>(options.helperText ?? null);
  const [ mixedValuesState, setMixedValuesState ] = useState(options.mixedValuesState);

  const identifier = options.identifier ?? ((providedValue) => providedValue);

  useEffect(() => {
    if (options.validationTimings?.includes(InputFieldUtils.ValidationTiming.Change)) {
      validate();
    }
  }, [identifier(value)]);

  useEffect(() => {
    if (options.trackValue && value !== options.value) {
      setValue(options.value);
    }
  }, [identifier(options.value)]);

  useEffect(() => {
    if (options.trackAnchor && anchor !== options.anchor) {
      setAnchor(options.anchor);
    }
  }, [options.anchor]);

  useEffect(() => {
    if (options.trackMixedValuesState) {
      setMixedValuesState(options.mixedValuesState);
    }
  }, [options.mixedValuesState]);

  const setValue: InputFieldUtils.State.SetValueFunction<T> = (data, useAsAnchor = false) => {
    setRawValue(state => {
      if (identifier(data) === identifier(value)) {
        return state;
      }
      
      options.onValueChange?.(data);
      if (useAsAnchor) {
        setRawAnchor(data);
      }

      return data;
    })
  }

  const setValueFromCallback: InputFieldUtils.State.SetValueFromCallbackFunction<T> = (callback, useAsAnchor = false) => {
    setRawValue(state => {
      const data = callback(state);
      if (identifier(data) === identifier(value)) {
        return state;
      }
      
      options.onValueChange?.(data);
      if (useAsAnchor) {
        setRawAnchor(data);
      }

      return data;
    })
  }

  const setAnchor: InputFieldUtils.State.SetAnchorFunction<T> = (data) => {
    setRawAnchor(data);
  }

  const setHelperText: InputFieldUtils.State.SetHelperTextFunction = (data) => {
    setRawHelperText(data);
  }

  const statusApplier: InputFieldUtils.State.StatusApplier = {
    restoreDefault() {
      setRawStatus(InputFieldUtils.Status.Default);
      setRawHelperText(options.helperText ?? '');
    },
    useCustomDefault(data: string) {
      setRawStatus(InputFieldUtils.Status.Default);
      setRawHelperText(data || helperText);
    },
    useError(error) {
      setRawStatus(InputFieldUtils.Status.Error);
      setRawHelperText(error.message);
    },
  }

  const validateCustomValue: InputFieldUtils.State.ValidateCustomValue<T, K> = (
    providedValue, 
    providedValidationFunction,
    errorDisplay = InputFieldUtils.ErrorDisplay.Active,
  ) => {
    try {
      const data = providedValidationFunction ? providedValidationFunction(providedValue) : options.validate(providedValue);

      if (errorDisplay === InputFieldUtils.ErrorDisplay.Active) {
        statusApplier.restoreDefault();
      }

      if (!mixedValuesState) {
        return {
          isValid: true,
          isForMixedValues: false,
          data,
        }
      }
    } catch (error) {
      if (!(error instanceof InputFieldError)) {
        throw error;
      }

      if (!mixedValuesState && errorDisplay === InputFieldUtils.ErrorDisplay.Active) {
        statusApplier.useError(error);
      }

      if (!mixedValuesState) {
        return {
          isValid: false,
          error,
        }
      }
    }

    return {
      isValid: true,
      isForMixedValues: true,
      data: undefined,
    }
  }

  const validate: InputFieldUtils.State.ValidateInputFunction<K> = (errorDisplay = InputFieldUtils.ErrorDisplay.Active) => {
    return validateCustomValue(value, options.validate, errorDisplay);
  }

  const inputFieldProps: InputFieldProps = {
    ...options,
    helperText: options.helperText !== null ? options.helperText : void 0,
  }

  return {
    value,
    helperText,
    anchor,
    statusApplier,
    validationTimings: options.validationTimings ?? [],
    inputFieldProps,
    mixedValuesState,
    status,
    
    setValue,
    setValueFromCallback,
    setAnchor,
    setHelperText,
    validate,
    validateCustomValue,
    setMixedValuesState,
  }
}

export default useInputField;

export const useInputFieldUnbounding = (handler?: Function) => {
  const [ onceFocused , setOnceFocused] = useState(false);
  const [ focused, setFocus ] = useState<boolean>();
  
  return {
    onFocus: () => {
      if (!focused) {
        setFocus(true);
        setOnceFocused(true);
      }
    },
    onUnbound: () => {
      if (focused) {
        setFocus(false);
        if (onceFocused) {
          handler?.();
        }
      }
    }
  }
}

export type InputCollectionResults<T> = {
  [key in keyof T]: T[key] extends InputFieldUtils.ComponentState<any, infer U> 
  ? InputFieldUtils.State.ValidationResult.Success<U> 
  : never;
}

export function validateComponentStateInputs<T>(inputCollection: T extends { [k: string]: InputFieldUtils.ComponentState<any, any> } ? T : never) {
  const validationResults = {} as any;
  let overallValid = true;

  for (const key in inputCollection) {
    const result = inputCollection[key].validate();
    if (!result.isValid) {
      overallValid = false;
    }
      
    validationResults[key] = result;
  }

  if (!overallValid) {
    return {
      isValid: false,
      validationResults,
    } as const;
  }

  return {
    isValid: true,
    validationResults: validationResults as InputCollectionResults<T>,
  } as const;
}

export class InputFieldError extends Error {
  constructor (message: string) {
    super(message);
  }
}

export namespace InputFieldUtils {
  export enum Status {
    Default = 'default',
    Error = 'error',
  }

  export enum ValidationTiming {
    Change,
    Submit,
    Blur,
  }

  export enum ErrorDisplay {
    Passive,
    Active,
  }

  export namespace Options {
    export interface ValidateInputFunction<T, K> {
      (input: T): K;
    }

    export interface ChangeInputFunction<T> {
      (data: T): string | void;
    }
  }

  export interface Options<T, K> extends InputFieldCommonOptions {
    readonly reactKey?: string;
    readonly value: T;
    readonly anchor: T;
    readonly trackValue?: boolean;
    readonly trackAnchor?: boolean;
    readonly trackMixedValuesState?: boolean;

    readonly helperText?: string | null;
    readonly disableValidationTimings?: boolean;
    readonly validationTimings?: ValidationTiming[];
    readonly submitTimings?: ValidationTiming[];
    readonly inputPrefix?: string;

    readonly identifier?: (value: T) => unknown;
    readonly validate: Options.ValidateInputFunction<T, K>;
    readonly onValueChange?: Options.ChangeInputFunction<T>; 
  }

  export interface ComponentOptions<T, K> extends Omit<PartialBy<Options<T, K>, 'value' | 'anchor' | 'validate'>, 'onValueChange'> {
    readonly value?: T | undefined;
    readonly anchor?: T | undefined;
    readonly onClick?: InputFieldUtils.State.ClickInputFunction;
    readonly onChange?: InputFieldUtils.State.ChangeInputFunction<T>;
    readonly onSubmit?: InputFieldUtils.State.SubmitInputFunction<K>;
    readonly onRestore?: State.RestoreInputFunction;
    readonly onClear?: State.ClearInputFunction;
    readonly hideClear?: boolean;
    readonly hideRestore?: boolean;
    readonly changeDebouncingTimeout?: number; // ms
  }

  export namespace State {
    export interface RenderComponentFunction {
      (): JSX.Element;
    }

    export interface SetValueFunction<T> {
      (value: T, useAsAnchor?: boolean): void;
    }

    export interface SetValueFromCallbackFunction<T> {
      (value: (state: T) => T, useAsAnchor?: boolean): void;
    }

    export interface SetAnchorFunction<T> {
      (value: T): void;
    }

    export interface ValidateInputFunction<T> {
      (errorDisplay?: ErrorDisplay): State.ValidationResult<T>;
    }

    export interface ValidateCustomValue<T, K> {
      (data: T, validationFunction?: Options.ValidateInputFunction<T, K>, errorDisplay?: ErrorDisplay): State.ValidationResult<K>;
    }

    export interface SubmitInputFunction<T> {
      (data: T): void;
    }

    export interface ChangeInputFunction<T> {
      (data: T): void;
    }

    export interface ClickInputFunction {
      (): void;
    }

    export interface RestoreInputFunction {
      (): void;
    }

    export interface ClearInputFunction {
      (): void;
    }

    export namespace ValidationResult {
      export interface Base {
        readonly isValid: true | false;
      }

      export interface Success<T> extends Base {
        readonly isValid: true;
        readonly isForMixedValues: false;
        readonly data: T;
      }

      export interface MixedSuccess<T> extends Base {
        readonly isValid: true;
        readonly isForMixedValues: true;
        readonly data: T | undefined;
      }

      export interface Fail extends Base {
        readonly isValid: false;
        readonly error: InputFieldError;
      }
    }

    export type ValidationResult<T> = 
      | State.ValidationResult.Success<T>
      | State.ValidationResult.MixedSuccess<T>
      | State.ValidationResult.Fail;

    export interface SetHelperTextFunction {
      (helperText: string | null): void;
    }

    export interface StatusApplier {
      readonly restoreDefault: () => void;
      readonly useCustomDefault: (data: string) => void;
      readonly useError: (error: InputFieldError) => void;
    }
  }

  export interface State<T, K> {
    readonly value: T;
    readonly anchor: T;
    readonly helperText: string | null;
    readonly placeholder?: string;
    readonly status: InputFieldUtils.Status;

    readonly statusApplier: State.StatusApplier;
    readonly validationTimings: ValidationTiming[];

    readonly setValue: State.SetValueFunction<T>;
    readonly setValueFromCallback: State.SetValueFromCallbackFunction<T>;
    readonly setAnchor: State.SetAnchorFunction<T>;
    readonly setHelperText: State.SetHelperTextFunction;
    readonly validate: State.ValidateInputFunction<K>;
    readonly validateCustomValue: State.ValidateCustomValue<T, K>;

    readonly inputFieldProps: InputFieldProps;

    readonly mixedValuesState: boolean | undefined;
    readonly setMixedValuesState: React.Dispatch<React.SetStateAction<boolean | undefined>>;
  }

  export interface ComponentState<T, K> extends State<T, K> {
    readonly restoreValue: () => void;
    readonly clearValue: () => void;
    readonly render: State.RenderComponentFunction;
  }

  export interface GenericHook<TOptions extends object, TReturn extends object, T, K> {
    (options: TOptions & InputFieldUtils.ComponentOptions<T, K>): TReturn & ComponentState<T, K>;
  }

  export type GetHookParameters<T extends GenericHook<any, any, any, any>> = (
    T extends GenericHook<infer U, any, infer T, infer K> 
    ? U & InputFieldUtils.ComponentOptions<T, K> 
    : never
  )
}
