import { EditorInspector } from "renderer/services/inspector/editor-inspector";
import { RendererEntryProps } from "..";
import LabelRenderer from "../LabelRenderer";
import GenericInputRenderer from "../GenericInputRenderer";
import SelectInputRenderer from "../SelectInputRenderer";
import ColorInputRenderer from "../ColorInputRenderer";
import CheckboxRenderer from "../CheckboxRenderer";
import HorizontalAlignmentRenderer from "../HorizontalAlignmentRenderer";

const EditorModuleTreeRenderer: React.FC<RendererEntryProps<EditorInspector.HierarchyEntryType>> = (props) => {
  const { entry, rerenderRoot } = props;

  switch (entry.type) {
    case EditorInspector.Type.HorizontalAligner:
      return (
        <HorizontalAlignmentRenderer
          entry={entry}
          rerenderRoot={rerenderRoot}
        />
      )

    case EditorInspector.Type.Label:
      return (
        <LabelRenderer
          entry={entry}
          rerenderRoot={rerenderRoot}
        />
      );

    case EditorInspector.Type.Input:
      return (
        <GenericInputRenderer
          key={entry.path} 
          entry={entry}
          rerenderRoot={rerenderRoot}
        />
      )

    case EditorInspector.Type.Checkbox:
      return (
        <CheckboxRenderer
          rerenderRoot={rerenderRoot}
          entry={entry}
        />
      )

    case EditorInspector.Type.SelectInput:
      return (
        <SelectInputRenderer 
          key={entry.path} 
          entry={entry} 
          rerenderRoot={rerenderRoot}
        />
      );

    case EditorInspector.Type.ColorInput:
      return (
        <ColorInputRenderer
          key={entry.path} 
          entry={entry} 
          rerenderRoot={rerenderRoot}
        />
      );
  }
}

export default EditorModuleTreeRenderer;