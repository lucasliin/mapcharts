import React, { useEffect, useState } from "react";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { CharacterLimitPlugin } from "@lexical/react/LexicalCharacterLimitPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { CAN_USE_DOM } from "@lexical/utils";

import ToolbarPlugin from "./plugins/ToolbarPlugin";
import theme from "./themes/CommentEditorTheme";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import { useSettings } from "./context/SettingsContext";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import PageBreakPlugin from "./plugins/PageDividerPlugin";
import LexicalContentEditable from "./components/ContentEditable";
import EmojisPlugin from "./plugins/EmojisPlugin";
import NewMentionsPlugin from "./plugins/MentionsPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";
import SerializationPlugin from "./plugins/SerializationPlugin";
import {
  $createParagraphNode,
  $getRoot,
  $isDecoratorNode,
  $isElementNode,
  LexicalEditor,
} from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";

export interface LexicalRichTextEditorProps {
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const LexicalRichTextEditor: React.FC<LexicalRichTextEditorProps> = (props) => {
  const { defaultValue, onChange } = props;

  const { historyState } = useSharedHistoryContext();
  const {
    settings: { isCharLimit, isCharLimitUtf8 },
  } = useSettings();

  function prepopulatedRichText(params: {
    value: string;
    editor: LexicalEditor;
  }) {
    return params.editor.update(() => {
      const root = $getRoot();

      const document = new DOMParser().parseFromString(
        params.value,
        "text/html"
      );
      const generatedNodes = $generateNodesFromDOM(params.editor, document);
      const nodes = generatedNodes.map((node) => {
        if (!$isElementNode(node) && !$isDecoratorNode(node)) {
          const p = $createParagraphNode();
          p.append(node);
          return p;
        }

        return node;
      });
      root.append(...nodes);
    });
  }

  const initialConfig = {
    editorState:
      defaultValue !== undefined
        ? (editor: LexicalEditor) =>
            prepopulatedRichText({ value: defaultValue!, editor })
        : undefined,
    namespace: "Lexical Demo",
    nodes: [...PlaygroundNodes],
    onError(error: Error) {
      throw error;
    },
    theme: theme,
  };
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia("(max-width: 1025px)").matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener("resize", updateViewPortWidth);

    return () => {
      window.removeEventListener("resize", updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="my-5 rounded-lg border-[#e2e2e2] border-solid border w-full text-black relative text-left">
        <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
        {/* {isMaxLength && <MaxLengthPlugin maxLength={30} />} */}
        <AutoFocusPlugin />
        <ClearEditorPlugin />

        <NewMentionsPlugin />
        <EmojisPlugin />
        <HashtagPlugin />
        {/* <EmojiPickerPlugin /> */}

        <div className="relative bg-white">
          <RichTextPlugin
            contentEditable={
              <div className="min-h-[150px] border-none flex relative outline-none z-0 overflow-auto resize-y">
                <div ref={onRef} className="flex-auto relative resize-y -z-[1]">
                  <LexicalContentEditable placeholder="Enter some rich text..." />
                </div>
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          {/* {isCollab ? (
              <CollaborationPlugin
                id="main"
                providerFactory={createWebsocketProvider}
                shouldBootstrap={!skipCollaborationInit}
              />
            ) : (
            )} */}
          <ImagesPlugin />
          <HistoryPlugin externalHistoryState={historyState} />

          <ListPlugin />
          <CheckListPlugin />
          <ClickableLinkPlugin />
          <HorizontalRulePlugin />

          <PageBreakPlugin />
          <LinkPlugin />
          <YouTubePlugin />

          {floatingAnchorElem && !isSmallWidthViewport && (
            <>
              <FloatingLinkEditorPlugin
                anchorElem={floatingAnchorElem}
                isLinkEditMode={isLinkEditMode}
                setIsLinkEditMode={setIsLinkEditMode}
              />
              <FloatingTextFormatToolbarPlugin
                anchorElem={floatingAnchorElem}
                setIsLinkEditMode={setIsLinkEditMode}
              />
            </>
          )}
          <SerializationPlugin
            onChange={(value) => onChange && onChange(value)}
          />
          {(isCharLimit || isCharLimitUtf8) && (
            <CharacterLimitPlugin
              charset={isCharLimit ? "UTF-16" : "UTF-8"}
              maxLength={5}
            />
          )}
        </div>
      </div>
    </LexicalComposer>
  );
};

export default LexicalRichTextEditor;
