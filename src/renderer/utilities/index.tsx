// import { faLayerGroup, faRotateBack, faXmark, IconDefinition } from '@fortawesome/free-solid-svg-icons';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { useEffect, useRef, useState } from 'react';
// import { InputField as InputFieldNamespace } from '../../middleware/hooks/useInputField';
// import './input-field.scss';
// import { nanoid } from 'nanoid';

// export type FalsyType = false | null | undefined;

// export interface InputFieldCommonProps {
//   readonly label?: string;
//   readonly labelIcon?: IconDefinition;
//   readonly inputIcon?: IconDefinition;
//   readonly markAsRequired?: boolean;
//   readonly helperText?: string;
//   readonly htmlFor?: string;
//   readonly mixedValuesState?: boolean | undefined; // boolean - show / undefined - hide
//   readonly onMixedValueStateClick?: () => void;
//   readonly status?: InputFieldNamespace.Status;
//   readonly onInputRestore?: React.MouseEventHandler<HTMLButtonElement> | FalsyType;
//   readonly onInputClear?: React.MouseEventHandler<HTMLButtonElement> | FalsyType;
//   readonly onUnbound?: (event: MouseEvent) => void;
//   readonly fieldClassName?: string;
//   readonly inputPrefix?: string;
//   readonly children?: any;
// }

// export interface InputFieldProps extends InputFieldCommonProps {
//   readonly inputId?: string;
//   readonly className?: string;
// }

// function hasChildElement(element: Element, targetElement: Element): boolean {
//   if (element === targetElement) {
//     return true;
//   }

//   return Array.from(element.children).some((child) => hasChildElement(child, targetElement));
// }

// export const InputField: React.FC<InputFieldProps> = (props) => {
//   const labelRef = useRef(null);
//   const [ inputId ] = useState(props.inputId ?? nanoid());
//   const composedLabelClassName = ['input-field', props.fieldClassName, props.className].join(' ');

//   useEffect(() => {
//     const handler = (event: MouseEvent) => {
//       if (labelRef.current && !hasChildElement(labelRef.current, event.target as Element)) {
//         props.onUnbound?.(event);
//       }
//     }

//     document.body.addEventListener('mouseup', handler);
//     return () => {
//       document.body.removeEventListener('mouseup', handler);
//     }
//   })

//   return (
//     <label
//       htmlFor={inputId}
//       className={composedLabelClassName}
//       data-status={props.status}
//       ref={labelRef}
//       data-mixed-values={props.mixedValuesState}
//     >
//       {props.label && (
//         <header>
//           { props.labelIcon && (
//             <FontAwesomeIcon icon={props.labelIcon} className='label-icon' />
//           )}
//           <label>
//             <span className='label-title'>{props.label}</span>
//             { !props.markAsRequired && (
//               <>
//                 <span className='optional-divider'> - </span>
//                 <span className='optional-label'>Optional</span>
//               </>
//             )}
//           </label>
//         </header>
//       )}
//       <section className="input-section">
//         <div className='input-icon-wrapper'>
//           { props.inputIcon && <FontAwesomeIcon icon={props.inputIcon} className='input-icon' /> }
//           { props.inputPrefix && <span className='text'>{props.inputPrefix}</span> }
//         </div>
//         { props.children }
//         <div className='input-management-actions'>
//           { props.onInputRestore && (
//             <button className='action-icon' onClick={props.onInputRestore} title='Restore input'>
//               <FontAwesomeIcon icon={faRotateBack} size='lg' />
//             </button>
//           )}
//           { props.onInputClear && (
//             <button className='action-icon' onClick={props.onInputClear} title='Clear input'>
//               <FontAwesomeIcon icon={faXmark} size='lg' />
//             </button>
//           )}
//           {(typeof props.mixedValuesState !== 'undefined' && props.onMixedValueStateClick) && (
//             <button 
//               onClick={props.onMixedValueStateClick} 
//               className='action-icon mixed-value-state' 
//               title='Use Existing value' 
//               aria-checked={props.mixedValuesState}
//             >
//               <FontAwesomeIcon icon={faLayerGroup} />
//             </button>
//           )}
//         </div>
//       </section>
//       { props.helperText && (
//         <span className='helper-text'>{props.helperText}</span>
//       )}
//     </label>
//   )
// }

// export default InputField;

// export function extractInputFieldProps(props: InputFieldCommonProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>): InputFieldCommonProps {
//   return {
//     label: props.label,
//     helperText: props.helperText,
//     inputIcon: props.inputIcon,
//     labelIcon: props.labelIcon,
//     onInputClear: props.onInputClear,
//     onInputRestore: props.onInputRestore,
//     onMixedValueStateClick: props.onMixedValueStateClick,
//     onUnbound: props.onUnbound,
//     markAsRequired: props.markAsRequired,
//     mixedValuesState: props.mixedValuesState,
//     status: props.status,
//     htmlFor: props.htmlFor,
//     fieldClassName: props.fieldClassName,
//     inputPrefix: props.inputPrefix,
//   }
// }

// export function removeInputFieldProps(props: InputFieldCommonProps & React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>) {
//   const {
//     label,
//     helperText,
//     inputIcon,
//     labelIcon,
//     onInputClear,
//     onInputRestore,
//     onMixedValueStateClick,
//     onUnbound,
//     markAsRequired,
//     mixedValuesState,
//     status,
//     htmlFor,
//     fieldClassName,
//     inputPrefix,
//     ...htmlProps
//   } = props;

//   return htmlProps;
// }