import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $trimTextContentFromAnchor } from "@lexical/selection";
import { $restoreEditorState } from "@lexical/utils";
import {
  $getSelection,
  $isRangeSelection,
  EditorState,
  RootNode,
} from "lexical";
import { useEffect, useState } from "react";

interface MaxLengthPluginProps {
  maxLength: number;
  preventInput?: boolean;
}

const MaxLengthPlugin: React.FC<MaxLengthPluginProps> = ({
  maxLength,
  preventInput,
}) => {
  const [editor] = useLexicalComposerContext();
  const [textContentSize, setTextContentSize] = useState(0);

  useEffect(() => {
    let lastRestoredEditorState: EditorState | null = null;

    return editor.registerNodeTransform(RootNode, (rootNode: RootNode) => {
      const selection = $getSelection();
      if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
        return;
      }
      const prevEditorState = editor.getEditorState();
      const prevTextContentSize = prevEditorState.read(() =>
        rootNode.getTextContentSize()
      );
      const textContentSize =
        rootNode.getTextContentSize() -
        (rootNode.getChildrenSize() > 1 ? rootNode.getChildrenSize() - 1 : 0);
      setTextContentSize(textContentSize);

      if (prevTextContentSize !== textContentSize && preventInput) {
        const delCount = textContentSize - maxLength;
        const anchor = selection.anchor;

        if (delCount > 0) {
          if (
            prevTextContentSize === maxLength &&
            lastRestoredEditorState !== prevEditorState
          ) {
            lastRestoredEditorState = prevEditorState;
            $restoreEditorState(editor, prevEditorState);
          } else {
            $trimTextContentFromAnchor(editor, anchor, delCount);
          }
        }
      }
    });
  }, [editor, maxLength, preventInput]);

  return (
    <div
      className="lexicaltheme__count"
      style={{ color: textContentSize > maxLength ? "red" : "#6b7280" }}
    >
      {textContentSize + "/" + maxLength}
    </div>
  );
};

export default MaxLengthPlugin;
