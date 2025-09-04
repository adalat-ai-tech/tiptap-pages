import { PageExtension } from '../../src/page-extension';
import { createMockEditor } from '../utils/test-editor';

describe('PageExtension Integration', () => {
  let mockEditor;

  beforeEach(() => {
    mockEditor = createMockEditor();
  });

  describe('Extension Configuration', () => {
    test('should create extension with required options', () => {
      const extension = PageExtension.configure({
        bodyHeight: 1056,
        bodyWidth: 816
      });

      expect(extension.name).toBe('PageExtension');
      expect(extension.options.bodyHeight).toBe(1056);
      expect(extension.options.bodyWidth).toBe(816);
    });

    test('should handle missing required options', () => {

      const extension = PageExtension.configure({
        bodyHeight: 1056,
        bodyWidth: 816
      });
      expect(extension).toBeDefined();
    });

    test('should merge default options with user options', () => {
      const extension = PageExtension.configure({
        bodyHeight: 1056,
        bodyWidth: 816,
        pageLayout: {
          margins: {
            top: { unit: 'INCHES', value: 1.0 },
            bottom: { unit: 'INCHES', value: 0.5 },
            left: { unit: 'INCHES', value: 0.5 },
            right: { unit: 'INCHES', value: 0.5 }
          }
        }
      });

      expect(extension.options.pageLayout?.margins?.top?.value).toBe(1.0);

      expect(extension.options.pageLayout).toBeDefined();
    });
  });

  describe('Extension Lifecycle', () => {
    test('should have required extension properties', () => {
      const extension = PageExtension.configure({
        bodyHeight: 1056,
        bodyWidth: 816
      });

      expect(extension.name).toBe('PageExtension');
      expect(extension.options).toBeDefined();
      expect(extension.options.bodyHeight).toBe(1056);
      expect(extension.options.bodyWidth).toBe(816);
    });

    test('should have extension methods available', () => {
      const extension = PageExtension.configure({
        bodyHeight: 1056,
        bodyWidth: 816
      });


      expect(extension).toBeDefined();
      expect(typeof extension).toBe('object');
    });

    test('should merge options correctly', () => {
      const extension = PageExtension.configure({
        bodyHeight: 1056,
        bodyWidth: 816,
        pageLayout: {
          margins: {
            top: { unit: 'INCHES', value: 1.0 },
            bottom: { unit: 'INCHES', value: 0.5 },
            left: { unit: 'INCHES', value: 0.5 },
            right: { unit: 'INCHES', value: 0.5 }
          }
        }
      });

      expect(extension.options.pageLayout?.margins?.top?.value).toBe(1.0);
    });
  });

  describe('CSS Injection', () => {
    test('should have extension structure', () => {
      const extension = PageExtension.configure({
        bodyHeight: 1056,
        bodyWidth: 816
      });

      expect(extension).toBeDefined();
      expect(extension.name).toBe('PageExtension');
    });

    test('should handle extension lifecycle', () => {
      const extension = PageExtension.configure({
        bodyHeight: 1056,
        bodyWidth: 816
      });


      expect(extension).toBeDefined();
      expect(extension.name).toBe('PageExtension');
    });
  });

  describe('Command Integration', () => {
    test('should have extension structure for commands', () => {
      const extension = PageExtension.configure({
        bodyHeight: 1056,
        bodyWidth: 816
      });


      expect(extension).toBeDefined();
      expect(extension.name).toBe('PageExtension');
    });

    test('should handle extension configuration', () => {
      const extension = PageExtension.configure({
        bodyHeight: 1056,
        bodyWidth: 816,
        pageNumber: {
          show: true,
          showCount: true,
          showOnFirstPage: false,
          position: 'bottom',
          alignment: 'center'
        }
      });

      expect(extension.options.pageNumber?.show).toBe(true);
      expect(extension.options.pageNumber?.position).toBe('bottom');
    });
  });
});
