# 📄 PageExtension for Tiptap

A fully isolated Tiptap extension that provides automatic page management, pagination, and professional document styling. This extension automatically wraps your content in pages and handles all the complex pagination logic with advanced features like copy-paste functionality, cross-page operations, and comprehensive error handling.

## ✨ Features

- **🔄 Automatic Page Creation**: Content is automatically wrapped in `<page>` nodes
- **📊 Smart Pagination**: Automatically splits content across pages when it overflows
- **🎨 Professional Styling**: A4 dimensions, proper margins, and shadows
- **🔢 Page Numbering**: Configurable page numbers with positioning options
- **🔒 Fully Isolated**: No external dependencies on app-level stores or CSS
- **📝 TypeScript Support**: Full type definitions included
- **💉 CSS Auto-Injection**: Styles are automatically applied when the extension is added
- **📋 Advanced Copy-Paste**: Comprehensive copy-paste functionality across pages
- **🌍 International Support**: Multi-language and Unicode character support
- **⚡ Performance Optimized**: Efficient pagination algorithms and memory management

## 🚀 Installation

```bash
npm install @adalat-ai/page-extension
# or
yarn add @adalat-ai/page-extension
# or
pnpm add @adalat-ai/page-extension
```

## 📖 Basic Usage

```typescript
import { useEditor } from '@tiptap/react';
import { PageExtension, PageDocument } from '@adalat-ai/page-extension';
import { 
  Paragraph, 
  Text, 
  Bold, 
  Italic, 
  Underline,
  Heading, 
  BulletList, 
  OrderedList, 
  ListItem 
} from '@tiptap/starter-kit';

const editor = useEditor({
  extensions: [
    PageDocument, // Required: Enforces PAGE node structure
    PageExtension.configure({
      // Required: Page dimensions
      bodyHeight: 1123, // A4 height at 96 DPI (29.7cm = 11.69in × 96 DPI)
      bodyWidth: 794,   // A4 width at 96 DPI (21.0cm = 8.27in × 96 DPI)
      
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

## ⚙️ API Reference

### Core Extensions

#### `PageExtension`

The main extension that handles pagination logic, configuration, and lifecycle management.

**Configuration Options:**

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `bodyHeight` | `number` | ✅ | - | Height of each page in pixels |
| `bodyWidth` | `number` | ✅ | - | Width of each page in pixels |
| `bodyPadding` | `number` | ❌ | `0` | Internal padding for page content |
| `headerHeight` | `number` | ❌ | `30` | Height of page header area |
| `footerHeight` | `number` | ❌ | `30` | Height of page footer area |
| `pageLayout` | `PageLayoutConfig` | ❌ | See below | Page layout configuration |
| `pageNumber` | `PageNumberConfig` | ❌ | See below | Page numbering configuration |
| `types` | `never[]` | ❌ | `[]` | Additional node types to support |
| `headerData` | `unknown[]` | ❌ | `[]` | Custom header data |
| `footerData` | `unknown[]` | ❌ | `[]` | Custom footer data |

**Commands:**

```typescript
// Recompute pagination after configuration changes
editor.commands.recomputeComputedHtml();
```

#### `PageDocument`

Document extension that enforces the PAGE node structure. Must be included in your extensions array.

```typescript
import { PageDocument } from '@adalat-ai/page-extension';

// Add to your extensions array
extensions: [
  PageDocument, // Required
  PageExtension.configure({...}),
  // ... other extensions
]
```

### Configuration Types

#### `PageLayoutConfig`

Controls page margins and paragraph spacing.

```typescript
interface PageLayoutConfig {
  margins?: PageMargins;
  paragraphSpacing?: ParagraphSpacingConfig;
}
```

**Example:**
```typescript
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
```

#### `PageMargins`

Defines page margins with unit support.

```typescript
interface PageMargins {
  top: MarginConfig;
  bottom: MarginConfig;
  left: MarginConfig;
  right: MarginConfig;
}

interface MarginConfig {
  unit: 'CM' | 'INCHES';
  value: number;
}
```

**Supported Units:**
- `'CM'`: Centimeters
- `'INCHES'`: Inches

#### `ParagraphSpacingConfig`

Controls spacing between paragraphs.

```typescript
interface ParagraphSpacingConfig {
  before: {
    unit: 'PTS';
    value: number;
  };
  after: {
    unit: 'PTS';
    value: number;
  };
}
```

**Supported Units:**
- `'PTS'`: Points (1 point = 1/72 inch)

#### `PageNumberConfig`

Configures page numbering display and positioning.

```typescript
interface PageNumberConfig {
  show: boolean;                    // Enable/disable page numbers
  showCount: boolean;              // Show total page count (e.g., "1 of 5")
  showOnFirstPage: boolean;        // Show page number on first page
  position: 'top' | 'bottom' | null;  // Vertical position
  alignment: 'left' | 'center' | 'right' | null;  // Horizontal alignment
}
```

**Example:**
```typescript
pageNumber: {
  show: true,
  showCount: true,
  showOnFirstPage: false,
  position: 'bottom',
  alignment: 'center'
}
```

### Utility Classes

#### `UnitConversion`

Utility class for converting between different measurement units.

```typescript
import { UnitConversion } from '@adalat-ai/page-extension';

const converter = new UnitConversion();

// Convert pixels to millimeters
const mm = converter.pxConversionMm(96); // 25mm

// Convert millimeters to pixels
const px = converter.mmConversionPx(25); // 96px

// Convert points to pixels
const ptToPx = converter.ptConversionPx(12); // 16px

// Convert pixels to points
const pxToPt = converter.pxConversionPt(16); // 12pt
```

**Methods:**
- `pxConversionMm(value: number): number` - Convert pixels to millimeters
- `mmConversionPx(value: number): number` - Convert millimeters to pixels
- `ptConversionPx(value: number): number` - Convert points to pixels
- `pxConversionPt(value: number): number` - Convert pixels to points

## 🎨 Styling

The extension automatically injects all necessary CSS styles. Your content will automatically have:

- **📏 A4 page dimensions** with proper scaling
- **🎭 Professional shadows and borders**
- **📐 Proper margins and spacing**
- **📱 Responsive design** for different screen sizes
- **✍️ Typography optimized** for documents

### Custom Styling

You can override default styles by targeting the generated CSS classes:

```css
/* Custom page styling */
.Page {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
}

/* Custom page content styling */
.PageContent {
  padding: 20px;
  line-height: 1.6;
}

/* Custom page number styling */
.PageNumber {
  font-size: 12px;
  color: #666;
}
```

## 🔧 Advanced Usage

### Custom Page Layouts

```typescript
PageExtension.configure({
  bodyHeight: 1123,
  bodyWidth: 794,
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
  bodyHeight: 1123,
  bodyWidth: 794,
  pageNumber: {
    show: true,
    showCount: true,
    showOnFirstPage: false,
    position: 'bottom',
    alignment: 'center'
  }
})
```

### Dynamic Configuration Updates

```typescript
// Update configuration and recompute pagination
editor.commands.recomputeComputedHtml();

// Or update options directly
editor.extensionManager.extensions.find(ext => ext.name === 'PageExtension')
  ?.options = {
    ...editor.extensionManager.extensions.find(ext => ext.name === 'PageExtension')?.options,
    pageNumber: {
      show: true,
      showCount: true,
      showOnFirstPage: true,
      position: 'top',
      alignment: 'right'
    }
  };

// Recompute after changes
editor.commands.recomputeComputedHtml();
```

### Custom Node Types

```typescript
PageExtension.configure({
  bodyHeight: 1123,
  bodyWidth: 794,
  types: ['customBlock', 'customNode'] // Add your custom node types
})
```

## 🏗️ Architecture

This extension is completely isolated and consists of:

- **📦 PageExtension**: Main extension that handles configuration and lifecycle
- **📄 PageDocument**: Document extension that enforces PAGE node structure
- **🔧 Page Node**: Custom node for rendering individual pages
- **⚙️ Page Plugin**: ProseMirror plugin for pagination logic
- **💉 CSS Injector**: Automatic style injection and cleanup
- **🧮 Core Utilities**: Pagination algorithms and calculations
- **🔄 Copy-Paste Handler**: Advanced clipboard operations
- **🌍 International Support**: Multi-language and Unicode handling

### Key Components

#### Pagination Engine
- **Smart Content Splitting**: Automatically breaks content across pages
- **Height Calculation**: Precise measurement of content dimensions
- **Overflow Detection**: Identifies when content exceeds page boundaries
- **Binary Search Algorithm**: Efficient text breaking for optimal pagination

#### Copy-Paste System
- **Cross-Page Operations**: Seamless content transfer between pages
- **Format Preservation**: Maintains formatting during copy-paste operations
- **PageContent Validation**: Ensures content is properly placed within page structure
- **International Support**: Handles Unicode, emojis, and multi-language content

#### Performance Optimizations
- **Caching System**: Reduces redundant calculations
- **Lazy Loading**: Efficient memory management
- **Debounced Updates**: Prevents excessive re-computations
- **Virtual DOM**: Optimized rendering for large documents

## 📱 Browser Support

- **Modern browsers** with ES2020 support
- **React 18+**
- **Tiptap 2.x**
- **Chrome 90+**
- **Firefox 88+**
- **Safari 14+**
- **Edge 90+**

## 🧪 Testing

The package includes comprehensive test coverage:

### Test Categories

#### **Unit Tests (69 tests)**
- **Integration Tests**: CSS injector, document, page component, page extension
- **Unit Tests**: Core utilities, types, unit conversion

#### **Playwright E2E Tests (112 tests)**
- **Basic Pagination Tests**: Page structure, multi-page content, formatting, lists, headings
- **Focused Tests**: Specific page creation scenarios
- **Cross-Browser Tests**: Browser compatibility, viewport sizes, input methods
- **Edge Cases**: Empty documents, special characters, rapid operations
- **Error Handling**: Graceful error recovery scenarios
- **Performance Tests**: Large documents, memory management
- **Copy-Paste Tests**: 38 comprehensive copy-paste functionality tests

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run E2E tests only
npm run test:e2e

# Run specific test file
npm test pagination-copy-paste
```

## 🤝 Contributing

Contributions are welcome! Please ensure all functionality remains isolated and doesn't introduce external dependencies.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-username/page-extension.git

# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build
```

### Code Style

- **TypeScript**: Full type safety
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Jest**: Unit testing
- **Playwright**: E2E testing

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- [Tiptap Documentation](https://tiptap.dev/)
- [ProseMirror Documentation](https://prosemirror.net/)
- [Package Repository](https://github.com/your-username/page-extension)
- [NPM Package](https://www.npmjs.com/package/@adalat-ai/page-extension)

## 🆘 Troubleshooting

### Common Issues

#### Page dimensions not working
```typescript
// Ensure you provide valid numeric values
PageExtension.configure({
  bodyHeight: 1123, // Must be a positive number (A4 height at 96 DPI)
  bodyWidth: 794,   // Must be a positive number (A4 width at 96 DPI)
})
```

#### Page numbers not showing
```typescript
// Check your page number configuration
pageNumber: {
  show: true,        // Must be true
  position: 'bottom', // Must be 'top' or 'bottom'
  alignment: 'center' // Must be 'left', 'center', or 'right'
}
```

#### Content not paginating
```typescript
// Ensure PageDocument is included
extensions: [
  PageDocument, // Required
  PageExtension.configure({...}),
  // ... other extensions
]
```

#### Styling issues
```typescript
// The extension auto-injects styles, but you can override them
// Check browser console for any CSS conflicts
```

### Performance Tips

1. **Use appropriate page dimensions** for your content
2. **Limit paragraph spacing** for better performance
3. **Avoid extremely large documents** without pagination
4. **Use the recompute command** sparingly
5. **Monitor memory usage** with large documents

### Getting Help

- **GitHub Issues**: Report bugs and request features
- **Documentation**: Check the API reference above
- **Examples**: See the demo folder for usage examples
- **Tests**: Check test files for implementation examples