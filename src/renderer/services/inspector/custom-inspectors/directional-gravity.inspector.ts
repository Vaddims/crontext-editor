import { DirectionalGravity } from "crontext";
import { EditorInspector } from "../editor-inspector";
import { faArrowsDownToLine, faArrowsToLine } from "@danieloi/pro-light-svg-icons";

@EditorInspector.RegisterForComponent(DirectionalGravity)
export class DirectionalGravityInspector extends EditorInspector<DirectionalGravity> {
  static readonly [EditorInspector.icon] = faArrowsDownToLine;
}