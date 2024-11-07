import React from "react";
import LexicalRichTextEditor from "../packages";

const App: React.FC = () => {
  return (
    <div className="content-center h-screen p-10">
      <div className="">
        <LexicalRichTextEditor
          onChange={(value) => console.log(value)}
          defaultValue={`<p class="CommentEditorTheme__paragraph" dir="ltr"><span style="white-space: pre-wrap;">ha'ha</span></p>`}
        />
      </div>
    </div>
  );
};

export default App;
