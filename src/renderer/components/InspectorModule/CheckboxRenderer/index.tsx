import { EditorInspector } from "renderer/services/inspector/editor-inspector";
import { RendererEntryProps } from "..";
import CheckboxField from "renderer/components/inputField/CheckboxField";

const CheckboxRenderer: React.FC<RendererEntryProps<EditorInspector.HierarchyEntry.Checkbox>> = (props) => {
  const { entry, rerenderRoot } = props;

  return (
    <CheckboxField
      select={(entry.reference as any)[entry.key]}
      checkboxProps={{
        onClick: () => {
          const value = !(entry.reference as any)[entry.key];
          entry.onChange(value);
          rerenderRoot();
        }
      }}
    />
  );
}

export default CheckboxRenderer;