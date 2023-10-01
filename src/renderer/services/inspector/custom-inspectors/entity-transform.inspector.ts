import { EntityTransform } from "crontext";
import { EditorInspector } from "../editor-inspector";
import { faArrowsUpDownLeftRight } from "@fortawesome/free-solid-svg-icons";

@EditorInspector.RegisterForComponent(EntityTransform as any)
export class EntityTransformInspector extends EditorInspector<EntityTransform> {
  public override readonly icon = faArrowsUpDownLeftRight;

  public override createTree(component: EntityTransform) {
    this.entries.push(
      EditorInspector.createFieldDescriptor({
        object: component,
        key: 'position',
      }, 'Position'),

      EditorInspector.createFieldDescriptor({
        object: component,
        key: 'scale',
      }, 'Scale'),

      EditorInspector.createFieldDescriptor({
        object: component,
        key: 'rotation',
      }, 'Rotation')
    )

    const path: string[] = [];
    const elements = [...this.entries];
    for (let i = 0; i < elements.length; i++) {
      const target = elements[i];
      path.push(EditorInspector.Type[target.type] + i);
      target.path = path.join('/');
      if (target.type === EditorInspector.Type.HorizontalAligner) {
        elements.push(...target.entries);
      }
    }

    return this;
  }
}