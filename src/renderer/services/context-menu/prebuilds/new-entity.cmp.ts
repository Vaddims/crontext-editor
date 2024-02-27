import { Camera, Entity, Light, MeshRenderer, Optic, PointLight, PolygonCollider, Renderer, Vector } from 'crontext-engine';
import { ContextMenuItemConstructorOptions, ContextMenuPrebuild } from "types/context-menu.type";

enum EntityCreationType {
  Blank = 'CREATE:ENTITY:BLANK',
  Visual = 'CREATE:ENTITY:VISUAL',
  Collider = 'CREATE:ENTITY:COLLIDER',
  VisualCollider = 'CREATE:ENTITY:VISUALCOLLIDER',
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
      label: 'Visual',
      payload: EntityCreationType.Visual,
    },
    {
      label: 'Collider',
      payload: EntityCreationType.Collider,
    },
    {
      label: 'Common',
      payload: EntityCreationType.VisualCollider,
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

      const entity = renderer.simulation.scene.instantiateEntity(new Entity()).resolve() as Entity;
      const sceneCoordinates = renderer.canvasPointToCoordinates(optic, eventCoordinates);
      entity.transform.position = sceneCoordinates;

      switch (payload) {
        case EntityCreationType.Blank:
          entity.name = 'Blank';
          return entity;

        case EntityCreationType.Visual:
          entity.name = 'Visual';
          entity.components.add(MeshRenderer).resolve();
          break;

        case EntityCreationType.Collider:
          entity.name = 'Collider';
          entity.components.add(PolygonCollider).resolve();
          break;

        case EntityCreationType.VisualCollider:
          entity.name = 'Visual Collider';
          entity.components.add(MeshRenderer).resolve();
          entity.components.add(PolygonCollider).resolve();
          break;
        
        case EntityCreationType.Camera:
          entity.name = 'Camera';
          entity.components.add(Camera);
          break;

        case EntityCreationType.Light:
          entity.name = 'Light';
          entity.components.add(PointLight).resolve();
      }
    },
  }
}