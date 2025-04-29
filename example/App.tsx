import React, { useState } from "react";
import LexicalRichTextEditor from "../packages";
import "../packages/RichText/themes/EditorTableTheme.css";

const App: React.FC = () => {
  const [value, setValue] = useState("");

  return (
    <div style={{ height: "2000px" }}>
      <div style={{ padding: "40px" }}>
        <LexicalRichTextEditor
          preview
          onChange={(value) => {
            console.log(value);
            setValue(value);
          }}
          // defaultValue={`<p class="CommentEditorTheme__paragraph"><a href="tel:123" target="" rel="noreferrer" class="lexicaltheme__link"><b><strong class="lexicaltheme__textBold" style="color: rgb(126, 211, 33); white-space: pre-wrap;">商品描述</strong></b></a><b><strong class="lexicaltheme__textBold" style="color: rgb(126, 211, 33); white-space: pre-wrap;"> </strong></b></p><p class="CommentEditorTheme__paragraph"><b><strong class="lexicaltheme__textBold" style="color: rgb(126, 211, 33); white-space: pre-wrap;">324</strong></b></p>`}
          // defaultValue={`<a>123</a>\n<img src="" />`}
          // defaultValue={`<ul class="lexicaltheme__ul"><li value="1" class="lexicaltheme__listItem"><span style="white-space: pre-wrap;">200W Solar Power: Harness the solar energy to charge your solar generators.</span></li><li value="2" class="lexicaltheme__listItem"><span style="white-space: pre-wrap;">♻️ </span><a href="https://bluettipower.com" target="_blank" rel="noreferrer" class="lexicaltheme__link"><span style="white-space: pre-wrap;">bluettipower</span></a><span style="white-space: pre-wrap;"> good</span></li></ul><p class="CommentEditorTheme__paragraph" dir="ltr"><br></p>`}
          // defaultValue={`<p class="CommentEditorTheme__paragraph"><img src="https://cdn.shopify.com/s/files/1/0728/3825/0805/files/bluetti-black-friday-002.png?v=1730977833" alt="" width="inherit" height="inherit"></p>`}
          // defaultValue={`<table class="lexicaltheme__table"><colgroup><col style="width: 92px;"></colgroup><tbody><tr><td class="lexicaltheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="CommentEditorTheme__paragraph" style="text-align: start;"><br></p></td></tr><tr><td class="lexicaltheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="CommentEditorTheme__paragraph" style="text-align: start;"><br></p></td></tr><tr><td class="lexicaltheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="CommentEditorTheme__paragraph" style="text-align: start;"><br></p></td></tr><tr><td class="lexicaltheme__tableCell" style="width: 75px; border: 1px solid black; vertical-align: top; text-align: start;"><p class="CommentEditorTheme__paragraph" style="text-align: start;"><br></p></td></tr></tbody></table><p class="CommentEditorTheme__paragraph"><a href="https://baidu.com" rel="noreferrer" class="lexicaltheme__link"><span style="white-space: pre-wrap;">123</span></a></p>`}
        />
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: value,
        }}
        // className="prose prose-ol:!list-disc prose-ul:!list-disc"
      ></div>
    </div>
  );
};

export default App;
