import { Component, Entity, Vector } from "crontext";
import { Transformator } from "objectra";

@Transformator.Register()
export class LightAnchorBehaviour extends Component {
  camera: Entity | null = null;
  light: Entity | null = null;
  i = 0;

  [Component.onUpdate]() {
    this.handleSelfBehaviour();
    this.handleCameraMovement();
  }

  handleSelfBehaviour() {
    this.transform.rotate(0.002)
  }

  handleCameraMovement() {
    if (!this.camera) {
      const camera = this.entity.scene!.find('Camera');
      if (!camera) {
        return;
      }

      this.camera = camera;
    } 

    const sin = Math.sin(this.i += .01);
    this.camera.transform.scale = Vector.one.multiply(sin / 2).add(Vector.one);
  }
}