import { MeshRenderer } from "crontext";
import { EditorInspector } from "../editor-inspector";
import { faDrawPolygon } from "@danieloi/pro-light-svg-icons";

@EditorInspector.RegisterForComponent(MeshRenderer)
export class MeshRendererInspector extends EditorInspector<MeshRenderer> {
  static readonly [EditorInspector.icon] = faDrawPolygon;
}