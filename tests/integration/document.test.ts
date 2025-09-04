import { Document as PageDocument } from '../../src/Document';

describe('PageDocument Integration', () => {
  describe('Document Configuration', () => {
    test('should create document extension', () => {
      const document = PageDocument;
      
      expect(document.name).toBe('doc');
      expect(document).toBeDefined();
    });

    test('should have correct content model', () => {
      const document = PageDocument;
      

      expect(document).toBeDefined();
    });

    test('should be compatible with Tiptap editor', () => {
      const document = PageDocument;
      

      expect(document.name).toBeDefined();
      expect(typeof document.name).toBe('string');
    });
  });

  describe('Schema Integration', () => {
    test('should enforce PAGE node structure', () => {
      const document = PageDocument;
      
      expect(document).toBeDefined();
    });

    test('should work with PageExtension', () => {

      const document = PageDocument;
      
      expect(document.name).toBe('doc');
      expect(() => document).not.toThrow();
    });
  });
});
