import { EditorInspector } from "renderer/services/inspector/editor-inspector";
import { RendererEntryProps } from "..";
import useTextInputField from "renderer/hooks/inputField/useTextInputField";
import { InputFieldUtils } from "renderer/hooks/inputField/useInputField";
import { useEffect } from "react";

const GenericInputRenderer: React.FC<RendererEntryProps<EditorInspector.HierarchyEntry.Input>> = (props) => {
  const { entry, rerenderRoot } = props;

  const incomeValue = Reflect.get(entry.reference, entry.key);
  const textInputField = useTextInputField({
    value: incomeValue,
    hideClear: true,
    inputPrefix: entry.inputPrefix,
    validationTimings: [
      InputFieldUtils.ValidationTiming.Submit, 
      InputFieldUtils.ValidationTiming.Blur, 
      InputFieldUtils.ValidationTiming.Change
    ],
    validate(data) {
      if (textInputField.inputIsFocused) {
        entry.onChange(data);
      }
    }
  });

  useEffect(() => {
    if (!textInputField.inputIsFocused) {
      textInputField.setValue(incomeValue);
    }
  }, [incomeValue, textInputField.value, textInputField.inputIsFocused])

  return textInputField.render();
}

export default GenericInputRenderer;