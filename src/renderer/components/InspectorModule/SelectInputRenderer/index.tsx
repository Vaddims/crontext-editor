import useSelectInputField, { defaultSelectInputFieldOption } from "renderer/hooks/inputField/useSelectInputField";
import { EditorInspector } from "renderer/services/inspector/editor-inspector";
import { RendererEntryProps } from "..";
import { useEffect } from "react";

const SelectInputRenderer: React.FC<RendererEntryProps<EditorInspector.HierarchyEntry.SelectInput>> = (props) => {
  const { entry, rerenderRoot } = props;

  const options = entry.options.map(option => ({
    title: option.text,
    value: option.id,
  }))

  const target = Reflect.get(entry.reference, entry.key);
  const selectInputField = useSelectInputField({
    options,
    inputPrefix: entry.inputPrefix,
    value: options.find(option => option.value === target.constructor.name), //selectInput.reference[selectInput.key],
    hideClear: true,
    required: true,
    onChange: (option) => {
      entry.onChange(option.value);
      rerenderRoot()
    }
  });

  useEffect(() => {
    selectInputField.setValue(options.find(option => option.value === target.constructor.name) ?? defaultSelectInputFieldOption);
  }, [options.map(option => option.value).join()])

  return (
    selectInputField.render()
  )
}

export default SelectInputRenderer;