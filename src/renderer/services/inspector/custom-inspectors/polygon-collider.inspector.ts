import { Camera, Collider, PolygonCollider } from 'crontext-engine';
import { EditorInspector } from "../editor-inspector";
import { faArrowsToLine, faCamera, faCameraMovie } from "@danieloi/pro-light-svg-icons";

@EditorInspector.RegisterForComponent(PolygonCollider)
export class PolygonColliderInspector extends EditorInspector<PolygonCollider> {
  static readonly [EditorInspector.icon] = faArrowsToLine;
}