import { test, expect } from '@playwright/test';

test.describe('Editor Pagination - Performance Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should handle large document creation efficiently', async ({ page }) => {
    const startTime = Date.now();
    
    const largeContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50);
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').fill(largeContent);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(5000);
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Lorem ipsum dolor sit amet');
  });

  test('should handle rapid content changes without performance degradation', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const startTime = Date.now();
    
    for (let i = 0; i < 50; i++) {
      await page.locator('.tiptap').type(`Content batch ${i} `);
      await page.waitForTimeout(10);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(30000); 
    
    await page.locator('.tiptap').type(' Final batch');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Final batch');
  });

  test('should handle memory usage with very large documents', async ({ page }) => {
    const massiveContent = 'This is a massive document for memory testing. '.repeat(100);
    
    const startTime = Date.now();
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').fill(massiveContent);
    const endTime = Date.now();
    
    const duration = endTime - startTime;
    expect(duration).toBeLessThan(10000);
    
    await page.locator('.tiptap').click();
    await page.keyboard.press('End');
    await page.locator('.tiptap').type(' Memory test complete');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Memory test complete');
  });

  test('should handle concurrent operations efficiently', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const startTime = Date.now();
    
    const operations = [
      page.locator('.tiptap').type('Operation 1 '),
      page.locator('.tiptap').type('Operation 2 '),
      page.locator('.tiptap').type('Operation 3 '),
      page.locator('.tiptap').type('Operation 4 '),
      page.locator('.tiptap').type('Operation 5 ')
    ];
    
    for (const operation of operations) {
      await operation;
      await page.waitForTimeout(50);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(6000);
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Op');
  });

  test('should handle pagination recalculation efficiently', async ({ page }) => {
    const initialContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50);
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').fill(initialContent);
    
    await page.waitForTimeout(1000);
    
    const startTime = Date.now();
    
    await page.keyboard.press('Home');
    await page.locator('.tiptap').type('Start ');
    
    await page.keyboard.press('End');
    await page.locator('.tiptap').type(' End');
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(3000);
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Start');
    expect(content).toContain('End');
  });

  test('should handle rapid formatting changes efficiently', async ({ page }) => {
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('Formatting test content');
    
    const startTime = Date.now();
    
    for (let i = 0; i < 20; i++) {
      await page.getByRole('button', { name: 'Bold' }).click();
      await page.waitForTimeout(10);
      await page.getByRole('button', { name: 'Italic' }).click();
      await page.waitForTimeout(10);
      await page.getByRole('button', { name: 'Underline' }).click();
      await page.waitForTimeout(10);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(20000);
    
    await page.locator('.tiptap').type(' After formatting test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('After formatting test');
  });

  test('should handle large list operations efficiently', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const startTime = Date.now();
    
    await page.getByRole('button', { name: 'Bullet list' }).click();
    
    for (let i = 0; i < 20; i++) {
      await page.locator('.tiptap').type(`List item ${i}`);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(10);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(15000); 
    
    const listItems = page.locator('ul li');
    const count = await listItems.count();
    expect(count).toBeGreaterThan(10);
  });

  test('should handle scroll performance with large documents', async ({ page }) => {
    const largeContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50);
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').fill(largeContent);
    
    await page.waitForTimeout(1000);
    
    const startTime = Date.now();
    
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('PageDown');
      await page.waitForTimeout(100);
      await page.keyboard.press('PageUp');
      await page.waitForTimeout(100);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(4000);
    
    await page.locator('.tiptap').click();
    await page.locator('.tiptap').type(' Scroll test complete');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Scroll test complete');
  });

  test('should handle undo/redo performance with large documents', async ({ page }) => {
    const largeContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50);
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').fill(largeContent);
    
    await page.waitForTimeout(1000);
    
    const startTime = Date.now();
    
    for (let i = 0; i < 10; i++) {
      await page.getByRole('button', { name: 'Undo' }).click();
      await page.waitForTimeout(50);
      await page.getByRole('button', { name: 'Redo' }).click();
      await page.waitForTimeout(50);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(6000); 
    
    await page.locator('.tiptap').type(' Undo/redo test complete');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Undo/redo test complete');
  });

  test('should handle text selection performance', async ({ page }) => {
    const content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').fill(content);
    
    await page.waitForTimeout(1000);
    
    const startTime = Date.now();
    
    await page.locator('.tiptap').click();
    await page.keyboard.press('Control+a');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(100);
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(100);
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(2000); // 2 seconds
    
    await page.locator('.tiptap').click();
    await page.locator('.tiptap').type(' Selection test complete');
    const finalContent = await page.locator('.tiptap').textContent();
    expect(finalContent).toContain('Selection test complete');
  });

  test('should handle copy/paste performance with large content', async ({ page }) => {
    const largeContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').fill(largeContent);
    
    await page.waitForTimeout(1000);
    
    const startTime = Date.now();
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Control+v');
      await page.waitForTimeout(100);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(4000);
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Lorem ipsum dolor sit amet');
  });

  test('should handle window resize performance', async ({ page }) => {
    const content = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').fill(content);
    
    await page.waitForTimeout(1000);
    
    const startTime = Date.now();
    
    const sizes = [
      { width: 800, height: 600 },
      { width: 1200, height: 800 },
      { width: 600, height: 400 },
      { width: 1400, height: 900 }
    ];
    
    for (const size of sizes) {
      await page.setViewportSize(size);
      await page.waitForTimeout(200);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(4000);
    
    await page.locator('.tiptap').click();
    await page.locator('.tiptap').type(' Resize test complete');
    const finalContent = await page.locator('.tiptap').textContent();
    expect(finalContent).toContain('Resize test complete');
  });
});
