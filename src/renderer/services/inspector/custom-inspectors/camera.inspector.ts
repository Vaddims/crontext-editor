import { Camera } from 'crontext-engine';
import { EditorInspector } from "../editor-inspector";
import { faCamera, faCameraMovie } from "@danieloi/pro-light-svg-icons";

@EditorInspector.RegisterForComponent(Camera)
export class CameraInspector extends EditorInspector<Camera> {
  static readonly [EditorInspector.icon] = faCameraMovie;
}