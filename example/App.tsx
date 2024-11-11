import React from "react";
import LexicalRichTextEditor from "../packages";

const App: React.FC = () => {
  return (
    <div className="h-screen p-10">
      <div className="">
        <LexicalRichTextEditor
          onChange={(value) => console.log(value)}
          defaultValue={"<p>Hello World</p>"}
          max={{ len: 2 }}
        />
      </div>
    </div>
  );
};

export default App;
