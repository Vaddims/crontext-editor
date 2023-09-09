import { useEffect, useRef, useState } from 'react';
import InputField, { extractInputFieldProps, InputFieldCommonProps } from '../InputField';
import './text-input-field.scss';
import { nanoid } from 'nanoid';

export interface InputFieldDatalistElement {
  readonly name: string;
  readonly description?: string;
}

interface TextInputField extends InputFieldCommonProps, React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {
  readonly inputDatalist?: InputFieldDatalistElement[];
  readonly inputRef?: React.Ref<HTMLInputElement>;
  readonly children?: React.ReactNode;
  readonly idleValue?: string | number;
}

const TextInputField: React.FC<TextInputField> = (props) => {
  const [ inputId ] = useState(nanoid());
  const inputElementId = `input-${inputId}`;
  const datalistElementId = `datalist-${inputElementId}`;

  const [ useIdleValue, setUseIdleValue ] = useState<boolean>(true);


  const onFocus = () => {
    setUseIdleValue(false);
  }

  const onBlur = () => {
    setUseIdleValue(true);
  }

  return (
    <InputField
      {...extractInputFieldProps(props)}
      inputId={inputElementId}
      className='text-input-field'
    >
      <input
        {...props}
        value={useIdleValue && typeof props.idleValue !== 'undefined' ? props.idleValue : props.value}
        onFocus={onFocus}
        onBlur={onBlur}
        ref={props.inputRef}
        id={inputElementId}
        list={datalistElementId}
        required={props.markAsRequired}
        readOnly={props.readOnly ?? !props.onChange}
      />
      <datalist id={datalistElementId}>
        {props.inputDatalist?.map((element) => (
          <option value={element.name} key={element.name}>{element.description}</option>
        ))}
      </datalist>
    </InputField>
  )
}

export default TextInputField;