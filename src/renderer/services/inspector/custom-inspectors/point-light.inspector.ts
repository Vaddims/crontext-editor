import { PointLight } from "crontext";
import { EditorInspector } from "../editor-inspector";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";

@EditorInspector.RegisterForComponent(PointLight)
export class PointLightInspector extends EditorInspector<PointLight> {
  public override readonly icon = faLightbulb;
  constructor() {
    super();
    this.excludeFields.push('visibilityPolygonCache', 'recache', 'physicalRenderingDependence');
  }
}