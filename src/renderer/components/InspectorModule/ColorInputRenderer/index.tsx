import { EditorInspector } from "renderer/services/inspector/editor-inspector";
import { RendererEntryProps } from "..";
import { Color } from 'crontext-engine';
import ColorInputField from "renderer/components/inputField/ColorInputField";

const ColorInputRenderer: React.FC<RendererEntryProps<EditorInspector.HierarchyEntry.ColorInput>> = (props) => {
  const { entry, rerenderRoot } = props;
  const value = Reflect.get(entry.reference, entry.key) as Color;

  return (
    <ColorInputField
      key={entry.path}
      inputProps={{
        value: value.toHexString(),
        onChange(event) {
          entry.onChange(event.target.value)
          rerenderRoot()
        }
      }}
    />
  )
}

export default ColorInputRenderer;