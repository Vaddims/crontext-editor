import { PointLight, SpotLight } from 'crontext-engine';
import { EditorInspector } from "../editor-inspector";
import { faLightbulb } from "@fortawesome/free-solid-svg-icons";
import { faLightsHoliday } from "@danieloi/pro-light-svg-icons";

@EditorInspector.RegisterForComponent(SpotLight)
export class SpotLightInspector extends EditorInspector<SpotLight> {
  static readonly [EditorInspector.icon] = faLightsHoliday;
  constructor() {
    super();
    this.excludeFields.push('visibilityPolygonCache', 'physicalRenderingDependence');
  }
}
