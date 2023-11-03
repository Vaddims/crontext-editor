import { Rigidbody } from 'crontext-engine';
import { EditorInspector } from "../editor-inspector";
import { faHillRockslide } from "@danieloi/pro-light-svg-icons";

@EditorInspector.RegisterForComponent(Rigidbody)
export class RigidbodyInspector extends EditorInspector<Rigidbody> {
  static readonly [EditorInspector.icon] = faHillRockslide;
}