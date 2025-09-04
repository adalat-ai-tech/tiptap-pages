import { UnitConversion } from '../../src/core';

describe('UnitConversion', () => {
  let unitConversion: UnitConversion;

  beforeEach(() => {
    unitConversion = new UnitConversion();
  });

  describe('Pixel to Millimeter Conversion', () => {
    test('should convert pixels to millimeters', () => {
      const result = unitConversion.pxConversionMm(96);
      expect(result).toBe(25);
    });

    test('should handle zero pixels', () => {
      const result = unitConversion.pxConversionMm(0);
      expect(result).toBe(0);
    });

    test('should handle negative pixels', () => {
      const result = unitConversion.pxConversionMm(-96);
      expect(result).toBe(-25);
    });
  });

  describe('Millimeter to Pixel Conversion', () => {
    test('should convert millimeters to pixels', () => {
      const result = unitConversion.mmConversionPx(25.4);
      expect(result).toBe(96);
    });

    test('should handle zero millimeters', () => {
      const result = unitConversion.mmConversionPx(0);
      expect(result).toBe(0);
    });

    test('should handle negative millimeters', () => {
      const result = unitConversion.mmConversionPx(-25.4);
      expect(result).toBe(-96);
    });
  });

  describe('Point to Pixel Conversion', () => {
    test('should convert points to pixels', () => {
      const result = unitConversion.ptConversionPx(72);
      expect(result).toBe(96); 
    });

    test('should handle zero points', () => {
      const result = unitConversion.ptConversionPx(0);
      expect(result).toBe(0);
    });

    test('should handle negative points', () => {
      const result = unitConversion.ptConversionPx(-72);
      expect(result).toBe(-96);
    });
  });

  describe('Pixel to Point Conversion', () => {
    test('should convert pixels to points', () => {
      const result = unitConversion.pxConversionPt(96);
      expect(result).toBe(72);
    });

    test('should handle zero pixels', () => {
      const result = unitConversion.pxConversionPt(0);
      expect(result).toBe(0);
    });

    test('should handle negative pixels', () => {
      const result = unitConversion.pxConversionPt(-96);
      expect(result).toBe(-72);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very small values', () => {
      const result = unitConversion.ptConversionPx(0.1);
      expect(result).toBeCloseTo(0.133, 2);
    });

    test('should handle very large values', () => {
      const result = unitConversion.ptConversionPx(1000);
      expect(result).toBeCloseTo(1333.33, 1);
    });

    test('should return rounded values', () => {
      const result = unitConversion.pxConversionMm(95);
      expect(Number.isInteger(result)).toBe(true);
    });
  });
});
