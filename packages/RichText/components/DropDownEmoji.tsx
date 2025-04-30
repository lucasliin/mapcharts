import React, { useCallback, useEffect, useState } from "react";
import { $createTextNode, $getSelection, $isRangeSelection, LexicalEditor } from "lexical";

import { IconEmojiEmotions } from "../icons";

import DropDown from "./DropDown";

interface DropdownEmojiProps {
  disabled?: boolean;
  editor: LexicalEditor;
  type?: "button" | "dropdown" | "listitem";
}

interface Emoji {
  emoji: string;
  description: string;
  category: string;
  aliases: Array<string>;
  tags: Array<string>;
  unicode_version: string;
  ios_version: string;
  skin_tones?: boolean;
}

const DropdownEmoji: React.FC<DropdownEmojiProps> = (props) => {
  const { disabled, editor, type = "button", ...rest } = props;
  const [emojis, setEmojis] = useState<Array<Emoji>>([]);

  useEffect(() => {
    import("../utils/emoji-list").then((file) => setEmojis(file.default));
  }, []);

  const onSelectOption = useCallback(
    (selectedOption: Emoji) => {
      editor.update(() => {
        const selection = $getSelection();

        if (!$isRangeSelection(selection) || selectedOption == null) return;

        selection.insertNodes([$createTextNode(selectedOption.emoji)]);
      });
    },
    [editor]
  );

  return (
    <DropDown
      {...rest}
      type={type}
      disabled={disabled}
      buttonLabel={
        <div className="flex items-center justify-start w-full gap-1">
          <IconEmojiEmotions />
          {type === "button" ? null : "Emoji"}
        </div>
      }
    >
      <div className="lexicaltheme__dropdown__emoji_box">
        {emojis.map((option) => (
          <span
            key={option.aliases.join("")}
            onClick={() => onSelectOption(option)}
            className="lexicaltheme__dropdown__emoji_item"
          >
            {option.emoji}
          </span>
        ))}
      </div>
    </DropDown>
  );
};

export default DropdownEmoji;
