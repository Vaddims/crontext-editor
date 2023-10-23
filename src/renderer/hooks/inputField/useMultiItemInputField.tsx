import { useEffect, useMemo, useState } from "react";
import MultiItemInputField, { MultiItemInputDescriptor } from "../../components/inputField/MultiItemInputField"
import useInputField, { InputFieldError, InputFieldUtils } from "./useInputField";


interface MultiItemInputFieldOptions {
  readonly itemDescriptors: MultiItemInputDescriptor[];
  readonly value?: string[];
  readonly anchor?: string[];
  readonly itemAlreadyAppliedMessage?: string;
  readonly unknownItemMessage?: string;
  readonly injectNonRemovableItems?: boolean;
}

interface MultiItemInputFieldResult {
  render: () => JSX.Element;
}

type MultiItemInputFieldHook = InputFieldUtils.GenericHook<MultiItemInputFieldOptions, MultiItemInputFieldResult, string[], string[]>;

export const useMultiItemInputField: MultiItemInputFieldHook = (options) => {
  const textInputField = useInputField<string, string>({
    value: '',
    anchor: '',
    validate: (input) => input,
  });

  const findDescriptor = (identifier: string) => (
    options.itemDescriptors.find(descriptor => descriptor.identifier === identifier)
  );
  
  const dataField = useInputField<string[], string[]>({
    value: options.value ?? [],
    anchor: options.anchor ?? [],
    validate: (input) => input,
  });

  const staticItems = useMemo(() => {
    if (!options.injectNonRemovableItems) {
      return [];
    }

    return options.itemDescriptors
    .filter(descriptor => !descriptor.removable)
    .map(descriptor => descriptor.identifier);
  }, [])

  useEffect(() => {
    if (options.trackValue) {
      dataField.setValue([...staticItems, ...(options.value ?? [])]);
    }
  }, [options.value?.join()])

  useEffect(() => {
    if (options.trackAnchor) {
      dataField.setAnchor([...staticItems, ...(options.anchor ?? [])]);
    }
  }, [options.anchor?.join()])

  useEffect(() => {
    if (!options.injectNonRemovableItems) {
      return;
    }

    dataField.setValueFromCallback((stateItems) => {
      const additionalItems = staticItems.filter(staticItem => !stateItems.includes(staticItem));
      return [...additionalItems, ...stateItems];
    }, true);
  }, [options.itemDescriptors.map(descriptor => descriptor.identifier).join()]);

  const performItemAddition = (itemName: string) => {
    const descriptor = options.itemDescriptors.find(descriptor => itemName === descriptor.name);
    if (!descriptor) {
      dataField.statusApplier.useError(new InputFieldError(options.unknownItemMessage ?? `Element not found`));
      return;
    }

    if (dataField.value.includes(descriptor.identifier)) {
      dataField.statusApplier.useError(new InputFieldError(options.itemAlreadyAppliedMessage ?? `Element already applied`));
      return;
    }

    dataField.statusApplier.restoreDefault();

    dataField.setValue([...dataField.value, descriptor.identifier]);
    textInputField.setValue('');
  }

  const handleInputChange: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    if (!options.itemDescriptors.map(descriptor => descriptor.name).includes(event.currentTarget.value)) {
      textInputField.setValue(event.currentTarget.value);
      return;
    }

    performItemAddition(event.currentTarget.value)
    dataField.statusApplier.restoreDefault();
  }

  const handleInputClick: React.MouseEventHandler<HTMLInputElement> = (event) => {
    dataField.statusApplier.restoreDefault()
    options?.onClick?.();
  }

  const handleItemRemove = (itemIdentifer: string) => {
    const items = dataField.value;
    if (!items.includes(itemIdentifer)) {
      console.warn('No item found with the same id on removal');
      return;
    }

    dataField.setValue(items.filter(item => item !== itemIdentifer));
  }

  const restoreValue = () => {
    dataField.setValue(dataField.anchor)
  }

  const clearValue = () => {
    const items = dataField.value;
    
    dataField.setValue(items.filter(item => {
      const descriptor = options.itemDescriptors.find(descriptor => descriptor.identifier === item);
      return descriptor && !descriptor.removable;
    }))
  }

  const shouldAllowInputClear = !dataField.value.every(item => !findDescriptor(item)?.removable);
  const shouldAllowInputRestore = (
    dataField.value.length !== dataField.anchor.length ||
    !dataField.value.every(item => dataField.anchor.includes(item))
  );

  const render = () => (
    <MultiItemInputField
      {...options}
      {...dataField}
      items={dataField.value}
      itemDescriptors={options.itemDescriptors}
      onInputRestore={shouldAllowInputRestore && restoreValue}
      onInputClear={shouldAllowInputClear && clearValue}
      onItemRemove={handleItemRemove}
      inputProps={{
        value: textInputField.value,
        onChange: handleInputChange,
        onClick: handleInputClick,
      }}
    />
  );

  return {
    ...dataField,
    restoreValue,
    clearValue,
    render,
  }
}