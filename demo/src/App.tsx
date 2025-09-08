import { useEditor, EditorContent } from "@tiptap/react";
import { Paragraph } from "@tiptap/extension-paragraph";
import { Text } from "@tiptap/extension-text";
import { Bold } from "@tiptap/extension-bold";
import { Italic } from "@tiptap/extension-italic";
import { Underline } from "@tiptap/extension-underline";
import { Heading } from "@tiptap/extension-heading";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import { HardBreak } from "@tiptap/extension-hard-break";
import { History } from "@tiptap/extension-history";
import {   PageDocument, PageExtension, UnitConversion } from "@adalat-ai/page-extension";


import prettier from "prettier/standalone";
import Prism from "prismjs";

import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-markup";
import { useEffect, useState } from "react";

const unitConversion = new UnitConversion();
const pageHeight = unitConversion.mmConversionPx(290);
const pageWidth = unitConversion.mmConversionPx(210);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MenuBar = ({ editor }: { editor: any | null }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="toolbar">
      {/* Text formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`toolbar-button ${editor.isActive("bold") ? "active" : ""}`}
        title="Bold"
      >
        Bold
      </button>

      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`toolbar-button ${editor.isActive("italic") ? "active" : ""}`}
        title="Italic"
      >
        Italic
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`toolbar-button ${editor.isActive("underline") ? "active" : ""}`}
        title="Underline"
      >
        Underline
      </button>

      <button
        onClick={() => editor.chain().focus().setNode("paragraph").run()}
        className={`toolbar-button ${editor.isActive("paragraph") ? "active" : ""}`}
        title="Paragraph"
      >
        Paragraph
      </button>

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`toolbar-button ${editor.isActive("heading", { level: 1 }) ? "active" : ""}`}
        title="Heading 1"
      >
        H1
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`toolbar-button ${editor.isActive("heading", { level: 2 }) ? "active" : ""}`}
        title="Heading 2"
      >
        H2
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`toolbar-button ${editor.isActive("heading", { level: 3 }) ? "active" : ""}`}
        title="Heading 3"
      >
        H3
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={`toolbar-button ${editor.isActive("heading", { level: 4 }) ? "active" : ""}`}
        title="Heading 4"
      >
        H4
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={`toolbar-button ${editor.isActive("heading", { level: 5 }) ? "active" : ""}`}
        title="Heading 5"
      >
        H5
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={`toolbar-button ${editor.isActive("heading", { level: 6 }) ? "active" : ""}`}
        title="Heading 6"
      >
        H6
      </button>

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-button ${editor.isActive("bulletList") ? "active" : ""}`}
        title="Bullet List"
      >
        Bullet list
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-button ${editor.isActive("orderedList") ? "active" : ""}`}
        title="Numbered List"
      >
        Ordered list
      </button>

      <button
        onClick={() => editor.chain().focus().setHardBreak().run()}
        className="toolbar-button"
        title="Hard Break"
      >
        Hard break
      </button>

      {/* History */}
      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="toolbar-button"
        title="Undo"
      >
        Undo
      </button>

      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="toolbar-button"
        title="Redo"
      >
        Redo
      </button>
    </div>
  );
};

function App() {
  const editor = useEditor({
    extensions: [
      PageDocument,
      Paragraph,
      Text,
      Bold,
      Italic,
      Underline,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      BulletList,
      OrderedList,
      ListItem,
      HardBreak,
      History,
      PageExtension.configure({
        bodyHeight: pageHeight,
        bodyWidth: pageWidth,
        pageLayout: {
          margins: {
            top: { unit: "INCHES", value: 0.75 },
            bottom: { unit: "INCHES", value: 0.75 },
            left: { unit: "INCHES", value: 0.5 },
            right: { unit: "INCHES", value: 0.5 },
          },
          paragraphSpacing: {
            before: { unit: "PTS", value: 6 },
            after: { unit: "PTS", value: 6 },
          },
        },
        pageNumber: {
          show: true,
          showCount: true,
          showOnFirstPage: false,
          position: "bottom",
          alignment: "center",
        },
        footerHeight: 80,
      }),
    ],
    content: `
      <h2>Hi there,</h2>
      <p>This is a <em>basic</em> example of <strong>Tiptap</strong>.</p>
      <ul>
        <li>Bullet item one</li>
        <li>Bullet item two</li>
      </ul>
    `,
    editorProps: {
      attributes: { class: "focus:outline-none", spellcheck: "true" },
    },
  });

  const [formatted, setFormatted] = useState("");

  useEffect(() => {
    if (!editor) return;

    const formatHtml = async () => {
      const html = editor.getHTML();
      const parserHtml = await import("prettier/plugins/html");

      const result = await prettier.format(html, {
        parser: "html",
        plugins: [parserHtml],
      });

      setFormatted(result);
    };

    formatHtml();
  }, [editor, editor?.state]);

  return (
    <div className="editor-container">
      <div className="editor-header">
        <h1>✨ Tiptap Editor</h1>
        <p>Professional Document Editor</p>
      </div>

      <MenuBar editor={editor} />

      <div className="state-container">
        <div className="code-container">
          <pre>
            <code
              className="language-html"
              dangerouslySetInnerHTML={{
                __html: Prism.highlight(
                  formatted,
                  Prism.languages.html,
                  "html"
                ),
              }}
            ></code>
          </pre>
        </div>

        <div className="editor-content">
          <EditorContent editor={editor} className="focus:outline-none" />
        </div>
      </div>
    </div>
  );
}

export default App;
