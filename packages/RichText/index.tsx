import React, { useEffect, useState } from "react";
// import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { CharacterLimitPlugin } from "@lexical/react/LexicalCharacterLimitPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { HashtagPlugin } from "@lexical/react/LexicalHashtagPlugin";
import { CAN_USE_DOM } from "@lexical/utils";

import ToolbarPlugin from "./plugins/ToolbarPlugin";
import theme from "./themes/CommentEditorTheme";
import { useSharedHistoryContext } from "./context/SharedHistoryContext";
import { SettingsContext, useSettings } from "./context/SettingsContext";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import PageBreakPlugin from "./plugins/PageDividerPlugin";
import LexicalContentEditable from "./components/ContentEditable";
import EmojisPlugin from "./plugins/EmojisPlugin";
import NewMentionsPlugin from "./plugins/MentionsPlugin";
import ImagesPlugin from "./plugins/ImagesPlugin";
import FloatingLinkEditorPlugin from "./plugins/FloatingLinkEditorPlugin";
import TableCellResizerPlugin from "./plugins/TableCellResizerPlugin";
import TableActionMenuPlugin from "./plugins/TableActionMenuPlugin";
import LinkPlugin from "./plugins/LinkPlugin";
import FloatingTextFormatToolbarPlugin from "./plugins/FloatingTextFormatToolbarPlugin";
import YouTubePlugin from "./plugins/YouTubePlugin";
import SerializationPlugin from "./plugins/SerializationPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import {
  $createParagraphNode,
  $getRoot,
  $isDecoratorNode,
  $isElementNode,
  LexicalEditor,
  TextNode,
} from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";
import { useDebounceEffect } from "ahooks";
import TableHoverActionsPlugin from "./plugins/TableHoverActionsPlugin";
import TableOfContentsPlugin from "./plugins/TableOfContentsPlugin";
import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
import { ExtendedTextNode } from "./nodes/ExtendedTextNode";
import { TableContext } from "./plugins/TablePlugin";
import { $isLinkNode } from "@lexical/link";
import MaxLengthPlugin from "./plugins/MaxLengthPlugin";
import TabFocusPlugin from "./plugins/TabFocusPlugin";
import TreeViewPlugin from "./plugins/TreeViewPlugin";

export interface LnkstoneEditorProps {
  id?: string;
  preview?: boolean;
  disabled?: boolean;
  placeholder?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  max?: { len: number; preventInput?: boolean };
  status?: "error" | "success" | "warning" | "info" | "default";
}

const LnkstoneEditor: React.FC<LnkstoneEditorProps> = (props) => {
  const { id, preview, disabled, onChange, placeholder, defaultValue, status = "default" } = props;

  const borderColor = new Map<string, string>([
    ["default", "#e2e2e2"],
    ["error", "#FF0000"],
    ["success", "#4caf50"],
    ["warning", "#ff9800"],
    ["info", "#2196f3"],
  ]);

  const [richTextValue, setRichTextValue] = useState<string>();
  const [count, setCount] = useState<number>(0);

  const { historyState } = useSharedHistoryContext();
  const {
    settings: {
      isCharLimit,
      tableCellMerge,
      isCharLimitUtf8,
      showTableOfContents,
      tableCellBackgroundColor,
    },
  } = useSettings();

  function prepopulatedRichText(params: { value: string; editor: LexicalEditor }) {
    return params.editor.update(() => {
      const root = $getRoot();

      const document = new DOMParser().parseFromString(params.value, "text/html");
      const generatedNodes = $generateNodesFromDOM(params.editor, document);

      const nodes = [];
      let temp = [];

      for (let i = 0; i < generatedNodes.length; i++) {
        const node = generatedNodes[i];
        // console.log($is(node));
        if (!$isElementNode(node) && !$isDecoratorNode(node)) {
          const p = $createParagraphNode();
          if (temp.length > 0) {
            p.append(...temp);
            temp = [];
          } else {
            p.append(node);
          }
          nodes.push(p);
        } else if ($isLinkNode(node)) {
          temp.push(node);
        } else {
          nodes.push(node);
        }
      }
      if (temp.length > 0) {
        const p = $createParagraphNode();
        p.append(...temp);
        nodes.push(p);
      }
      root.append(...nodes);
    });
  }

  const initialConfig = {
    editable: !disabled,
    editorState:
      defaultValue !== undefined
        ? (editor: LexicalEditor) => prepopulatedRichText({ value: defaultValue!, editor })
        : undefined,
    namespace: "Lexical Demo",
    nodes: [
      ...PlaygroundNodes,
      ExtendedTextNode,
      {
        replace: TextNode,
        with: (node: TextNode) => new ExtendedTextNode(node.__text),
        withKlass: ExtendedTextNode,
      },
    ],
    onError(error: Error) {
      throw error;
    },

    theme: theme,
  };

  const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);

  const [isSmallWidthViewport, setIsSmallWidthViewport] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia("(max-width: 860px)").matches;

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

  useDebounceEffect(() => {
    if (count === 0) {
      setCount(count + 1);
      return;
    }
    onChange && onChange(richTextValue ?? "");
  }, [richTextValue]);

  return (
    <SettingsContext
      initialConfig={{
        isCharLimit: false,
        isCharLimitUtf8: false,
        isCollab: false,
        isMaxLength: false,
        showTableOfContents: false,
        tableCellBackgroundColor: true,
        tableCellMerge: true,
        disabled: !!disabled,
      }}
    >
      <LexicalComposer initialConfig={initialConfig}>
        <TableContext>
          <div id={id} className="richtext-editor" style={{ borderColor: borderColor.get(status) }}>
            <ToolbarPlugin />
            {/* {max && (
              <MaxLengthPlugin max={max.len} preventInput={max.preventInput} />
            )} */}
            {/* <MaxLengthPlugin maxLength={2} /> */}
            {/* <AutoFocusPlugin /> */}
            <ClearEditorPlugin />

            <NewMentionsPlugin />
            <EmojisPlugin />
            <HashtagPlugin />
            {/* <EmojiPickerPlugin /> */}

            <RichTextPlugin
              contentEditable={
                <div className="editor-scroller">
                  <div ref={onRef} className="editor">
                    <LexicalContentEditable placeholder={placeholder ?? "请输入"} />
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
            <TablePlugin
              hasCellMerge={tableCellMerge}
              hasCellBackgroundColor={tableCellBackgroundColor}
              hasHorizontalScroll
            />
            <TableCellResizerPlugin />
            <ClickableLinkPlugin />
            <HorizontalRulePlugin />
            <TabFocusPlugin />
            <TabIndentationPlugin maxIndent={7} />

            <PageBreakPlugin />
            <LinkPlugin />
            <YouTubePlugin />

            {floatingAnchorElem && !isSmallWidthViewport && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                <FloatingLinkEditorPlugin anchorElem={floatingAnchorElem} />
                <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} />
                <TableActionMenuPlugin anchorElem={floatingAnchorElem} cellMerge={true} />
                <TableHoverActionsPlugin anchorElem={floatingAnchorElem} />
              </>
            )}
            <SerializationPlugin onChange={(value) => setRichTextValue(value)} />
            {/* <CharacterLimitPlugin charset="UTF-8" maxLength={30} /> */}

            {preview ? <TreeViewPlugin /> : null}

            <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
          </div>
        </TableContext>
      </LexicalComposer>
    </SettingsContext>
  );
};

export default LnkstoneEditor;
