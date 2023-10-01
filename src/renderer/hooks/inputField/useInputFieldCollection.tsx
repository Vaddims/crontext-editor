import { useEffect, useRef, useState } from "react";
import { nanoid } from "nanoid";
import TextInputField from "../../components/inputField/TextInputField";
import CheckboxField from "../../components/inputField/CheckboxField";
import { InputFieldError, InputFieldUtils } from "./useInputField";
import { SelectInputFieldOption, defaultSelectInputFieldOption } from "./useSelectInputField";


const nondefaultValidator = (field: InputFieldCollection.Field) => {
  switch (field.fieldType) {
    case InputFieldCollection.FieldType.Text:
      if (field.value.trim() === '') {
        throw new InputFieldError('Input is required');
      }

      break;

    case InputFieldCollection.FieldType.Checkbox:
      if (!field.value) {
        throw new InputFieldError('Checkbox must be checked');
      }

      break;

    case InputFieldCollection.FieldType.Select:
      if (field.value.value === defaultSelectInputFieldOption.value) {
        throw new InputFieldError('Choose another option');
      }

      break;
  }

  return field.value;
}

const useInputFieldCollection = function<P = unknown>(options: InputFieldCollection.Options<P>): InputFieldCollection<P> {
  const getStableFieldFromDescriptor = (descriptor: InputFieldCollection.Field.Descriptor<P>): InputFieldCollection.Field<P> => {
    const uid = nanoid();
    const stableField: InputFieldCollection.Field<P> = {
      uid,
      mixedValuesState: descriptor.mixedValuesState,
      identifier: descriptor.identifier,
      group: descriptor.group ?? [],
      fieldType: descriptor.fieldType as any,
      validationTimings: descriptor.validationTimings ?? [],
      label: descriptor.label,
      placeholder: descriptor.placeholder ?? '',
      value: descriptor.value as any,
      anchor: descriptor.anchor ?? descriptor.value as any,
      helperText: descriptor.helperText ?? '',
      status: InputFieldUtils.Status.Default,
      required: descriptor.required ?? false,
      helperTextAnchor: descriptor.helperText ?? '',
      payload: descriptor.payload as P,
      onceFocused: false,
      focused: false,
      statusApplier: {
        restoreDefault: () => statusApplier.restoreDefault(uid),
        useCustomDefault: (helperText) => statusApplier.useCustomDefault(uid, helperText),
        useError: (error: InputFieldError) => statusApplier.useError(uid, error),
      },
      modify<T extends InputFieldCollection.Field>(override: Partial<GetInputFieldBody<T>> | ((field: T) => Partial<GetInputFieldBody<T>>)) {
        modifyField(this.uid, override)
      },
      remove() {
        removeField(this.uid);
      },
      restore() {
        modifyField(this.uid, (field) => ({
          value: field.anchor,
        }));

        this.statusApplier.restoreDefault();
      },
      validate() {
        const currentFields = getFields();
        const index = findFieldIndex(this.uid);
        
        if (index === -1) {
          throw new Error('field not found');
        }
    
        const field = currentFields[index];
    
        try {
          if (field.required) {
            nondefaultValidator(field)
          }
          
          if (!field.mixedValuesState) {
            const result = (descriptor.validate as any)(field, field.value);
            const successResult: InputFieldCollection.Field.Stable.ValidationResult.Success<P> = {
              isValid: true,
              isForMixedValues: false,
              field: field,
              data: result,
            }
      
            return successResult;
          }
        } catch (error) {
          if (!(error instanceof InputFieldError)) {
            throw error;
          }

          if (!field.mixedValuesState && true /* field.ignoreAlerts */) {
            this.statusApplier.useError(error);
          }

          if (!field.mixedValuesState) {
            const failResult: InputFieldCollection.Field.Stable.ValidationResult.Fail = {
              isValid: false,
              field: field,
              error,
            }
  
            return failResult;
          }
        }

        return {
          isValid: true,
          isForMixedValues: true,
          data: undefined,
          field,
        }
      },
      handleFocus() {
        if (!this.focused) {
          modifyField(this.uid, {
            focused: true,
            onceFocused: true,
          });
        }
      },
      handleUnbound() {
        if (this.focused) {
          if (this.onceFocused) {
            if (this.validationTimings.includes(InputFieldUtils.ValidationTiming.Blur)) {
              this.validate();
            }
          }

          modifyField(this.uid, {
            focused: false,
          });
        }
      },
      render() {
        return renderField(this);
      },
    };

    return stableField;
  }

  const getStableFieldFromOptionDescriptors = () => options.fieldDescriptors.map(getStableFieldFromDescriptor);
  const fieldCollectionReference = useRef<InputFieldCollection.Field<P>[]>([]);
  const [ rawFields, setRawFields ] = useState(getStableFieldFromOptionDescriptors());

  const getFields = () => fieldCollectionReference.current;

  const setFields = (newFields: InputFieldCollection.Field<P>[] | ((a: InputFieldCollection.Field<P>[]) => InputFieldCollection.Field<P>[])) => {
    setRawFields((stateFields) => {
      const newStateFields = typeof newFields === 'function' ? newFields(stateFields) : newFields;
      fieldCollectionReference.current = newStateFields;
      return newStateFields;
    });
  }

  useEffect(() => {
    if (options.trackDescriptors) {
      setFields(getStableFieldFromOptionDescriptors());
    }
  }, [options.fieldDescriptors]);

  useEffect(() => {
    setFields(() => {
      const newState = options.fieldDescriptors.map(descriptor => {
        return getStableFieldFromDescriptor(descriptor);
      });
      
      return newState;
    });
  }, options.descriptorUpdateDependencies ?? []);

  const findFieldIndex = (fieldId: string, customFields?: InputFieldCollection.Field<P>[]) => {
    return (customFields ?? getFields()).findIndex(field => field.uid === fieldId)
  };

  type GetInputFieldBody<T extends InputFieldCollection.Field> = InputFieldCollection.Field.Stable.Body<T extends InputFieldCollection.Field.Stable.Body<infer U> ? U : never>;
  const getModified = <T extends InputFieldCollection.Field>(field: T, overrides: Partial<GetInputFieldBody<T>>) => {
    return {
      ...field,
      ...overrides
    }
  }

  const modifyField = <T extends InputFieldCollection.Field = InputFieldCollection.Field>(fieldId: string, override: Partial<GetInputFieldBody<T>> | ((field: T) => Partial<GetInputFieldBody<T>>)) => {
    setFields((rawFields) => {
      const newRawFields = [...rawFields];
      const fieldIndex = findFieldIndex(fieldId, rawFields);

      if (fieldIndex === -1) {
        console.warn(`Modification Error: Field(${fieldId}) not found`);
        return rawFields;
      }

      const field = newRawFields[fieldIndex];

      if (typeof override === 'function') {
        newRawFields[fieldIndex] = getModified(field, override(field as any));
      } else {
        newRawFields[fieldIndex] = getModified(newRawFields[fieldIndex], override);
      }

      return newRawFields;
    });
  }

  const statusApplier: InputFieldCollection.Field.StatusApplier = {
    restoreDefault(fieldId: string) {
      modifyField(fieldId, (field) => ({
        status: InputFieldUtils.Status.Default,
        helperText: field.helperTextAnchor,
      }));
    },
    useCustomDefault(fieldId: string, helperText: string | null) {
      modifyField(fieldId, () => ({
        status: InputFieldUtils.Status.Default,
        helperText: helperText ?? void 0,
      }))
    },
    useError(fieldId: string, error: InputFieldError) {
      modifyField(fieldId, () => ({
        status: InputFieldUtils.Status.Error,
        helperText: error.message,
      }));
    }
  }

  const addField = (...descritptors: InputFieldCollection.Field.Descriptor<P>[]) => {
    setFields((rawFields) => {
      const newRawFields = new Array<InputFieldCollection.Field>(rawFields.length + descritptors.length);

      const insertAtEndDescriptors = [];
      for (const descriptor of descritptors) {
        if (typeof descriptor.insertPosition === 'number') {
          newRawFields[descriptor.insertPosition] = getStableFieldFromDescriptor(descriptor);
          continue;
        }

        insertAtEndDescriptors.push(getStableFieldFromDescriptor(descriptor));
      }

      let newRawFieldCursor = 0;
      for (const rawField of rawFields) {
        while(newRawFields[newRawFieldCursor]) {
          newRawFieldCursor++;
        }

        newRawFields[newRawFieldCursor] = rawField;
      }

      newRawFields.push(...insertAtEndDescriptors)
      return rawFields;
    })
  }

  const exchangeFields = (fieldId1: string, fieldId2: string) => {
    setFields((rawFields) => {
      const newRawFields = [...rawFields];
      const index1 = findFieldIndex(fieldId1, rawFields);
      const index2 = findFieldIndex(fieldId2, rawFields);
      
      if ([index1, index2].some(index => index === -1)) {
        console.warn(`Exchange Error: Field(${fieldId1} or ${fieldId2}) not found`)
        return newRawFields;
      }

      [newRawFields[index1], newRawFields[index2]] = [newRawFields[index2], newRawFields[index1]];
      return newRawFields;
    });
  }

  const removeField = (fieldId: string) => {
    setFields((rawFields) => {
      const fieldIndex = findFieldIndex(fieldId, rawFields);
      if (!fieldIndex) {
        console.warn(`Removal Error: Field(${fieldId}) not found.`);
        return rawFields;
      }

      const newRawFields = rawFields.filter(field => field.uid !== fieldId);
      return newRawFields;
    });
  }

  const createFieldGroup = (fields: InputFieldCollection.Field<P>[]) => (group: string | number): InputFieldCollection.FieldGroup<P> => {
    const groupFields = fields.filter(field => field.group.includes(group));

    return {
      fields: groupFields as InputFieldCollection.Field<P>[],
      restore: () => restoreFieldGroup(groupFields),
      validate: () => validateFieldGroup(groupFields),
      createFieldGroup: createFieldGroup(groupFields),
    }
  }

  const validateFieldGroup = (fields: InputFieldCollection.Field<P>[]): InputFieldCollection.ValidationResult<P> => {
    const results: InputFieldCollection.Field.Stable.ValidationResult<P>[] = [];
    const fails: InputFieldCollection.Field.Stable.ValidationResult.Fail[] = [];
    const successes: (InputFieldCollection.Field.Stable.ValidationResult.Success<P> | InputFieldCollection.Field.Stable.ValidationResult.MixedSuccess<P>)[] = [];

    for (const field of fields) {
      const result = field.validate();
      if (result.isValid) {
        successes.push(result);
      } else {
        fails.push(result);
      }

      results.push(result);
    }

    return {
      results,
      fails,
      successes,
      collectionIsValid: results.every(result => result.isValid),
    }
  }

  const restoreFieldGroup = (fields: InputFieldCollection.Field[]) => {
    for (const field of fields) {
      field.restore(); 
    }
  }

  const renderField = (field: InputFieldCollection.Field) => {
    const placeholder = field.mixedValuesState ? `Using existing values (Click to modify)` : field.placeholder;
    switch (field.fieldType) {
      case InputFieldCollection.FieldType.Text: {
        return (
          <TextInputField
            label={field.label}
            markAsRequired={field.required}
            mixedValuesState={field.mixedValuesState}
            
            inputProps={{
              value: field.value,
              placeholder: placeholder,
              onChange: (e) => field.modify({
                value: e.target.value,
              }),
              onClick: () => {
                field.statusApplier.restoreDefault();
                field.modify((currentField) => ({
                  mixedValuesState: currentField.mixedValuesState && false,
                }));
              },
              onFocus: () => {
                field.handleFocus();
              }
            }}
            onMixedValueStateClick={() => {
              field.statusApplier.restoreDefault();
              field.modify((currentField) => ({
                mixedValuesState: typeof currentField === 'undefined' ? undefined : !currentField.mixedValuesState,
              }))
            }}
            onInputRestore={field.value !== field.anchor && field.anchor !== '' && (() => {
              field.modify({
                value: field.anchor,
              })
            })}
            onInputClear={field.value !== '' && (() => {
              field.modify({
                value: '',
              })
            })}
            onUnbound={() => {
              field.handleUnbound();
            }}
            status={field.status}
            helperText={field.helperText}
          />
        );
      }

      case InputFieldCollection.FieldType.Checkbox: {
        return (
          <CheckboxField 
            label={field.label}
            select={field.value}
            checkboxProps={{
              onClick: () => field.modify({
                value: !field.value,
              })
            }}
            helperText={field.helperText}
          />
        );
      }

      case InputFieldCollection.FieldType.Select: {
        return <div>Not implemented</div>
      }

      default: {
        return (
          <div>Field type unknown</div>
        )
      }
    }
  }

  return {
    fields: rawFields,
    statusApplier,
    restore: () => restoreFieldGroup(getFields()),
    validate: () => validateFieldGroup(getFields()),
    addField,
    exchangeFields,
    removeField,
    createFieldGroup: createFieldGroup(getFields()),
  }
}

export default useInputFieldCollection;

export namespace InputFieldCollection {
  export enum FieldType {
    Text = 'text',
    Select = 'select',
    Checkbox = 'checkbox',
  }

  export namespace Field {
    export interface Validation<T extends InputFieldCollection.Field> {
      (field: T, data: T['value']): unknown;
    }

    export namespace Descriptor {
      export interface Base<T extends FieldType, V, P> {
        readonly fieldType: T;
        readonly identifier: string | number;
        readonly group?: (string | number)[];
        readonly placeholder?: string;
        readonly insertPosition?: number;
        readonly validationTimings?: InputFieldUtils.ValidationTiming[];
        readonly label?: string;
        readonly value: V;
        readonly anchor?: V;
        readonly helperText?: string;
        readonly required?: boolean;
        readonly payload?: P;  

        readonly mixedValuesState?: boolean | undefined; // boolean - show / undefined - hide
        readonly onMixedValueStateClick?: () => boolean;

        readonly validate: Validation<GetStableOf<T, P>>;
      }

      export type TextInpuField<P> = Descriptor.Base<FieldType.Text, string, P>;
      export type SelectInputField<P> = Descriptor.Base<FieldType.Select, SelectInputFieldOption, P>;
      export type CheckboxInputField<P> = Descriptor.Base<FieldType.Checkbox, boolean, P>;
    }

    export type Descriptor<P = unknown> = 
    | Descriptor.TextInpuField<P>
    | Descriptor.SelectInputField<P>
    | Descriptor.CheckboxInputField<P>;

    export namespace Stable {
      export namespace ValidationResult {
        export interface Base<P = unknown> {
          readonly field: Field<P>;
        }

        export interface Success<P> extends Base<P>, InputFieldUtils.State.ValidationResult.Success<unknown> {}
        export interface Fail extends Base, InputFieldUtils.State.ValidationResult.Fail {}
        export interface MixedSuccess<P> extends Base<P>, InputFieldUtils.State.ValidationResult.MixedSuccess<unknown> {}
      }

      export type ValidationResult<P = unknown> =
      | ValidationResult.Success<P>
      | ValidationResult.Fail
      | ValidationResult.MixedSuccess<P>;

      export interface Identifiers<T extends FieldType> {
        readonly uid: string;
        readonly fieldType: T;
        readonly group: (string | number)[];
        readonly identifier: string | number;
      }

      export interface Body<V, P = unknown> {
        readonly label?: string;
        readonly placeholder: string;
        readonly validationTimings: InputFieldUtils.ValidationTiming[];
        readonly mixedValuesState: boolean | undefined;
        readonly value: V;
        readonly anchor: V;
        readonly helperTextAnchor: string;
        readonly helperText: string;
        readonly required: boolean;
        readonly status: InputFieldUtils.Status;
        readonly payload: P;
        readonly onceFocused: boolean;
        readonly focused: boolean;
        readonly statusApplier: {
          restoreDefault: () => void;
          useCustomDefault: (helperText: string | null) => void;
          useError: (errror: InputFieldError) => void;
        }
      }

      type GetInputFieldBody<T extends InputFieldCollection.Field> = InputFieldCollection.Field.Stable.Body<T extends InputFieldCollection.Field.Stable.Body<infer U> ? U : never>;
      export interface Functionalities<T extends InputFieldCollection.Field, P> {
        readonly modify: (override: Partial<GetInputFieldBody<T>> | ((field: T) => Partial<GetInputFieldBody<T>>)) => void;
        readonly validate: Functionalities.ValidationFunction<P>;
        readonly restore: () => void;
        readonly remove: () => void;
        readonly handleFocus: () => void;
        readonly handleUnbound: () => void;
        readonly render: () => JSX.Element;
      }

      export namespace Functionalities {
        export interface ValidationFunction<P> {
          (): Stable.ValidationResult<P>;
        }
      }

      export type Base<T extends FieldType, V, P> = Identifiers<T> & Body<V, P> & Functionalities<GetStableOf<T>, P>;

      export type TextInpuField<P = unknown> = Stable.Base<FieldType.Text, string, P>;
      export type SelectInputField<P = unknown> = Stable.Base<FieldType.Select, SelectInputFieldOption, P>;
      export type CheckboxInputField<P = unknown> = Stable.Base<FieldType.Checkbox, boolean, P>;
    }

    export interface StatusApplier {
      restoreDefault: (fieldId: string) => void;
      useCustomDefault: (fieldId: string, helperText: string | null) => void;
      useError: (fieldId: string, error: InputFieldError) => void;
    }

    export type GetStableOf<T extends FieldType, P = unknown> = InputFieldCollection.Field<P> & { fieldType: T };
  }

  export type Field<P = unknown> = 
  | Field.Stable.TextInpuField<P>
  | Field.Stable.SelectInputField<P>
  | Field.Stable.CheckboxInputField<P>;

  export interface ValidationResult<P> {
    readonly results: InputFieldCollection.Field.Stable.ValidationResult<P>[];
    readonly fails: InputFieldCollection.Field.Stable.ValidationResult.Fail[];
    readonly successes: (InputFieldCollection.Field.Stable.ValidationResult.Success<P> | InputFieldCollection.Field.Stable.ValidationResult.MixedSuccess<P>)[];
    readonly collectionIsValid: boolean;
  }

  export interface FieldGroup<P = unknown> {
    readonly fields: InputFieldCollection.Field<P>[];
    readonly validate: () => InputFieldCollection.ValidationResult<P>;
    readonly restore: () => void;
    readonly createFieldGroup: (group: string | number) => InputFieldCollection.FieldGroup<P>;
  }

  export interface Options<P> {
    readonly trackDescriptors?: boolean;
    readonly descriptorUpdateDependencies?: any[];
    readonly fieldDescriptors: Field.Descriptor<P>[];
  }
}

export interface InputFieldCollection<P = unknown> {
  readonly fields: InputFieldCollection.Field<P>[];
  readonly statusApplier: InputFieldCollection.Field.StatusApplier;
  readonly restore: () => void;
  readonly validate: () => InputFieldCollection.ValidationResult<P>;
  readonly addField: (...descritptors: InputFieldCollection.Field.Descriptor<P>[]) => void;
  readonly exchangeFields: (fieldId1: string, fieldId2: string) => void;
  readonly removeField: (fieldId: string) => void;
  readonly createFieldGroup: (group: string | number) => InputFieldCollection.FieldGroup<P>;
}
