

let stylesInjected = false;
let styleElement: HTMLStyleElement | null = null;


const PAGE_EXTENSION_CSS = `


.Page {
  background: white;
  min-height: 1056px; /* A4 height at 96 DPI */
  width: 816px;      /* A4 width at 96 DPI */
  padding: 96px;     /* 1-inch margins */
  margin: 0 auto 20px auto; /* Reduced bottom margin from default to 20px */
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
  position: relative;
  border-radius: 8px;
  transform: scale(0.9);
  transform-origin: top center;
}

/* Footer styling for better page number positioning */
.Page .footer {
  display: flex;
  align-items: flex-end; /* Align to bottom of footer */
  justify-content: center;
  padding-bottom: 8px; /* Add some bottom padding */
  font-size: 11pt;
  color: #666;
  font-family: 'Times New Roman', serif;
}

/* Header styling for page numbers at top */
.Page .header {
  display: flex;
  align-items: flex-start; /* Align to top of header */
  justify-content: center;
  padding-top: 8px; /* Add some top padding */
  font-size: 11pt;
  color: #666;
  font-family: 'Times New Roman', serif;
}

/* Reduce gap between page nodes created by PageExtension */
page {
  margin-bottom: 20px !important;
}

/* Target the actual Tiptap-rendered page elements */
div.react-renderer.node-page {
  height: 1000px;
}

/* Additional spacing control for page content */
.PageContent {
  line-height: 1.6;
  font-family: 'Times New Roman', serif;
  font-size: 12pt;
  color: #333;
}

.PageContent p {
  margin-top: 0;
  margin-bottom: 0;
}

.PageContent div > p,
.PageContent h1,
.PageContent h2,
.PageContent h3 {
  margin-top: 16px;
  margin-bottom: 16px;
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .Page {
    transform: scale(0.7);
  }
}

@media (max-width: 768px) {
  .Page {
    transform: scale(0.6);
  }
}
`;


export function injectPageExtensionStyles(): void {
  if (stylesInjected) {
    return;
  }

  try {

    styleElement = document.createElement('style');
    styleElement.id = 'page-extension-styles';
    styleElement.textContent = PAGE_EXTENSION_CSS;
    

    document.head.appendChild(styleElement);
    
    stylesInjected = true;

  } catch (error) {
    console.error('❌ Failed to inject PageExtension styles:', error);
  }
}


export function removePageExtensionStyles(): void {
  if (!stylesInjected || !styleElement) {
    return;
  }

  try {

    if (styleElement.parentNode) {
      styleElement.parentNode.removeChild(styleElement);
    }
    
    styleElement = null;
    stylesInjected = false;
    

  } catch (error) {
    console.error('❌ Failed to remove PageExtension styles:', error);
  }
}


export function areStylesInjected(): boolean {
  return stylesInjected;
}
