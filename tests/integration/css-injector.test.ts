import { 
  injectPageExtensionStyles, 
  removePageExtensionStyles, 
  areStylesInjected 
} from '../../src/css-injector';

describe('CSS Injector Integration', () => {
  beforeEach(() => {

    const existingStyle = document.getElementById('page-extension-styles');
    if (existingStyle) {
      existingStyle.remove();
    }
  });

  afterEach(() => {

    removePageExtensionStyles();
  });

  describe('Style Injection', () => {
    test('should inject styles into document head', () => {
      expect(areStylesInjected()).toBe(false);
      
      injectPageExtensionStyles();
      
      expect(areStylesInjected()).toBe(true);
      
      const styleElement = document.getElementById('page-extension-styles');
      expect(styleElement).not.toBeNull();
      expect(styleElement?.tagName).toBe('STYLE');
    });

    test('should not inject styles twice', () => {
      injectPageExtensionStyles();
      const firstStyle = document.getElementById('page-extension-styles');
      
      injectPageExtensionStyles();
      const secondStyle = document.getElementById('page-extension-styles');
      
      expect(firstStyle).toBe(secondStyle);
      expect(document.querySelectorAll('#page-extension-styles')).toHaveLength(1);
    });

    test('should contain expected CSS rules', () => {
      injectPageExtensionStyles();
      
      const styleElement = document.getElementById('page-extension-styles');
      const cssContent = styleElement?.textContent || '';
      

      expect(cssContent).toContain('.Page');
      expect(cssContent).toContain('.PageContent');
      expect(cssContent).toContain('.footer');
      expect(cssContent).toContain('.header');
      expect(cssContent).toContain('page');
      expect(cssContent).toContain('box-shadow');
      expect(cssContent).toContain('transform: scale');
    });
  });

  describe('Style Removal', () => {
    test('should remove styles from document', () => {
      injectPageExtensionStyles();
      expect(areStylesInjected()).toBe(true);
      
      removePageExtensionStyles();
      
      expect(areStylesInjected()).toBe(false);
      expect(document.getElementById('page-extension-styles')).toBeNull();
    });

    test('should handle removal when no styles are injected', () => {
      expect(areStylesInjected()).toBe(false);
      

      expect(() => removePageExtensionStyles()).not.toThrow();
      
      expect(areStylesInjected()).toBe(false);
    });

    test('should handle removal when element is already removed', () => {
      injectPageExtensionStyles();
      const styleElement = document.getElementById('page-extension-styles');
      styleElement?.remove();
      

      expect(() => removePageExtensionStyles()).not.toThrow();
      
      expect(areStylesInjected()).toBe(false);
    });
  });

  describe('Style State Management', () => {
    test('should track injection state correctly', () => {
      expect(areStylesInjected()).toBe(false);
      
      injectPageExtensionStyles();
      expect(areStylesInjected()).toBe(true);
      
      removePageExtensionStyles();
      expect(areStylesInjected()).toBe(false);
    });

    test('should handle multiple injection/removal cycles', () => {
     
      injectPageExtensionStyles();
      expect(areStylesInjected()).toBe(true);
      
      removePageExtensionStyles();
      expect(areStylesInjected()).toBe(false);
      
      
      injectPageExtensionStyles();
      expect(areStylesInjected()).toBe(true);
      
      removePageExtensionStyles();
      expect(areStylesInjected()).toBe(false);
    });
  });

  describe('Error Handling', () => {
    test('should handle document.head not available', () => {
   
      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      const originalAppendChild = document.head.appendChild;
      document.head.appendChild = jest.fn(() => {
        throw new Error('Mock error');
      });
      
 
      expect(() => injectPageExtensionStyles()).not.toThrow();
      

      document.head.appendChild = originalAppendChild;
      console.error = originalConsoleError;
    });

    test('should handle removeChild error', () => {

      const originalConsoleError = console.error;
      console.error = jest.fn();
      
      injectPageExtensionStyles();
      
      const originalRemoveChild = document.head.removeChild;
      document.head.removeChild = jest.fn(() => {
        throw new Error('Mock error');
      });
      

      expect(() => removePageExtensionStyles()).not.toThrow();
      

      document.head.removeChild = originalRemoveChild;
      console.error = originalConsoleError;
    });
  });
});
