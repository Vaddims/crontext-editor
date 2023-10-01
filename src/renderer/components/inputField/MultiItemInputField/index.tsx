import { nanoid } from "nanoid";
import InputField, { InputFieldCommonProps } from "../InputField";
import { useMemo } from "react";
import { composeClassNames } from "../../../utilities/reactComponent.util";
import './MultiItemInputField.scss';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark, faXmarkCircle, faXmarkSquare } from "@fortawesome/free-solid-svg-icons";

export interface MultiItemInputDescriptor {
  readonly name: string;
  readonly description: string;
  readonly identifier: string;
  readonly removable?: boolean;
}

export interface MultiItemInputFieldProps extends InputFieldCommonProps {
  readonly items: string[];
  readonly itemDescriptors: MultiItemInputDescriptor[];
  readonly inputProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
  readonly itemProps?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
  readonly onItemRemove?: (itemIdentifer: string) => void;
}

const MultiItemInputField: React.FC<MultiItemInputFieldProps> = (props) => {
  const datalistId = useMemo(() => nanoid(), []); 

  const findDescriptor = (identifier: string) => props.itemDescriptors.find(descriptor => descriptor.identifier === identifier);
  const notSelectedItemDescriptors = props.itemDescriptors.filter(descriptor => !props.items.includes(descriptor.identifier));

  return (
    <InputField
      key={props.reactKey}
      fieldProps={{
        ...props.fieldProps,
        className: composeClassNames('multi-item', props.fieldProps?.className),
      }}
    >
      <div className="display-field">
        {props.items.map(identifier => {
          const descriptor = findDescriptor(identifier);
          if (!descriptor) {
            console.warn(`Item descriptor not found: ${identifier}`, props.itemDescriptors, props.items)
            return false
          }

          return (
            <div {...props.itemProps} className={composeClassNames('input-item', props.itemProps?.className)} key={identifier}>
              <span>{descriptor.name}</span>
              {descriptor.removable && (
                <FontAwesomeIcon icon={faXmark} onClick={() => props.onItemRemove?.(identifier)} />
              )}
            </div>
          ) 
        })}
        <input type="text" placeholder="Add role" {...props.inputProps} list={datalistId} />
        <datalist id={datalistId}>
          {notSelectedItemDescriptors.map(descriptor => (
            <option 
              value={descriptor.name} 
              key={descriptor.identifier}
            >
              {descriptor.description}
            </option>
          ))}
        </datalist>
      </div>
    </InputField>
  )
}

export default MultiItemInputField;