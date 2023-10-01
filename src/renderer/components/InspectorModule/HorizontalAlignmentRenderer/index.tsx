import { EditorInspector } from "renderer/services/inspector/editor-inspector"
import { RendererEntryProps } from ".."
import EditorModuleTreeRenderer from "../EditorModuleTreeRenderer";

const HorizontalAlignmentRenderer: React.FC<RendererEntryProps<EditorInspector.HierarchyEntry.HorizontalAligner>> = (props) => {
  return (
    <div className='horizontal'
      key={props.entry.path}
    >
      {props.entry.entries.map(entry => (
        <EditorModuleTreeRenderer 
          key={entry.path} 
          entry={entry} 
          rerenderRoot={props.rerenderRoot}
        />
      ))}
    </div>
  )
}

export default HorizontalAlignmentRenderer;