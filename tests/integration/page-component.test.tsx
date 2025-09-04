import React from 'react';
import { render, screen } from '@testing-library/react';
import { PageComponent } from '../../src/page-component';
import { createMockPageNode } from '../utils/test-editor';

jest.mock('@tiptap/react', () => ({
  NodeViewWrapper: ({ children, className, style, id }: any) => (
    <div className={className} style={style} id={id} data-testid="page-wrapper">
      {children}
    </div>
  ),
  NodeViewContent: ({ className, style }: any) => (
    <div className={className} style={style} data-testid="page-content">
      Page Content
    </div>
  )
}));


jest.mock('../../src/page-component/events', () => ({
  emitter: {
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn()
  }
}));

describe('PageComponent Integration', () => {
  const mockEditor = {
    $nodes: jest.fn(() => '1,2,3')
  };

  const mockExtension = {
    options: {
      bodyHeight: 1056,
      bodyWidth: 816,
      headerHeight: 30,
      footerHeight: 80,
      pageLayout: {
        margins: {
          top: { value: 0.75 },
          bottom: { value: 0.75 },
          left: { value: 0.5 },
          right: { value: 0.5 }
        }
      },
      pageNumber: {
        show: true,
        showCount: true,
        showOnFirstPage: false,
        position: 'bottom',
        alignment: 'center'
      }
    }
  };

  const mockNode = createMockPageNode(1);

  const defaultProps = {
    editor: mockEditor,
    node: mockNode,
    extension: mockExtension,
    decorations: [],
    selected: false,
    updateAttributes: jest.fn(),
    deleteNode: jest.fn(),
    getPos: jest.fn(() => 0),
    view: mockEditor,
    getNode: jest.fn(() => mockNode),
    innerDecorations: [],
    HTMLAttributes: {}
  };

  test('should render page wrapper', () => {
    render(<PageComponent {...(defaultProps as any)} />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).not.toBeNull();
    expect(pageWrapper.className).toContain('Page');
  });

  test('should render page content area', () => {
    render(<PageComponent {...(defaultProps as any)} />);
    
    const pageContent = screen.getByTestId('page-content');
    expect(pageContent).not.toBeNull();
    expect(pageContent.className).toContain('PageContent');
  });

  test('should render page component with page number configuration', () => {
    render(<PageComponent {...(defaultProps as any)} />);
    

    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).not.toBeNull();
  });

  test('should handle different page number configurations', () => {
    const props = {
      ...defaultProps,
      extension: {
        ...mockExtension,
        options: {
          ...mockExtension.options,
          pageNumber: {
            ...mockExtension.options.pageNumber,
            showOnFirstPage: false
          }
        }
      }
    };

    render(<PageComponent {...(props as any)} />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).not.toBeNull();
  });

  test('should render with showOnFirstPage enabled', () => {
    const props = {
      ...defaultProps,
      extension: {
        ...mockExtension,
        options: {
          ...mockExtension.options,
          pageNumber: {
            ...mockExtension.options.pageNumber,
            showOnFirstPage: true
          }
        }
      }
    };

    render(<PageComponent {...(props as any)} />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).not.toBeNull();
  });

  test('should render with page number position top', () => {
    const props = {
      ...defaultProps,
      extension: {
        ...mockExtension,
        options: {
          ...mockExtension.options,
          pageNumber: {
            ...mockExtension.options.pageNumber,
            position: 'top'
          }
        }
      }
    };

    render(<PageComponent {...(props as any)} />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).not.toBeNull();
  });

  test('should render with pageLayout configuration', () => {
    render(<PageComponent {...(defaultProps as any)} />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).not.toBeNull();
  });

  test('should handle missing pageLayout gracefully', () => {
    const props = {
      ...defaultProps,
      extension: {
        ...mockExtension,
        options: {
          ...mockExtension.options,
          pageLayout: undefined
        }
      }
    };

    render(<PageComponent {...(props as any)} />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).not.toBeNull();
  });
});
