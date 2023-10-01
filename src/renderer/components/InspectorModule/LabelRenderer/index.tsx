import { EditorInspector } from "renderer/services/inspector/editor-inspector";
import { RendererEntryProps } from "..";

const LabelRenderer: React.FC<RendererEntryProps<EditorInspector.HierarchyEntry.Label>> = (props) => {
  const { entry } = props;

  return (
    <span>{entry.text}</span>
  )
}

export default LabelRenderer;