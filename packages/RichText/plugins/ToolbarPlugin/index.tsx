import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
} from "@lexical/list";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $createQuoteNode, $isHeadingNode, $isQuoteNode } from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $patchStyleText,
  $setBlocksType,
} from "@lexical/selection";
import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from "@lexical/utils";
import {
  $createParagraphNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isParagraphNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  CLEAR_EDITOR_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  TextFormatType,
  UNDO_COMMAND,
} from "lexical";
import clsx from "clsx";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";

import DropDownFontSize from "../../components/DropDownFontSize";
import { getSelectedNode } from "../../utils/getSelectedNode";
import DropdownColorPicker from "../../components/DropDownColorPicker";
import DropDownLineHeight from "../../components/DropDownLineHeight";
import {
  IconBackgound,
  IconChatSquareQuote,
  IconChecklist,
  IconCloseOutlined,
  IconCode,
  IconDotsHorizontal,
  IconFileImage,
  IconFontColor,
  IconHorizontalRule,
  IconIndent,
  IconJustify,
  IconLink,
  IconListOl,
  IconListUl,
  IconOutdent,
  IconRedo,
  IconTable,
  IconTextCenter,
  IconTextLeft,
  IconTextRight,
  IconTypeBold,
  IconTypeClear,
  IconTypeItalic,
  IconTypeStrikethrough,
  IconTypeSubscript,
  IconTypeSuperscript,
  IconTypeUnderline,
  IconUndo,
  IconYoutube,
} from "../../icons";
import { InsertImageDialog } from "../ImagesPlugin";
import useModal from "../../utils/useModal";
import { sanitizeUrl } from "../../utils/url";
import DropdownEmoji from "../../components/DropDownEmoji";
import DropDownLetterSpacing from "../../components/DropDownLetterSpacing";
import { InsetYouTubeDialog } from "../YouTubePlugin";
import { InsertTableDialog } from "../TablePlugin";
import { $createCodeNode } from "@lexical/code";
import DropDown from "../../components/DropDown";
import { useSettings } from "../../context/SettingsContext";

const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};

const Divider: React.FC<{ horizontal?: boolean }> = (props) => {
  const { horizontal = false } = props;
  return (
    <div
      className={horizontal ? "lexicaltheme__toolbar__divider_h" : "lexicaltheme__toolbar__divider"}
    />
  );
};

interface ToolbarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  horizontal?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = (props) => {
  const { children, className, active, horizontal, ...rest } = props;
  return (
    <button
      type="button"
      className={clsx(
        "toolbarbutton",
        active ? "toolbarbutton-active" : "",
        horizontal ? "toolbarbutton-horizontal" : "",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

interface ToolbarPluginProps {
  overflowType?: "fill" | "scroll" | "expand";
  toolbarConfig?: ToolbarKeys[];
}

type ToolbarKeys =
  | "divider"
  | "undo"
  | "redo"
  | "fontSize"
  | "lineHeight"
  | "letterSpacing"
  | "fontColor"
  | "backgroundColor"
  | "bold"
  | "italic"
  | "underLine"
  | "strikeThrough"
  | "subscript"
  | "superscript"
  | "clearFormatting"
  | "emoji"
  | "outdent"
  | "indent"
  | "textAlignLeft"
  | "textAlignCenter"
  | "textAlignRight"
  | "textAlignJustify"
  | "listBullet"
  | "listNumber"
  | "listCheck"
  | "quote"
  | "image"
  | "video"
  | "link"
  | "horizontalRule"
  | "table"
  | "clearUp"
  | "code";

const ToolbarPlugin: React.FC<ToolbarPluginProps> = (props) => {
  const {
    overflowType = "expand",
    toolbarConfig = [
      "undo",
      "redo",
      "divider",
      "fontSize",
      "lineHeight",
      "letterSpacing",
      "divider",
      "fontColor",
      "backgroundColor",
      "bold",
      "italic",
      "underLine",
      "strikeThrough",
      "divider",
      "subscript",
      "superscript",
      "clearFormatting",
      "emoji",
      "divider",
      "outdent",
      "indent",
      "textAlignLeft",
      "textAlignCenter",
      "textAlignRight",
      "textAlignJustify",
      "divider",
      "listBullet",
      "listNumber",
      "listCheck",
      "quote",
      "divider",
      "image",
      "video",
      "link",
      "horizontalRule",
      "table",
      "divider",
      "clearUp",
      "code",
    ],
  } = props;
  const {
    settings: { disabled },
  } = useSettings();

  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState<number>();

  const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>("paragraph");
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [fontSize, setFontSize] = useState<string>("16px");
  const [lineHeight, setLineHeight] = useState<string>();
  const [letterSpacing, setLetterSpacing] = useState<string>();

  const [fontColor, setFontColor] = useState<string>("#000");
  const [bgColor, setBgColor] = useState<string>("#fff");
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const [isLink, setIsLink] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);

  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");

  const [modal, showModal] = useModal();

  //- update toolbar state
  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDOM !== null) {
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(anchorNode, ListNode);
          const type = parentList ? parentList.getListType() : (element as ListNode).getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element) ? element.getTag() : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        }
      }
      // Handle buttons
      setFontColor($getSelectionStyleValueForProperty(selection, "color", "#000"));
      setBgColor($getSelectionStyleValueForProperty(selection, "background-color", "#fff"));
      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline()
        );
      }

      // If matchingParent is a valid node, pass it's format type
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
          ? node.getFormatType()
          : parent?.getFormatType() || "left"
      );
    }
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));

      setFontSize($getSelectionStyleValueForProperty(selection, "font-size", "16px"));
      setLineHeight($getSelectionStyleValueForProperty(selection, "line-height"));
      setLetterSpacing($getSelectionStyleValueForProperty(selection, "letter-spacing", "0px"));
    }
  }, [activeEditor]);

  //- register editor
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL
    );
  }, [editor, $updateToolbar]);

  //- update undo/redo state
  useEffect(() => {
    return mergeRegister(
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
        editor.getEditorState().read(() => {
          const root = $getRoot();
          const children = root.getChildren();

          if (children.length > 1) {
            setIsEditorEmpty(false);
          } else {
            if ($isParagraphNode(children[0])) {
              const paragraphChildren = children[0].getChildren();
              setIsEditorEmpty(paragraphChildren.length === 0);
            } else {
              setIsEditorEmpty(false);
            }
          }
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      )
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    if (overflowType !== "expand") {
      setOverflow(toolbarConfig.length);
      return;
    }

    const checkOverflow = () => {
      const container = toolbarRef.current;
      if (container) {
        let index = 0;
        let cWidth = container.clientWidth - 8 - 36;
        while (cWidth > 0) {
          cWidth -= toolbarItemMap[toolbarConfig[index]]?.width + 2;
          if (cWidth > 0) index++;
          else index--;
        }
        if (index !== overflow) setOverflow(index);
      }
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatText = (format: TextFormatType) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  //- handle text style changes
  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) $patchStyleText(selection, styles);
        },
        skipHistoryStack ? { tag: "historic" } : {}
      );
    },
    [activeEditor]
  );

  //-
  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const nodes = selection.getNodes();
        const extractedNodes = selection.extract();

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return;
        }

        nodes.forEach((node, idx) => {
          if ($isTextNode(node)) {
            let textNode = node;
            if (idx === 0 && anchor.offset !== 0) {
              textNode = textNode.splitText(anchor.offset)[1] || textNode;
            }
            if (idx === nodes.length - 1) {
              textNode = textNode.splitText(focus.offset)[0] || textNode;
            }

            const extractedTextNode = extractedNodes[0];
            if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
              textNode = extractedTextNode;
            }

            if (textNode.__style !== "") {
              textNode.setStyle("");
            }
            if (textNode.__format !== 0) {
              textNode.setFormat(0);
              $getNearestBlockElementAncestorOrThrow(textNode).setFormat("");
            }
            // eslint-disable-next-line no-param-reassign
            node = textNode;
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat("");
          }
        });
      }
    });
  }, [activeEditor]);

  //- font color handler
  const onFontColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: value }, skipHistoryStack);
    },
    [applyStyleText]
  );

  //- background color handler
  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ "background-color": value }, skipHistoryStack);
    },
    [applyStyleText]
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl("https://"));
    } else {
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, isLink]);

  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        let selection = $getSelection();

        if (selection !== null) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertRawText(textContent);
            }
          }
        }
      });
    }
  };

  const toolbarItemMap = {
    divider: {
      width: 17,
      children: (horizontal?: boolean) => <Divider horizontal={horizontal} />,
    },
    undo: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          horizontal={horizontal}
          disabled={!canUndo || disabled}
          onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
        >
          <IconUndo />
          {horizontal ? "Undo" : null}
        </ToolbarButton>
      ),
    },
    redo: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          horizontal={horizontal}
          disabled={!canRedo || disabled}
          onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
        >
          <IconRedo />
          {horizontal ? "Redo" : null}
        </ToolbarButton>
      ),
    },
    fontSize: {
      width: 100,
      children: (horizontal?: boolean) => (
        <DropDownFontSize disabled={disabled} editor={activeEditor} selectionFontSize={fontSize} />
      ),
    },
    lineHeight: {
      width: 100,
      children: (horizontal?: boolean) => (
        <DropDownLineHeight
          disabled={disabled}
          editor={activeEditor}
          selectionLineHeight={lineHeight}
        />
      ),
    },
    letterSpacing: {
      width: 100,
      children: (horizontal?: boolean) => (
        <DropDownLetterSpacing
          disabled={disabled}
          editor={activeEditor}
          selectionLetterSpacing={letterSpacing}
        />
      ),
    },
    fontColor: {
      width: 36,
      children: (horizontal?: boolean) => (
        <DropdownColorPicker
          color={fontColor}
          disabled={disabled}
          icon={<IconFontColor />}
          onChange={onFontColorSelect}
        />
      ),
    },
    backgroundColor: {
      width: 36,
      children: (horizontal?: boolean) => (
        <DropdownColorPicker
          color={bgColor}
          disabled={disabled}
          icon={<IconBackgound />}
          onChange={onBgColorSelect}
        />
      ),
    },
    bold: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          active={isBold}
          disabled={disabled}
          horizontal={horizontal}
          onClick={() => formatText("bold")}
        >
          <IconTypeBold />
          {horizontal ? "Bold" : null}
        </ToolbarButton>
      ),
    },
    italic: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          active={isItalic}
          disabled={disabled}
          horizontal={horizontal}
          onClick={() => formatText("italic")}
        >
          <IconTypeItalic />
          {horizontal ? "Italic" : null}
        </ToolbarButton>
      ),
    },
    underLine: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          active={isUnderline}
          horizontal={horizontal}
          onClick={() => formatText("underline")}
        >
          <IconTypeUnderline />
          {horizontal ? "UnderLine" : null}
        </ToolbarButton>
      ),
    },
    strikeThrough: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          active={isStrikethrough}
          onClick={() => formatText("strikethrough")}
        >
          <IconTypeStrikethrough />
          {horizontal ? "StrikeThrough" : null}
        </ToolbarButton>
      ),
    },
    subscript: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          active={isSubscript}
          horizontal={horizontal}
          onClick={() => formatText("subscript")}
        >
          <IconTypeSubscript />
          {horizontal ? "Subscript" : null}
        </ToolbarButton>
      ),
    },
    superscript: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          active={isSuperscript}
          horizontal={horizontal}
          onClick={() => formatText("superscript")}
        >
          <IconTypeSuperscript />
          {horizontal ? "Superscript" : null}
        </ToolbarButton>
      ),
    },
    clearFormatting: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton disabled={disabled} horizontal={horizontal} onClick={clearFormatting}>
          <IconTypeClear />
          {horizontal ? "Clear Format" : null}
        </ToolbarButton>
      ),
    },
    emoji: {
      width: 36,
      children: (horizontal?: boolean) => (
        <DropdownEmoji
          disabled={disabled}
          editor={activeEditor}
          type={horizontal ? "listitem" : "button"}
        />
      ),
    },
    outdent: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          onClick={() => editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
        >
          <IconOutdent />
          {horizontal ? "Outdent" : null}
        </ToolbarButton>
      ),
    },
    indent: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          onClick={() => editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
        >
          <IconIndent />
          {horizontal ? "Indent" : null}
        </ToolbarButton>
      ),
    },
    textAlignLeft: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          active={elementFormat === "left"}
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left")}
        >
          <IconTextLeft />
          {horizontal ? "Left Align" : null}
        </ToolbarButton>
      ),
    },
    textAlignCenter: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          active={elementFormat === "center"}
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center")}
        >
          <IconTextCenter />
          {horizontal ? "Center Align" : null}
        </ToolbarButton>
      ),
    },
    textAlignRight: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          active={elementFormat === "right"}
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right")}
        >
          <IconTextRight />
          {horizontal ? "Right Align" : null}
        </ToolbarButton>
      ),
    },
    textAlignJustify: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          active={elementFormat === "justify"}
          onClick={() => editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify")}
        >
          <IconJustify />
          {horizontal ? "Justify Align" : null}
        </ToolbarButton>
      ),
    },
    listBullet: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          active={blockType === "bullet"}
          onClick={() => {
            if (blockType !== "bullet") {
              editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
            } else {
              formatParagraph();
            }
          }}
        >
          <IconListUl />
          {horizontal ? "Bullet List" : null}
        </ToolbarButton>
      ),
    },
    listNumber: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          active={blockType === "number"}
          onClick={() => {
            if (blockType !== "number") {
              editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
            } else {
              formatParagraph();
            }
          }}
        >
          <IconListOl />
          {horizontal ? "Number List" : null}
        </ToolbarButton>
      ),
    },
    listCheck: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          active={blockType === "check"}
          onClick={() => {
            if (blockType !== "check") {
              editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
            } else {
              formatParagraph();
            }
          }}
        >
          <IconChecklist />
          {horizontal ? "Check List" : null}
        </ToolbarButton>
      ),
    },
    quote: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          active={blockType === "quote"}
          onClick={() => {
            if (blockType !== "quote") {
              editor.update(() => {
                const selection = $getSelection();
                $setBlocksType(selection, () => $createQuoteNode());
              });
            } else {
              formatParagraph();
            }
          }}
        >
          <IconChatSquareQuote />
          {horizontal ? "Quote" : null}
        </ToolbarButton>
      ),
    },
    image: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          onClick={() => {
            showModal("插入图片", (onClose) => (
              <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />
            ));
          }}
        >
          <IconFileImage />
          {horizontal ? "Image" : null}
        </ToolbarButton>
      ),
    },
    video: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          onClick={() => {
            showModal(`添加 YouTube 视频`, (onClose) => (
              <InsetYouTubeDialog activeEditor={activeEditor} onClose={onClose} />
            ));
          }}
        >
          <IconYoutube />
          {horizontal ? "Video" : null}
        </ToolbarButton>
      ),
    },
    link: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          active={isLink}
          disabled={disabled}
          onClick={insertLink}
          horizontal={horizontal}
        >
          <IconLink />
          {horizontal ? "Link" : null}
        </ToolbarButton>
      ),
    },
    horizontalRule: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          onClick={() => editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)}
        >
          <IconHorizontalRule />
          {horizontal ? "Divider" : null}
        </ToolbarButton>
      ),
    },
    table: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          disabled={disabled}
          horizontal={horizontal}
          onClick={() => {
            showModal("插入表格", (onClose) => (
              <InsertTableDialog activeEditor={activeEditor} onClose={onClose} />
            ));
          }}
        >
          <IconTable />
          {horizontal ? "Table" : null}
        </ToolbarButton>
      ),
    },
    clearUp: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton
          horizontal={horizontal}
          disabled={isEditorEmpty || disabled}
          onClick={() => editor.dispatchCommand(CLEAR_EDITOR_COMMAND, undefined)}
        >
          <IconCloseOutlined />
          {horizontal ? "Clear Up" : null}
        </ToolbarButton>
      ),
    },
    code: {
      width: 36,
      children: (horizontal?: boolean) => (
        <ToolbarButton horizontal={horizontal} onClick={formatCode}>
          <IconCode />
          {horizontal ? "Code" : null}
        </ToolbarButton>
      ),
    },
  };

  return (
    <div
      ref={toolbarRef}
      className={
        overflowType === "scroll" ? "lexicaltheme__toolbar_scroll" : "lexicaltheme__toolbar"
      }
    >
      {toolbarConfig.map((config, index) => {
        if (!overflow || index > overflow) return null;
        return (
          <React.Fragment key={config + index}>{toolbarItemMap[config].children()}</React.Fragment>
        );
      })}
      {overflow && overflow !== toolbarConfig.length ? (
        <DropDown
          type="button"
          disabled={disabled}
          buttonLabel={<IconDotsHorizontal />}
          stopCloseOnClickSelf
        >
          <div className="lexicaltheme__dropdown__more_box">
            {toolbarConfig.map((config, index) => {
              if (!overflow || index <= overflow) return null;
              return <div key={config + index}>{toolbarItemMap[config].children(true)}</div>;
            })}
          </div>
        </DropDown>
      ) : null}
      {modal}
    </div>
  );
};

export default ToolbarPlugin;
