import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import React from 'react';

interface LexicalContentEditableProps {
  placeholder: string;
}

const LexicalContentEditable: React.FC<LexicalContentEditableProps> = ({
  placeholder,
}) => {
  return (
    <ContentEditable
      aria-placeholder={placeholder}
      className="min-h-[150px] resize-none caret-[rgb(5,5,5)] relative outline-none py-4 px-6 editor-cell"
      placeholder={
        <div className="absolute overflow-hidden text-gray-400 truncate pointer-events-none select-none top-4 left-6">
          {placeholder}
        </div>
      }
    />
  );
};

export default LexicalContentEditable;
