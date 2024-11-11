import React, { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface PortalImplProps {
  children: ReactNode;
  closeOnClickOutside: boolean;
  onClose: () => void;
  title: string;
}

const PortalImpl: React.FC<PortalImplProps> = (props) => {
  const { onClose, children, title, closeOnClickOutside } = props;
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (modalRef.current !== null) {
      modalRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let modalOverlayElement: HTMLElement | null = null;
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    const clickOutsideHandler = (event: MouseEvent) => {
      const target = event.target;
      if (
        modalRef.current !== null &&
        !modalRef.current.contains(target as Node) &&
        closeOnClickOutside
      ) {
        onClose();
      }
    };
    const modelElement = modalRef.current;
    if (modelElement !== null) {
      modalOverlayElement = modelElement.parentElement;
      if (modalOverlayElement !== null) {
        modalOverlayElement.addEventListener("click", clickOutsideHandler);
      }
    }

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
      if (modalOverlayElement !== null) {
        modalOverlayElement?.removeEventListener("click", clickOutsideHandler);
      }
    };
  }, [closeOnClickOutside, onClose]);

  return (
    <div role="dialog" className="lexicaltheme__dialog">
      <div
        tabIndex={-1}
        ref={modalRef}
        className="min-h-[100px] min-w-[300px] flex grow-0 bg-white flex-col relative shadow-md rounded-lg"
      >
        <div className="lexicaltheme__dialogheader">
          <h2 className="lexicaltheme__dialogheader__title">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="lexicaltheme__dialogheader__close"
          >
            <svg
              width={24}
              height={24}
              fill="currentColor"
              viewBox="0 0 24 24"
              data-testid="CloseIcon"
            >
              <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
          </button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

interface ModalProps {
  children: ReactNode;
  closeOnClickOutside?: boolean;
  onClose: () => void;
  title: string;
}

const Modal: React.FC<ModalProps> = (props) => {
  const { onClose, children, title, closeOnClickOutside = false } = props;
  return createPortal(
    <PortalImpl
      title={title}
      onClose={onClose}
      closeOnClickOutside={closeOnClickOutside}
    >
      {children}
    </PortalImpl>,
    document.body
  );
};

export default Modal;
