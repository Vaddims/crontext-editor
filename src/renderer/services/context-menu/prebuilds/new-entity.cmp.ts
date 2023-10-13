import { Camera, Entity, Light, MeshRenderer, Optic, PointLight, PolygonCollider, Renderer, Vector } from "crontext";
import { ContextMenuItemConstructorOptions, ContextMenuPrebuild } from "types/context-menu.type";

enum EntityCreationType {
  Blank = 'CREATE:ENTITY:BLANK',
  Common = 'CREATE:ENTITY:COMMON',
  Camera = 'CREATE:ENTITY:CAMERA',
  Light = 'CREATE:ENTITY:LIGHT',
}

export const newEntityContextMenuPrebuild: ContextMenuPrebuild<EntityCreationType, [Renderer, Optic, Vector]> = (renderer, optic, eventCoordinates) => {
  const template: ContextMenuItemConstructorOptions<EntityCreationType>[] = [
    {
      label: 'Blank',
      payload: EntityCreationType.Blank,
    },
    {
      label: 'Common',
      payload: EntityCreationType.Common,
    },
    {
      label: 'Camera',
      payload: EntityCreationType.Camera,
    },
    {
      label: 'Light',
      payload: EntityCreationType.Light,
    },
  ];

  return {
    template,
    handle(payload) {
      if (!payload || !Object.values(EntityCreationType).includes(payload)) {
        return;
      }

      const entity = renderer.simulation.scene.instantEntityInstantiation(new Entity())!;
      const sceneCoordinates = renderer.canvasPointToCoordinates(optic, eventCoordinates);
      entity.transform.position = sceneCoordinates;

      switch (payload) {
        case EntityCreationType.Blank:
          entity.name = 'Blank';
          return entity;

        case EntityCreationType.Common:
          renderer.simulation.scene.instantResolve(entity.components.add(MeshRenderer));
          renderer.simulation.scene.instantResolve(entity.components.add(PolygonCollider));
          break;
        
        case EntityCreationType.Camera:
          entity.name = 'Camera';
          renderer.simulation.scene.instantResolve(entity.components.add(Camera));
          break;

        case EntityCreationType.Light:
          entity.name = 'Light';
          renderer.simulation.scene.instantResolve(entity.components.add(PointLight));
      }
    },
  }
}