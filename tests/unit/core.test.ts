import { getBodyHeight, getBodyWidth } from '../../src/core';
import { PageOptions } from '../../src/types';

describe('Core Utilities', () => {
  describe('getBodyHeight', () => {
    const baseOptions: PageOptions = {
      bodyHeight: 1056,
      bodyWidth: 816
    };

    test('should calculate body height without page numbers', () => {
      const result = getBodyHeight(baseOptions);
      expect(result).toBe(960); // 1056 - 96
    });

    test('should calculate body height with page number in footer', () => {
      const options: PageOptions = {
        ...baseOptions,
        pageNumber: {
          show: true,
          showCount: false,
          showOnFirstPage: false,
          position: 'bottom',
          alignment: 'center'
        },
        footerHeight: 50
      };

      const result = getBodyHeight(options);

      expect(result).toBe(910); // 1056 - 96 - 50
    });

    test('should calculate body height with page number in header', () => {
      const options: PageOptions = {
        ...baseOptions,
        pageNumber: {
          show: true,
          showCount: false,
          showOnFirstPage: false,
          position: 'top',
          alignment: 'center'
        },
        headerHeight: 40
      };

      const result = getBodyHeight(options);

      expect(result).toBe(920); // 1056 - 96 - 40
    });

    test('should calculate body height with custom margins', () => {
      const options: PageOptions = {
        ...baseOptions,
        pageLayout: {
          margins: {
            top: { unit: 'INCHES', value: 1.0 },
            bottom: { unit: 'INCHES', value: 1.0 },
            left: { unit: 'INCHES', value: 0.5 },
            right: { unit: 'INCHES', value: 0.5 }
          }
        }
      };

      const result = getBodyHeight(options);

      expect(result).toBe(864); // 1056 - 192
    });

    test('should handle missing pageLayout gracefully', () => {
      const options: PageOptions = {
        bodyHeight: 1056,
        bodyWidth: 816,
        pageLayout: undefined
      };

      const result = getBodyHeight(options);

      expect(result).toBe(960); // 1056 - 96
    });
  });

  describe('getBodyWidth', () => {
    const baseOptions: PageOptions = {
      bodyHeight: 1056,
      bodyWidth: 816
    };

    test('should calculate body width with default margins', () => {
      const result = getBodyWidth(baseOptions);

      expect(result).toBe(720); // 816 - 96
    });

    test('should calculate body width with custom margins', () => {
      const options: PageOptions = {
        ...baseOptions,
        pageLayout: {
          margins: {
            top: { unit: 'INCHES', value: 0.5 },
            bottom: { unit: 'INCHES', value: 0.5 },
            left: { unit: 'INCHES', value: 1.0 },
            right: { unit: 'INCHES', value: 1.0 }
          }
        }
      };

      const result = getBodyWidth(options);

      expect(result).toBe(624); // 816 - 192
    });

    test('should handle missing pageLayout gracefully', () => {
      const options: PageOptions = {
        bodyHeight: 1056,
        bodyWidth: 816,
        pageLayout: undefined
      };

      const result = getBodyWidth(options);

      expect(result).toBe(720); // 816 - 96
    });

    test('should handle zero margins', () => {
      const options: PageOptions = {
        ...baseOptions,
        pageLayout: {
          margins: {
            top: { unit: 'INCHES', value: 0 },
            bottom: { unit: 'INCHES', value: 0 },
            left: { unit: 'INCHES', value: 0 },
            right: { unit: 'INCHES', value: 0 }
          }
        }
      };

      const result = getBodyWidth(options);
      expect(result).toBe(816);
    });
  });
});
