import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $isListNode, ListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isHeadingNode, $isQuoteNode } from '@lexical/rich-text';
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
} from '@lexical/selection';
import { $isDecoratorBlockNode } from '@lexical/react/LexicalDecoratorBlockNode';
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  mergeRegister,
} from '@lexical/utils';
import {
  $createParagraphNode,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  ElementFormatType,
  FORMAT_TEXT_COMMAND,
  NodeKey,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  TextFormatType,
  UNDO_COMMAND,
} from 'lexical';
import clsx from 'clsx';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import { INSERT_HORIZONTAL_RULE_COMMAND } from '@lexical/react/LexicalHorizontalRuleNode';

import DropDownFontSize from '../../components/DropDownFontSize';
import { getSelectedNode } from '../../utils/getSelectedNode';
import DropdownColorPicker from '../../components/DropDownColorPicker';
import BlockFormatDropDown from '../../components/DropDownBlock';
import DropDownLineHeight from '../../components/DropDownLineHeight';
import DropDownAlignment from '../../components/DropDownAlignment';
import {
  IconBackgound,
  IconCode,
  IconFileImage,
  IconFontColor,
  IconHorizontalRule,
  IconLink,
  IconRedo,
  IconTypeBold,
  IconTypeClear,
  IconTypeItalic,
  IconTypeStrikethrough,
  IconTypeSubscript,
  IconTypeSuperscript,
  IconTypeUnderline,
  IconUndo,
  IconYoutube,
} from '../../icons';
import { InsertImageDialog } from '../ImagesPlugin';
import useModal from '../../utils/useModal';
import { sanitizeUrl } from '../../utils/url';
import DropdownEmoji from '../../components/DropDownEmoji';
import DropDownLetterSpacing from '../../components/DropDownLetterSpacing';
import { InsetYouTubeDialog } from '../YouTubePlugin';

const blockTypeToBlockName = {
  bullet: 'Bulleted List',
  check: 'Check List',
  code: 'Code Block',
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  number: 'Numbered List',
  paragraph: 'Normal',
  quote: 'Quote',
};

const Divider: React.FC = () => {
  return (
    <div className="h-8 mx-2 w-px float-left block shadow-[inset_-1px_0_#0000001a]" />
  );
};

interface ToolbarButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = (props) => {
  const { children, className, active, ...rest } = props;
  return (
    <button
      type="button"
      className={clsx(
        'min-h-[36px] min-w-[36px] flex items-center justify-center border-none cursor-pointer text-gray-700 rounded hover:bg-[#0000000d]',
        'disabled:text-gray-300 disabled:cursor-default disabled:hover:bg-transparent',
        active ? 'bg-[#0000000d]' : 'bg-transparent',
        className,
        '[&svg]:w-4 [&svg]:h-4'
      )}
      {...rest}
    >
      {props.children}
    </button>
  );
};

const ToolbarPlugin: React.FC<{
  setIsLinkEditMode: Dispatch<boolean>;
}> = ({ setIsLinkEditMode }) => {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const toolbarRef = useRef(null);

  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>('paragraph');
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null
  );

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [fontSize, setFontSize] = useState<string>('16px');
  const [lineHeight, setLineHeight] = useState<string>();
  const [letterSpacing, setLetterSpacing] = useState<string>();

  const [fontColor, setFontColor] = useState<string>('#000');
  const [bgColor, setBgColor] = useState<string>('#fff');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);

  const [isCode, setIsCode] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);

  const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');

  const [isRTL, setIsRTL] = useState(false);
  const [modal, showModal] = useModal();

  //- update toolbar state
  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === 'root'
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

      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
        }
      }
      // Handle buttons
      setFontColor(
        $getSelectionStyleValueForProperty(selection, 'color', '#000')
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          'background-color',
          '#fff'
        )
      );
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
          : parent?.getFormatType() || 'left'
      );
    }
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));
      setIsSubscript(selection.hasFormat('subscript'));
      setIsSuperscript(selection.hasFormat('superscript'));
      setIsCode(selection.hasFormat('code'));

      setFontSize(
        $getSelectionStyleValueForProperty(selection, 'font-size', '16px')
      );
      setLineHeight(
        $getSelectionStyleValueForProperty(selection, 'line-height')
      );
      setLetterSpacing(
        $getSelectionStyleValueForProperty(selection, 'letter-spacing', '0px')
      );
    }
  }, [activeEditor]);

  //- register editor
  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
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
        skipHistoryStack ? { tag: 'historic' } : {}
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

            if (textNode.__style !== '') {
              textNode.setStyle('');
            }
            if (textNode.__format !== 0) {
              textNode.setFormat(0);
              $getNearestBlockElementAncestorOrThrow(textNode).setFormat('');
            }
            // eslint-disable-next-line no-param-reassign
            node = textNode;
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat('');
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
      applyStyleText({ 'background-color': value }, skipHistoryStack);
    },
    [applyStyleText]
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl('https://')
      );
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, isLink, setIsLinkEditMode]);

  return (
    <div
      ref={toolbarRef}
      className="flex items-center flex-wrap rounded-t-lg p-1 gap-0.5 border-b border-t-0 border-x-0 border-gray-300 border-solid bg-white"
    >
      {/* Undo/Redo */}
      <ToolbarButton
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <IconUndo />
      </ToolbarButton>
      <ToolbarButton
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <IconRedo />
      </ToolbarButton>
      <Divider />

      {/* font size */}
      <DropDownFontSize selectionFontSize={fontSize} editor={activeEditor} />
      <DropDownLineHeight
        selectionLineHeight={lineHeight}
        editor={activeEditor}
      />
      <DropDownLetterSpacing
        selectionLetterSpacing={letterSpacing}
        editor={activeEditor}
      />
      <Divider />

      {/* font style */}
      <DropdownColorPicker
        color={fontColor}
        onChange={onFontColorSelect}
        icon={<IconFontColor />}
      />
      <DropdownColorPicker
        color={bgColor}
        onChange={onBgColorSelect}
        icon={<IconBackgound />}
      />
      <ToolbarButton active={isBold} onClick={() => formatText('bold')}>
        <IconTypeBold />
      </ToolbarButton>
      <ToolbarButton active={isItalic} onClick={() => formatText('italic')}>
        <IconTypeItalic />
      </ToolbarButton>
      <ToolbarButton
        active={isUnderline}
        onClick={() => formatText('underline')}
      >
        <IconTypeUnderline />
      </ToolbarButton>
      <ToolbarButton
        active={isStrikethrough}
        onClick={() => formatText('strikethrough')}
      >
        <IconTypeStrikethrough />
      </ToolbarButton>
      <ToolbarButton active={isCode} onClick={() => formatText('code')}>
        <IconCode />
      </ToolbarButton>
      <Divider />

      {/* script/subscript/superscript */}
      <ToolbarButton
        active={isSubscript}
        onClick={() => formatText('subscript')}
      >
        <IconTypeSubscript />
      </ToolbarButton>
      <ToolbarButton
        active={isSuperscript}
        onClick={() => formatText('superscript')}
      >
        <IconTypeSuperscript />
      </ToolbarButton>
      <ToolbarButton onClick={clearFormatting}>
        <IconTypeClear />
      </ToolbarButton>
      <DropdownEmoji editor={activeEditor} />

      <Divider />

      {/* alignment */}
      <DropDownAlignment value={elementFormat} editor={activeEditor} />
      <Divider />

      {/*  */}
      {blockType in blockTypeToBlockName && activeEditor === editor && (
        <>
          <BlockFormatDropDown blockType={blockType} editor={activeEditor} />
          <Divider />
        </>
      )}

      <ToolbarButton
        onClick={() => {
          showModal('插入图片', (onClose) => (
            <InsertImageDialog activeEditor={activeEditor} onClose={onClose} />
          ));
        }}
      >
        <IconFileImage />
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          showModal(`添加 YouTube 视频`, (onClose) => (
            <InsetYouTubeDialog activeEditor={activeEditor} onClose={onClose} />
          ));
        }}
      >
        <IconYoutube />
      </ToolbarButton>
      <ToolbarButton active={isLink} onClick={insertLink}>
        <IconLink />
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor.dispatchCommand(INSERT_HORIZONTAL_RULE_COMMAND, undefined)
        }
      >
        <IconHorizontalRule />
      </ToolbarButton>
      {modal}
    </div>
  );
};

export default ToolbarPlugin;
