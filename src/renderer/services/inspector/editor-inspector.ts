import { faFileCode, faQuestion } from "@fortawesome/free-solid-svg-icons";
import { Color, Component, Engine, EntityTransform, Shape, Vector } from "crontext";
import { Transformator } from "objectra";
import { Constructor } from "objectra/dist/types/util.types";
import { isES3Primitive } from "objectra/dist/utils";
import { splitCaseMixedString } from "renderer/utilities/text.utils";

export type ComponentLike = Component | EntityTransform;

export class EditorInspector<T extends ComponentLike = ComponentLike> {
  public readonly icon = faFileCode;

  protected readonly excludeFields: (keyof T)[] = ['entity', 'transform'] as (keyof T)[];
  
  public readonly entries: EditorInspector.HierarchyEntryType[] = [];
  private pathTrace: string[] = [];

  public createTree(component: T) {
    const objectFields = EditorInspector.getObjectFields(component, this.excludeFields as string[]);
    const fieldDescriptors = objectFields.map(field => EditorInspector.createFieldDescriptor(field));
    this.entries.push(
      ...fieldDescriptors,
    );

    const path: string[] = [component.entity.id];
    const elements = [...this.entries];
    for (let i = 0; i < elements.length; i++) {
      const target = elements[i];
      path.push(EditorInspector.Type[target.type] + i);
      target.path = path.join('/');
      if (target.type === EditorInspector.Type.HorizontalAligner) {
        elements.push(...target.entries);
      }
    }
  }

  public static createLabel(text: string): EditorInspector.HierarchyEntry.Label {
    return {
      type: EditorInspector.Type.Label,
      text,
      path: '',
    };
  }

  public static createInput(field: EditorInspector.ObjectField, options?: {
    inputPrefix?: string;
    onChange: (value: string) => void;
  }): EditorInspector.HierarchyEntry.Input {
    return {
      path: '',
      reference: field.object,
      key: field.key,
      type: EditorInspector.Type.Input,
      inputPrefix: options?.inputPrefix,
      onChange: options?.onChange ?? ((value: string) => Reflect.set(field.object, field.key, value)),
      rerenderOnChange: true,
    }
  }

  public static createCheckboxInput(field: EditorInspector.ObjectField, options?: {
    onChange: (value: boolean) => void
  }): EditorInspector.HierarchyEntry.Checkbox {
    return {
      path: '',
      reference: field.object,
      key: field.key,
      type: EditorInspector.Type.Checkbox,
      onChange: options?.onChange ?? ((value: boolean) => Reflect.set(field.object, field.key, value)),
    }
  }

  public static createSelectInput(field: EditorInspector.ObjectField, options: {
    options: {id: string, text: string}[];
    onChange: (value: string) => void;
  }): EditorInspector.HierarchyEntry.SelectInput {
    return {
      path: '',
      key: field.key,
      type: EditorInspector.Type.SelectInput,
      onChange: options.onChange ?? ((value: string) => Reflect.set(field.object, field.key, value)),
      options: options.options,
      reference: field.object,
    }
  }

  public static createColorInput(field: EditorInspector.ObjectField, options: {
    onChange: (value: string) => void;
  }): EditorInspector.HierarchyEntry.ColorInput {
    return {
      type: EditorInspector.Type.ColorInput,
      key: field.key,
      reference: field.object,
      path: '',
      onChange: options.onChange,
    }
  }

  public static createFieldControls(field: EditorInspector.ObjectField): EditorInspector.HierarchyEntryType {
    const value = field.object[field.key];

    const onNumberChange = (v: string) => {
      const s = Number(v);
      if (v === '' || Number.isNaN(s)) {
        return;
      }

      Reflect.set(field.object, field.key, new Vector(s, value.y));
    }

    if (isES3Primitive(value)) {
      if (value === null || value === void 0) {
        return EditorInspector.createLabel('No value');
      }

      if (typeof value === 'boolean') {
        return EditorInspector.createCheckboxInput(field, {
          onChange(value) {
            Reflect.set(field.object, field.key, value)
          },
        })
      }

      if (typeof value === 'number') {
        return EditorInspector.createInput(field, {
          onChange(v) {
            const s = Number(v);
            if (v === '' || Number.isNaN(s)) {
              return;
            }

            Reflect.set(field.object, field.key, s);
          },
        });
      }

      return EditorInspector.createInput(field);
    }

    if (value instanceof Vector) {
      return EditorInspector.createHorizontal(
        EditorInspector.createInput({
          key: 'x',
          object: value,
        }, {
          inputPrefix: 'X:',
          onChange(v: string) {
            const s = Number(v);
            if (v === '' || Number.isNaN(s)) {
              return;
            }

            Reflect.set(field.object, field.key, new Vector(s, value.y));
          },
        }),
        EditorInspector.createInput({
          key: 'y',
          object: value,
        }, {
          inputPrefix: 'Y:',
          onChange(v: string) {
            const s = Number(v);
            if (v === '' || Number.isNaN(s)) {
              return;
            }

            Reflect.set(field.object, field.key, new Vector(value.x, s));
          },
        })
      )
    } else if (value instanceof Shape) {
      const shapeConstructors = Engine.getInheritedConstructors(Shape);
      return EditorInspector.createSelectInput(field, {
        options: shapeConstructors.map(shapeConstructor => ({
          id: shapeConstructor.name,
          text: splitCaseMixedString(shapeConstructor.name).join(' '),
        })),
        onChange(value) {
          const target = shapeConstructors.find(con => con.name === value);
          if (!target) {
            throw new Error('Not found');
          }

          Reflect.set(field.object, field.key, new target());
        },
      })
    } else if (value instanceof Color) {
      return EditorInspector.createColorInput(field, {
        onChange(value) {
          Reflect.set(field.object, field.key, Color.createFromHex(value));
        },
      })
    }

    return EditorInspector.createLabel('No controls defined');
  }

  public static createHorizontal(...entries: EditorInspector.HierarchyEntryType[]): EditorInspector.HierarchyEntry.HorizontalAligner {
    return {
      type: EditorInspector.Type.HorizontalAligner,
      path: '',
      entries,
    }
  }

  public static createFieldDescriptor(field: EditorInspector.ObjectField, fieldName?: string) {
    return EditorInspector.createHorizontal(
      EditorInspector.createLabel(splitCaseMixedString(fieldName ?? field.key.toString()).join(' ')),
      EditorInspector.createFieldControls(field),
    )
  }

  static getObjectFields(object: any, excludeFields: (symbol | string)[]) {
    const fields: EditorInspector.ObjectField[] = [];
    for (const [key, value] of Object.entries(object)) {
      if (excludeFields.includes(key)) {
        continue;
      }

      fields.push({
        object,
        key: key,
      })
    }

    return fields;
  }

  static getConstuctorInspector<T extends ComponentLike>(constructor: Constructor): Constructor<EditorInspector<T>> | null {
    for (const [ComponentConstructor, Editor] of EditorInspector.customEditor) {
      if (ComponentConstructor === constructor) {
        return Editor;
      }
    }

    return null;
  }

  static createFromObject<T extends ComponentLike>(component: ComponentLike): EditorInspector<T> {
    const Inspector = EditorInspector.getConstuctorInspector(component.constructor as Constructor);
    if (Inspector) {
      const inspectorInstance = new Inspector();
      inspectorInstance.createTree(component);
      return inspectorInstance;
    }

    const editor = new EditorInspector();
    editor.createTree(component);
    return editor;
  }

  public static readonly customEditor = new Map<Constructor<ComponentLike>, Constructor>();
  public static RegisterForComponent(componentConstructor: Constructor<ComponentLike>) {
    return (constructor: Constructor) => {
      EditorInspector.customEditor.set(componentConstructor, constructor);
    }
  }
}

export namespace EditorInspector {
  export interface ObjectField {
    key: string | symbol;
    object: any;
  }

  export enum Type {
    Label,
    Input,
    Checkbox,
    SelectInput,
    ColorInput,
    HorizontalAligner,
    Field,
  }

  export interface HierarchyEntry<T extends Type = Type> {
    readonly type: T;
    path: string;
  }

  export namespace HierarchyEntry {
    export interface Label extends HierarchyEntry<Type.Label> {
      readonly text: string;
    }

    export interface Input extends HierarchyEntry<Type.Input> {
      readonly reference: object;
      readonly key: string | symbol;
      readonly onChange: (value: string) => void;
      readonly inputPrefix?: string;
      readonly rerenderOnChange?: boolean;
    }

    export interface Checkbox extends HierarchyEntry<Type.Checkbox> {
      readonly reference: object;
      readonly key: string | symbol;
      readonly onChange: (value: boolean) => void;
      readonly rerenderOnChange?: boolean;
    }

    export interface SelectInput extends HierarchyEntry<Type.SelectInput> {
      readonly reference: object;
      readonly key: string | symbol;
      readonly onChange: (value: string) => void;
      readonly inputPrefix?: string;
      readonly options: {id: string, text: string}[];
    }

    export interface ColorInput extends HierarchyEntry<Type.ColorInput> {
      readonly reference: object;
      readonly key: string | symbol;
      readonly onChange: (value: string) => void;
    }

    export interface HorizontalAligner extends HierarchyEntry<Type.HorizontalAligner> {
      readonly entries: HierarchyEntryType[];
      readonly useGap?: boolean;
    }
  }

  export type HierarchyEntryType = HierarchyEntry.Label | HierarchyEntry.Input | HierarchyEntry.Checkbox | HierarchyEntry.HorizontalAligner | HierarchyEntry.SelectInput | HierarchyEntry.ColorInput;
}
