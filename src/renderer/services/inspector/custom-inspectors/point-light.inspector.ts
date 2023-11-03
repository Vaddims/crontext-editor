import { PointLight } from 'crontext-engine';
import { EditorInspector } from "../editor-inspector";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { faLightbulbOn } from "@danieloi/pro-light-svg-icons";

@EditorInspector.RegisterForComponent(PointLight)
export class PointLightInspector extends EditorInspector<PointLight> {
  static readonly [EditorInspector.icon] = faLightbulbOn;
  constructor() {
    super();
    this.excludeFields.push('visibilityPolygonCache', 'recache', 'physicalRenderingDependence');
  }
}