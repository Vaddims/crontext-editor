import { useState } from 'react';
import InputField, { InputFieldCommonProps, extractInputFieldProps } from '../InputField';
import './select-input-field.scss';

interface SelectInputFieldProps extends InputFieldCommonProps, React.DetailedHTMLProps<React.SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement> {
  children?: React.ReactNode;
}

const SelectInputField: React.FC<SelectInputFieldProps> = (props) => {
  
  return (
    <InputField
      className='select-input-field'
      {...extractInputFieldProps(props)}
    >
      <select {...props}>
        { props.children }
      </select>
    </InputField>
  )
}

export default SelectInputField;