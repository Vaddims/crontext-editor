import { PointGravity } from 'crontext-engine';
import { EditorInspector } from "../editor-inspector";
import { faArrowsToCircle } from "@danieloi/pro-light-svg-icons";

@EditorInspector.RegisterForComponent(PointGravity)
export class PointGravityInspector extends EditorInspector<PointGravity> {
  static readonly [EditorInspector.icon] = faArrowsToCircle;
}