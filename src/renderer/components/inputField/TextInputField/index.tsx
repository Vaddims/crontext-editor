import { useState } from 'react';
import InputField, { InputFieldCommonProps } from '../InputField';
import { nanoid } from 'nanoid';
import './TextInputField.scss';
import { composeClassNames } from '../../../utilities/reactComponent.util';

export namespace TextInputFieldUtils {
  export interface DatalistItem {
    readonly name: string;
    readonly description?: string;
  }

  export interface Props extends InputFieldCommonProps {
    readonly inputProps?: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    readonly inputDatalist?: DatalistItem[];
  }
}

const TextInputField: React.FC<TextInputFieldUtils.Props> = (props) => {
  const [ id ] = useState(nanoid(10));
  const inputId = `TI-${id}`;
  const dataListId = `TIDL-${id}`;

  return (
    <InputField
      {...props}
      fieldProps={{
        ...props.fieldProps,
        htmlFor: inputId,
        className: composeClassNames('text-input-field', props.fieldProps?.className)
      }}
    >
      <input
        {...props.inputProps}
        id={inputId}
        list={dataListId}
        required={props.markAsRequired}
        readOnly={props.inputProps?.readOnly ?? !props.inputProps?.onChange}
      />
      <datalist id={dataListId}>
        {props.inputDatalist?.map((element) => (
          <option value={element.name} key={element.name}>{element.description}</option>
        ))}
      </datalist>
    </InputField>
  )
}

export default TextInputField;
