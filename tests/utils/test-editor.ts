import { Editor } from '@tiptap/core';
import { PageExtension } from '../../src/page-extension';
import { Document as PageDocument } from '../../src/Document';


export function createMockEditor() {
  const mockEditor = {
    view: {
      dispatch: jest.fn(),
      domAtPos: jest.fn(() => ({ node: document.createElement('div'), offset: 0 }))
    },
    state: {
      tr: {
        setMeta: jest.fn(),
        doc: {
          content: {
            childCount: 1,
            firstChild: {
              content: { size: 10 }
            }
          }
        }
      },
      selection: {
        $head: {
          node: jest.fn(() => ({ type: { name: 'paragraph' } }))
        }
      }
    },
    $nodes: jest.fn(() => '1,2,3'),
    commands: {
      first: jest.fn(() => [])
    }
  } as unknown as Editor;

  return mockEditor;
}


export function createTestEditor(options = {}) {
  const defaultOptions = {
    bodyHeight: 1056,
    bodyWidth: 816,
    ...options
  };

  const editor = new Editor({
    extensions: [
      PageDocument,
      PageExtension.configure(defaultOptions)
    ],
    content: '<p>Test content</p>'
  });

  return editor;
}


export function createMockDOMElement(tagName = 'div', className = '') {
  const element = document.createElement(tagName);
  element.className = className;
  (element as any).getBoundingClientRect = jest.fn(() => ({
    width: 800,
    height: 100,
    top: 0,
    left: 0,
    bottom: 100,
    right: 800,
    x: 0,
    y: 0,
    toJSON: jest.fn()
  }));
  (element as any).offsetWidth = 800;
  (element as any).offsetHeight = 100;
  (element as any).scrollHeight = 100;
  element.innerHTML = '<p>Test content</p>';
  
  return element;
}


export function createMockPageNode(pageNumber = 1) {
  return {
    attrs: {
      id: 'page-123',
      pageNumber
    },
    type: {
      name: 'page'
    }
  };
}
