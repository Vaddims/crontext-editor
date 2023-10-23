import { useEffect, useRef } from "react";
import './DialogModal.scss';

interface DialogModalProps {
  readonly isOpen?: boolean;
  readonly className?: string;
  readonly children: React.ReactNode;
}

const DialogModal: React.FC<DialogModalProps> = (props) => {
  const ref = useRef<HTMLDialogElement>(null);

  // useEffect(() => {
  //   if (!ref.current) {
  //     return;
  //   }

  //   if (props.isOpen) {
  //     ref.current.showModal();
  //   } else {
  //     ref.current.close();
  //   }
  // }, [ref.current]);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    if (props.isOpen) {
      ref.current.showModal();
    } else {
      ref.current.close();
    }
  }, [props.isOpen]);

  return (
    <dialog ref={ref} className={props.className}>
      {props.children}
    </dialog>
  );
}

export default DialogModal;