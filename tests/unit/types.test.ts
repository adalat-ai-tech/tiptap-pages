import { 
  MarginUnit, 
  ParagraphSpacingUnit, 
  DEFAULT_PAGE_OPTIONS,
  type PageOptions,
  type PageLayoutConfig,
  type PageNumberConfig
} from '../../src/types';

describe('Types and Constants', () => {
  describe('MarginUnit', () => {
    test('should have correct values', () => {
      expect(MarginUnit.Cm).toBe('CM');
      expect(MarginUnit.Inches).toBe('INCHES');
    });

    test('should have consistent values', () => {
      expect(MarginUnit.Cm).toBe('CM');
      expect(MarginUnit.Inches).toBe('INCHES');
    });
  });

  describe('ParagraphSpacingUnit', () => {
    test('should have correct values', () => {
      expect(ParagraphSpacingUnit.Pts).toBe('PTS');
    });

    test('should have consistent values', () => {
      expect(ParagraphSpacingUnit.Pts).toBe('PTS');
    });
  });

  describe('DEFAULT_PAGE_OPTIONS', () => {
    test('should have optional properties', () => {
      expect(DEFAULT_PAGE_OPTIONS).toHaveProperty('pageLayout');
      expect(DEFAULT_PAGE_OPTIONS).toHaveProperty('pageNumber');
      expect(DEFAULT_PAGE_OPTIONS).toHaveProperty('bodyPadding');
      expect(DEFAULT_PAGE_OPTIONS).toHaveProperty('headerHeight');
      expect(DEFAULT_PAGE_OPTIONS).toHaveProperty('footerHeight');
    });

    test('should have correct default values', () => {
      expect(DEFAULT_PAGE_OPTIONS.bodyPadding).toBe(0);
      expect(DEFAULT_PAGE_OPTIONS.headerHeight).toBe(30);
      expect(DEFAULT_PAGE_OPTIONS.footerHeight).toBe(30);
      expect(DEFAULT_PAGE_OPTIONS.types).toEqual([]);
      expect(DEFAULT_PAGE_OPTIONS.headerData).toEqual([]);
      expect(DEFAULT_PAGE_OPTIONS.footerData).toEqual([]);
    });

    test('should have correct pageLayout defaults', () => {
      const pageLayout = DEFAULT_PAGE_OPTIONS.pageLayout;
      expect(pageLayout?.margins?.top?.value).toBe(0.5);
      expect(pageLayout?.margins?.bottom?.value).toBe(0.5);
      expect(pageLayout?.margins?.left?.value).toBe(0.5);
      expect(pageLayout?.margins?.right?.value).toBe(0.5);
      expect(pageLayout?.paragraphSpacing?.before?.value).toBe(6);
      expect(pageLayout?.paragraphSpacing?.after?.value).toBe(6);
    });

    test('should have correct pageNumber defaults', () => {
      const pageNumber = DEFAULT_PAGE_OPTIONS.pageNumber;
      expect(pageNumber?.show).toBe(false);
      expect(pageNumber?.showCount).toBe(false);
      expect(pageNumber?.showOnFirstPage).toBe(false);
      expect(pageNumber?.position).toBe(null);
      expect(pageNumber?.alignment).toBe(null);
    });
  });

  describe('Type Definitions', () => {
    test('should allow valid PageOptions', () => {
      const validOptions: PageOptions = {
        bodyHeight: 1056,
        bodyWidth: 816,
        bodyPadding: 10,
        headerHeight: 40,
        footerHeight: 60,
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
        },
        pageNumber: {
          show: true,
          showCount: true,
          showOnFirstPage: false,
          position: 'bottom',
          alignment: 'center'
        }
      };

      expect(validOptions.bodyHeight).toBe(1056);
      expect(validOptions.pageLayout?.margins?.top?.value).toBe(1.0);
      expect(validOptions.pageNumber?.show).toBe(true);
    });

    test('should allow minimal PageOptions', () => {
      const minimalOptions: PageOptions = {
        bodyHeight: 1056,
        bodyWidth: 816
      };

      expect(minimalOptions.bodyHeight).toBe(1056);
      expect(minimalOptions.bodyWidth).toBe(816);
    });

    test('should allow valid PageLayoutConfig', () => {
      const validLayout: PageLayoutConfig = {
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
      };

      expect(validLayout.margins?.top?.value).toBe(1.0);
      expect(validLayout.paragraphSpacing?.before?.value).toBe(12);
    });

    test('should allow valid PageNumberConfig', () => {
      const validPageNumber: PageNumberConfig = {
        show: true,
        showCount: true,
        showOnFirstPage: false,
        position: 'bottom',
        alignment: 'center'
      };

      expect(validPageNumber.show).toBe(true);
      expect(validPageNumber.position).toBe('bottom');
      expect(validPageNumber.alignment).toBe('center');
    });
  });
});
