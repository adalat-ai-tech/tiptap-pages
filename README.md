# PageExtension for Tiptap

A fully isolated Tiptap extension that provides automatic page management, pagination, and professional document styling. This extension automatically wraps your content in pages and handles all the complex pagination logic.

## ✨ Features

- **Automatic Page Creation**: Content is automatically wrapped in `<page>` nodes
- **Smart Pagination**: Automatically splits content across pages when it overflows
- **Professional Styling**: A4 dimensions, proper margins, and shadows
- **Page Numbering**: Configurable page numbers with positioning options
- **Fully Isolated**: No external dependencies on app-level stores or CSS
- **TypeScript Support**: Full type definitions included
- **CSS Auto-Injection**: Styles are automatically applied when the extension is added

## 🚀 Installation

```bash
npm install @your-username/page-extension
```

## 📖 Basic Usage

```typescript
import { useEditor } from '@tiptap/react';
import { PageExtension, PageDocument } from '@your-username/page-extension';

const editor = useEditor({
  extensions: [
    PageDocument, // Required: Enforces PAGE node structure
    PageExtension.configure({
      // Required: Page dimensions
      bodyHeight: 1056, // A4 height at 96 DPI
      bodyWidth: 816,   // A4 width at 96 DPI
      
      // Optional: Page layout settings
      pageLayout: {
        margins: {
          top: { unit: 'INCHES', value: 0.75 },
          bottom: { unit: 'INCHES', value: 0.75 },
          left: { unit: 'INCHES', value: 0.5 },
          right: { unit: 'INCHES', value: 0.5 }
        },
        paragraphSpacing: {
          before: { unit: 'PTS', value: 6 },
          after: { unit: 'PTS', value: 6 }
        }
      },
      
      // Optional: Page numbering
      pageNumber: {
        show: true,
        showCount: true,
        showOnFirstPage: false,
        position: 'bottom',
        alignment: 'center'
      },
      
      // Optional: Header/Footer heights
      headerHeight: 30,
      footerHeight: 80
    }),
    
    // Your other Tiptap extensions...
    Paragraph, Text, Bold, Italic, Underline,
    Heading, BulletList, OrderedList, ListItem
  ],
  content: `
    <h2>Your content here</h2>
    <p>This will automatically be wrapped in pages...</p>
  `
});
```

## ⚙️ Configuration Options

### Required Options

| Option | Type | Description | Example |
|--------|------|-------------|---------|
| `bodyHeight` | `number` | Height of each page in pixels | `1056` (A4 height) |
| `bodyWidth` | `number` | Width of each page in pixels | `816` (A4 width) |

### Optional Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pageLayout.margins` | `PageMargins` | `0.5 inches all sides` | Page margins configuration |
| `pageLayout.paragraphSpacing` | `ParagraphSpacingConfig` | `6pt before/after` | Spacing between paragraphs |
| `pageNumber.show` | `boolean` | `false` | Enable page numbering |
| `pageNumber.position` | `'top' \| 'bottom'` | `null` | Page number position |
| `pageNumber.alignment` | `'left' \| 'center' \| 'right'` | `null` | Page number alignment |
| `headerHeight` | `number` | `30` | Height of page header area |
| `footerHeight` | `number` | `30` | Height of page footer area |

## 🎨 Styling

The extension automatically injects all necessary CSS styles. Your content will automatically have:

- A4 page dimensions with proper scaling
- Professional shadows and borders
- Proper margins and spacing
- Responsive design for different screen sizes
- Typography optimized for documents

## 🔧 Advanced Usage

### Custom Page Layouts

```typescript
PageExtension.configure({
  bodyHeight: 1056,
  bodyWidth: 816,
  pageLayout: {
    margins: {
      top: { unit: 'INCHES', value: 1.0 },
      bottom: { unit: 'INCHES', value: 1.0 },
      left: { unit: 'INCHES', value: 0.75 },
      right: { unit: 'INCHES', value: 0.75 }
    },
    paragraphSpacing: {
      before: { unit: 'PTS', value: 12 },
      after: { unit: 'PTS', value: 12 }
    }
  }
})
```

### Page Numbering Options

```typescript
PageExtension.configure({
  bodyHeight: 1056,
  bodyWidth: 816,
  pageNumber: {
    show: true,
    showCount: true,
    showOnFirstPage: false,
    position: 'bottom',
    alignment: 'center'
  }
})
```

## 🏗️ Architecture

This extension is completely isolated and consists of:

- **PageExtension**: Main extension that handles configuration and lifecycle
- **PageDocument**: Document extension that enforces PAGE node structure
- **Page Node**: Custom node for rendering individual pages
- **Page Plugin**: ProseMirror plugin for pagination logic
- **CSS Injector**: Automatic style injection and cleanup
- **Core Utilities**: Pagination algorithms and calculations

## 📱 Browser Support

- Modern browsers with ES2020 support
- React 18+
- Tiptap 2.x

## 🤝 Contributing

Contributions are welcome! Please ensure all functionality remains isolated and doesn't introduce external dependencies.

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [Tiptap Documentation](https://tiptap.dev/)
- [ProseMirror Documentation](https://prosemirror.net/)
- [Package Repository](https://github.com/your-username/page-extension)
