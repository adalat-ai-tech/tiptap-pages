import { test, expect } from '@playwright/test';

test.describe('Editor Pagination - Cross Browser Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should work consistently across different browsers', async ({ page }) => {
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('Cross browser test');
    
    const content1 = await page.locator('.tiptap').textContent();
    expect(content1).toContain('Cross browser test');
    
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type(' Bold text');
    
    await expect(page.locator('strong').filter({ hasText: 'Bold text' })).toBeVisible();
    
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Bullet list' }).click();
    await page.keyboard.type('List item');
    
    await expect(page.locator('ul li').filter({ hasText: 'List item' })).toBeVisible();
  });

  test('should handle keyboard shortcuts consistently', async ({ page }) => {
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('Keyboard shortcuts test');
    
    await page.keyboard.press('Control+a'); 
    await page.keyboard.press('Control+c'); 
    await page.keyboard.press('Control+v'); 
    
    const content2 = await page.locator('.tiptap').textContent();
    expect(content2).toContain('Keyboard shortcuts test');
    
    await page.keyboard.press('Control+z'); 
    await page.keyboard.press('Control+y'); 
    
    await page.locator('.tiptap').type(' After shortcuts');
    const finalContent = await page.locator('.tiptap').textContent();
    expect(finalContent).toContain('After shortcuts');
  });

  test('should handle different viewport sizes consistently', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 },   
      { width: 768, height: 1024 },  
      { width: 1024, height: 768 },
      { width: 1920, height: 1080 }
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      await page.locator('.tiptap').clear();
      await page.locator('.tiptap').type(`Viewport test ${viewport.width}x${viewport.height}`);
      
      const content3 = await page.locator('.tiptap').textContent();
      expect(content3).toContain(`Viewport test ${viewport.width}x${viewport.height}`);
      
      await page.getByRole('button', { name: 'Bold' }).click();
      await page.locator('.tiptap').type(' Bold');
      
      await expect(page.locator('strong').filter({ hasText: 'Bold' })).toBeVisible();
    }
  });

  test('should handle different zoom levels consistently', async ({ page }) => {
    const zoomLevels = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
    
    for (const zoom of zoomLevels) {
      await page.locator('.tiptap').clear();
      await page.locator('.tiptap').type(`Zoom test ${zoom}x`);
      
      const content4 = await page.locator('.tiptap').textContent();
      expect(content4).toContain(`Zoom test ${zoom}x`);
      
      await page.getByRole('button', { name: 'Italic' }).click();
      await page.locator('.tiptap').type(' Italic');
      
      await expect(page.locator('em').filter({ hasText: 'Italic' })).toBeVisible();
    }
  });

  test('should handle different operating systems consistently', async ({ page }) => {
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('OS compatibility test');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    await page.keyboard.press('Control+v');
    
    const content5 = await page.locator('.tiptap').textContent();
    expect(content5).toContain('OS compatibility test');
    
    await page.keyboard.press('Control+z');
    await page.keyboard.press('Control+y');
    
    await page.locator('.tiptap').type(' After OS test');
    const finalContent = await page.locator('.tiptap').textContent();
    expect(finalContent).toContain('After OS test');
  });

  test('should handle different input methods consistently', async ({ page }) => {
    await page.locator('.tiptap').click();
    await page.locator('.tiptap').type('Mouse input test');
    
    await page.keyboard.press('Enter');
    await page.keyboard.type('Keyboard input test');
    
    await page.locator('.tiptap').click();
    await page.keyboard.type('Touch input test');
    
    const content16 = await page.locator('.tiptap').textContent();
    expect(content16).toContain('Mouse input test');
    expect(content16).toContain('Keyboard input test');
    expect(content16).toContain('Touch input test');
  });

  test('should handle different screen orientations consistently', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('Portrait test');
    const content6 = await page.locator('.tiptap').textContent();
    expect(content6).toContain('Portrait test');
    
    await page.setViewportSize({ width: 667, height: 375 });
    
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('Landscape test');
    const content14 = await page.locator('.tiptap').textContent();
    expect(content14).toContain('Landscape test');
    
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type(' Bold');
    await expect(page.locator('strong').filter({ hasText: 'Bold' })).toBeVisible();
  });

  test('should handle different network conditions consistently', async ({ page }) => {
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });
    
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('Slow network test');
    const content7 = await page.locator('.tiptap').textContent();
    expect(content7).toContain('Slow network test');
    
    await page.context().setOffline(true);
    
    await page.locator('.tiptap').type(' Offline test');
    const content15 = await page.locator('.tiptap').textContent();
    expect(content15).toContain('Offline test');
    
    await page.context().setOffline(false);
  });

  test('should handle different user agents consistently', async ({ page }) => {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];
    
    for (const userAgent of userAgents) {
      await page.setExtraHTTPHeaders({ 'User-Agent': userAgent });
      
      await page.locator('.tiptap').clear();
      await page.locator('.tiptap').type('User agent test');
      
      const content8 = await page.locator('.tiptap').textContent();
      expect(content8).toContain('User agent test');
      
      await page.getByRole('button', { name: 'Underline' }).click();
      await page.locator('.tiptap').type(' Underlined');
      
      await expect(page.locator('u').filter({ hasText: 'Underlined' })).toBeVisible();
    }
  });

  test('should handle different time zones consistently', async ({ page }) => {
    const timeZones = ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo'];
    
    for (const timeZone of timeZones) {
      await page.context().addInitScript((tz) => {
        Object.defineProperty(Intl, 'DateTimeFormat', {
          value: class extends Intl.DateTimeFormat {
            constructor(...args: ConstructorParameters<typeof Intl.DateTimeFormat>) {
              super(...args);
              this.resolvedOptions = () => ({ 
                timeZone: tz,
                locale: 'en-US',
                calendar: 'gregory',
                numberingSystem: 'latn'
              });
            }
          }
        });
      }, timeZone);
      
      await page.locator('.tiptap').clear();
      await page.locator('.tiptap').type(`Time zone test ${timeZone}`);
      
      const content9 = await page.locator('.tiptap').textContent();
      expect(content9).toContain(`Time zone test ${timeZone}`);
      
      await page.getByRole('button', { name: 'Bold' }).click();
      await page.locator('.tiptap').type(' Bold');
      
      await expect(page.locator('strong').filter({ hasText: 'Bold' })).toBeVisible();
    }
  });

  test('should handle different languages consistently', async ({ page }) => {
    const languages = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ja-JP'];
    
    for (const lang of languages) {
      await page.context().addInitScript((language) => {
        Object.defineProperty(navigator, 'language', {
          value: language,
          configurable: true
        });
      }, lang);
      
      await page.locator('.tiptap').clear();
      await page.locator('.tiptap').type(`Language test ${lang}`);
      
      const content10 = await page.locator('.tiptap').textContent();
      expect(content10).toContain(`Language test ${lang}`);
      
      await page.getByRole('button', { name: 'Italic' }).click();
      await page.locator('.tiptap').type(' Italic');
      
      await expect(page.locator('em').filter({ hasText: 'Italic' })).toBeVisible();
    }
  });

  test('should handle different device pixel ratios consistently', async ({ page }) => {
    const pixelRatios = [1, 1.5, 2, 3];
    
    for (const ratio of pixelRatios) {
      await page.evaluate((dpr) => {
        Object.defineProperty(window, 'devicePixelRatio', {
          value: dpr,
          configurable: true
        });
      }, ratio);
      
      await page.locator('.tiptap').clear();
      await page.locator('.tiptap').type(`Pixel ratio test ${ratio}x`);
      
      const content11 = await page.locator('.tiptap').textContent();
      expect(content11).toContain(`Pixel ratio test ${ratio}x`);
      
      await page.getByRole('button', { name: 'Bold' }).click();
      await page.locator('.tiptap').type(' Bold');
      
      await expect(page.locator('strong').filter({ hasText: 'Bold' })).toBeVisible();
    }
  });

  test('should handle different color schemes consistently', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('Light mode test');
    const content12 = await page.locator('.tiptap').textContent();
    expect(content12).toContain('Light mode test');
    
    await page.emulateMedia({ colorScheme: 'dark' });
    
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('Dark mode test');
    const content17 = await page.locator('.tiptap').textContent();
    expect(content17).toContain('Dark mode test');
    
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type(' Bold');
    await expect(page.locator('strong').filter({ hasText: 'Bold' })).toBeVisible();
  });

  test('should handle different reduced motion preferences consistently', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('Reduced motion test');
    const content13 = await page.locator('.tiptap').textContent();
    expect(content13).toContain('Reduced motion test');
    
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('Normal motion test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Normal motion test');
    
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.locator('.tiptap').type(' Italic');
    await expect(page.locator('em').filter({ hasText: 'Italic' })).toBeVisible();
  });
});
