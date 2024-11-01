import React, { ReactNode } from 'react';

type Props = Readonly<{
  'data-test-id'?: string;
  children: ReactNode;
}>;

export const DialogButtonsList: React.FC<Props> = ({ children }) => {
  return <div className="flex flex-col justify-end gap-4">{children}</div>;
};

export const DialogActions: React.FC<Props> = ({
  'data-test-id': dataTestId,
  children,
}) => {
  return (
    <div
      className="flex justify-end p-4 border-t border-gray-200 border-solid"
      data-test-id={dataTestId}
    >
      {children}
    </div>
  );
};
