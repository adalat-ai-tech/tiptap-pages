import { useEditor, EditorContent, Editor } from '@tiptap/react'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Bold } from '@tiptap/extension-bold'
import { Italic } from '@tiptap/extension-italic'
import { Underline } from '@tiptap/extension-underline'
import { Heading } from '@tiptap/extension-heading'
import { BulletList } from '@tiptap/extension-bullet-list'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { ListItem } from '@tiptap/extension-list-item'
import { HardBreak } from '@tiptap/extension-hard-break'
import { History } from '@tiptap/extension-history'
import { UnitConversion } from './extensions/page/core'
import { Document } from './extensions/Document'
import { PageExtension } from './extensions/page/page-extension'



const unitConversion = new UnitConversion();
const pageHeight = unitConversion.mmConversionPx(290);
const pageWidth = unitConversion.mmConversionPx(210);

const MenuBar = ({ editor }: { editor: Editor | null }) => {
  if (!editor) {
    return null
  }

  return (
    <div className="toolbar">
      {/* Text formatting */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
        title="Bold"
      >
        Bold
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
        title="Italic"
      >
        Italic
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        disabled={!editor.can().chain().focus().toggleUnderline().run()}
        className={`toolbar-button ${editor.isActive('underline') ? 'active' : ''}`}
        title="Underline"
      >
        Underline
      </button>

      <button
        onClick={() => editor.chain().focus().setNode('paragraph').run()}
        className={`toolbar-button ${editor.isActive('paragraph') ? 'active' : ''}`}
        title="Paragraph"
      >
        Paragraph
      </button>

      {/* Headings */}
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`toolbar-button ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
        title="Heading 1"
      >
        H1
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`toolbar-button ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
        title="Heading 2"
      >
        H2
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`toolbar-button ${editor.isActive('heading', { level: 3 }) ? 'active' : ''}`}
        title="Heading 3"
      >
        H3
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}
        className={`toolbar-button ${editor.isActive('heading', { level: 4 }) ? 'active' : ''}`}
        title="Heading 4"
      >
        H4
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 5 }).run()}
        className={`toolbar-button ${editor.isActive('heading', { level: 5 }) ? 'active' : ''}`}
        title="Heading 5"
      >
        H5
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 6 }).run()}
        className={`toolbar-button ${editor.isActive('heading', { level: 6 }) ? 'active' : ''}`}
        title="Heading 6"
      >
        H6
      </button>

      {/* Lists */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
        title="Bullet List"
      >
        Bullet list
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
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
  )
}

function App() {
  const editor = useEditor({
    extensions: [
      Document, // Using custom Document that requires PAGE nodes
      Paragraph, Text, Bold, Italic, Underline,
      Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
      BulletList, OrderedList, ListItem, HardBreak, History,
      PageExtension.configure({
        // Only required dimensions - everything else uses defaults!
        bodyHeight: pageHeight,
        bodyWidth: pageWidth,
        
        // Optional: Override defaults if needed
        pageLayout: {
          margins: {
            top: { unit: 'INCHES', value: 0.75 }, // Override default 0.5
            bottom: { unit: 'INCHES', value: 0.75 }, // Override default 0.5
            left: { unit: 'INCHES', value: 0.5 },   // Use default
            right: { unit: 'INCHES', value: 0.5 }   // Use default
          },
          paragraphSpacing: {
            before: { unit: 'PTS', value: 6 },
            after: { unit: 'PTS', value: 6 }
          }
        },
        
        // Optional: Enable page numbering
        pageNumber: {
          show: true,
          showCount: true,
          showOnFirstPage: false,
          position: 'bottom',
          alignment: 'center'
        },
        
        // Increase footer height to move page number lower
        footerHeight: 80
      })
    ],
    content: `
      <h2>Hi there,</h2>
      <p>this is a <em>basic</em> example of <strong>Tiptap</strong>. Sure, there are all kind of basic text styles you'd probably expect from a text editor. But wait until you see the lists:</p>
      <ul>
        <li>That's a bullet list with one ...</li>
        <li>... or two list items.</li>
      </ul>
      <p>Isn't that great? And all of that is editable. But wait, there's more. Let's try a code block:</p>
      <pre><code>body {
display: none;
}</code></pre>
    `,
    editorProps: { attributes: { class: 'focus:outline-none', spellcheck: 'true' } },
  })



  return (
    <div className="editor-container">
      <div className="editor-header">
        <h1>✨ Tiptap Editor</h1>
        <p>Professional Document Editor</p>
      </div>
      <MenuBar editor={editor} />
      <div className="editor-content">
        {/* PageExtension now automatically creates the <page> and .Page/.PageContent structure */}
        <EditorContent
          editor={editor}
          className="focus:outline-none"
        />
      </div>
    </div>
  )
}
export default App
