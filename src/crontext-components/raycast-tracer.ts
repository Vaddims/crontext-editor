import { Color, Component, Entity, MeshRenderer, Ray, Scene, Vector } from "crontext";
import { Gizmos } from "crontext/dist/core/gizmos";
import { Transformator } from "objectra";

@Transformator.Register()
export class RaycastTracer extends Component {
  partner!: Entity;
  atm = 1;
  atmSpeed = 0.01;
  level = 0;

  @Transformator.Exclude()
  sparialPartitionReadCalls = 0;

  *[Component.onStart]() {
    const scene = this.entity.scene!;
    this.partner = scene.find('p2')!;
    if (!this.once) {
      this.once = true;

      // const requests = (new Array(100).fill(undefined).map(() => scene.requestEntityInstantiation())) as Scene.ActionRequests.EntityInstantiation[];
      // const entities: Scene.ActionRequest.Response<typeof requests> = yield requests;
      // console.log(entities);
      // for (const entity of entities) {
      //   entity.components.add(MeshRenderer);
      //   entity.transform.position = Vector.random().multiply(20);
      // }

      // for (let i = 0; i < 600; i++) {
      //   const entity: Entity = yield scene.requestEntityInstantiation();
      //   entity.components.add(MeshRenderer);
      //   entity.transform.position = Vector.random().multiply(50);
      // }
    }
  }

  @Transformator.Exclude()
  once = false;

  [Component.onGizmosRender](gizmos: Gizmos) {
    const ray = new Ray(this.transform.position, new Vector(1, .5), 10)
    const mrspRay = ray.useMRSP(this.entity.scene!.meshRendererSpatialPartition);
    const resolution = mrspRay.cast();

    gizmos.renderLine(this.transform.position, ray.endpoint, Color.red);
    
    if (resolution) {
      gizmos.renderLine(this.transform.position, resolution.intersectionPosition, Color.green, 3)
    }
  }

  // [Component.onGizmosRender](gizmos: Gizmos) {
  //   if (!this.partner) {
  //     this.partner = this.entity.scene!.find('p2')!;
  //     return;
  //   }

  //   const scene = this.entity.scene!;

  //   // if ((this.atm += this.atmSpeed) > 1) {
  //   //   this.atm = 0;
  //   //   this.sparialPartitionReadCalls = 0;
  //   // }

  //   const target = Vector.lerp(this.transform.position, this.partner.transform.position, this.atm);
  //   const segment: Shape.Segment = [this.transform.position, target];
  //   gizmos.renderLine(...segment, Color.red);

  //   // this.sparialPartitionReadCalls++;

  //   const clusters = scene.meshRendererSpatialPartition.rayTraceClusters(...segment, this.level);
  //   for (const cluster of clusters) {
  //     const bounds = cluster.getSpaceBounds();
  //     gizmos.highlightVertices(bounds.vertices, Color.blue.withAlpha(0.1))
  //   }

  //   // const bounds = cluster.getSpaceBounds();
  // }
}
