import { PointLight, SpotLight } from "crontext";
import { EditorInspector } from "../editor-inspector";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";

@EditorInspector.RegisterForComponent(SpotLight)
export class PointLightInspector extends EditorInspector<SpotLight> {
  public override readonly icon = faLightbulb;
  constructor() {
    super();
    this.excludeFields.push('visibilityPolygonCache', 'physicalRenderingDependence');
  }
}
