import { $generateHtmlFromNodes } from '@lexical/html';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';

const SerializationPlugin: React.FC<{ onChange: (value: string) => void }> = ({
  onChange,
}) => {
  const [editor] = useLexicalComposerContext();
  return (
    <OnChangePlugin
      onChange={(v) => {
        v.read(() => {
          console.log(v.toJSON());
          const htmlString = $generateHtmlFromNodes(editor);
          onChange(htmlString);
        });
      }}
    />
  );
};

export default SerializationPlugin;
