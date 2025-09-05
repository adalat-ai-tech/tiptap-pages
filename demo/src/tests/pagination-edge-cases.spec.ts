import { test, expect } from '@playwright/test';

test.describe('Editor Pagination - Edge Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should handle empty document', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const pageElements = page.locator('page');
    const count = await pageElements.count();
    expect(count).toBe(0);
    
    await page.locator('.tiptap').type('New content');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('New content');
  });

  test('should handle single character content', async ({ page }) => {
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('A');
    
    const pageElements = page.locator('page');
    const count = await pageElements.count();
    expect(count).toBeLessThanOrEqual(1);
  });

  test('should handle very long single word', async ({ page }) => {
    const longWord = 'supercalifragilisticexpialidocious'.repeat(50);
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type(longWord);
    
    await page.waitForTimeout(1000);
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('supercalifragilisticexpialidocious');
  });

  test('should handle special characters and symbols', async ({ page }) => {
    const specialContent = `
    Special Characters Test:
    !@#$%^&*()_+-=[]{}|;':",./<>?
    Unicode: 🚀🎉💻🔥⭐
    Math: ∑∏∫√∞≈≠≤≥
    Currency: $€£¥₹
    `;
    
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type(specialContent);
    
    await expect(page.locator('p').filter({ hasText: '🚀🎉💻🔥⭐' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: '$€£¥₹' })).toBeVisible();
  });

  test('should handle rapid typing and deletion', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    for (let i = 0; i < 10; i++) {
      await page.locator('.tiptap').type('Quick typing test ');
      await page.waitForTimeout(50);
    }
    
    for (let i = 0; i < 50; i++) {
      await page.keyboard.press('Backspace');
      await page.waitForTimeout(50);
    }
    
    await page.locator('.tiptap').type('Final test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Final test');
  });

  test('should handle copy and paste operations', async ({ page }) => {
    const testContent = 'This is content to copy and paste multiple times. ';
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type(testContent);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Control+v');
      await page.waitForTimeout(100);
    }
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain(testContent);
  });

  test('should handle nested lists with deep indentation', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.getByRole('button', { name: 'Bullet list' }).click();
    await page.locator('.tiptap').type('Level 1');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.locator('.tiptap').type('Level 2');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.locator('.tiptap').type('Level 3');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.locator('.tiptap').type('Level 4');
    
    const longText = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longText);
    
    const listItems = page.locator('ul li');
    const count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });

  test('should handle mixed list types (bullet and ordered)', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.getByRole('button', { name: 'Bullet list' }).click();
    await page.locator('.tiptap').type('Bullet item 1');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Bullet item 2');
    
    await page.getByRole('button', { name: 'Ordered list' }).click();
    await page.locator('.tiptap').type('Ordered item 1');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Ordered item 2');
    
    const longText = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longText);
    
    const allListItems = page.locator('li');
    const count = await allListItems.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should handle multiple heading levels in sequence', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const headings = [
      { level: 'H1', text: 'Heading 1' },
      { level: 'H2', text: 'Heading 2' },
      { level: 'H3', text: 'Heading 3' },
      { level: 'H4', text: 'Heading 4' },
      { level: 'H5', text: 'Heading 5' },
      { level: 'H6', text: 'Heading 6' }
    ];
    
    for (const heading of headings) {
      await page.getByRole('button', { name: heading.level }).click();
      await page.locator('.tiptap').type(heading.text);
      await page.keyboard.press('Enter');
    }
    
    const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longText);
    
    for (const heading of headings) {
      const headingElement = page.locator(heading.level.toLowerCase()).filter({ hasText: heading.text });
      await expect(headingElement).toBeVisible();
    }
  });

  test('should handle text with multiple formatting combinations', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.getByRole('button', { name: 'Underline' }).click();
    await page.locator('.tiptap').type('Bold, Italic, and Underlined text');
    
    await page.keyboard.press('Enter');
    
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type('Just Bold text');
    
    await page.keyboard.press('Enter');
    
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.getByRole('button', { name: 'Underline' }).click();
    await page.locator('.tiptap').type('Italic and Underlined text');
    
    const longText = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longText);
    
    const strongElements = page.locator('strong');
    const emElements = page.locator('em');
    const uElements = page.locator('u');
    const strongCount = await strongElements.count();
    const emCount = await emElements.count();
    const uCount = await uElements.count();
    expect(strongCount).toBeGreaterThan(0);
    expect(emCount).toBeGreaterThan(0);
    expect(uCount).toBeGreaterThan(0);
  });

  test('should handle very large document (stress test)', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const largeContent = 'This is a stress test for large documents. '.repeat(100);
    await page.locator('.tiptap').fill(largeContent);
    
    await page.waitForTimeout(1000);
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('This is a stress test for large documents.');
    
    await page.locator('.tiptap').click();
    await page.keyboard.press('End');
    await page.locator('.tiptap').type(' End of document');
    const finalContent = await page.locator('.tiptap').textContent();
    expect(finalContent).toContain('End of document');
  });

  test('should handle rapid undo/redo operations', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.locator('.tiptap').type('Initial content');
    
    for (let i = 0; i < 10; i++) {
      await page.getByRole('button', { name: 'Undo' }).click();
      await page.waitForTimeout(50);
      await page.getByRole('button', { name: 'Redo' }).click();
      await page.waitForTimeout(50);
    }
    
    await page.locator('.tiptap').type(' After undo/redo test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('After undo/redo test');
  });

  test('should handle keyboard navigation across pages', async ({ page }) => {
    const longContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10);
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type(longContent);
    
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('Home');
    await page.keyboard.press('End');
    await page.keyboard.press('PageUp');
    await page.keyboard.press('PageDown');
    
    await page.keyboard.press('End');
    await page.locator('.tiptap').type(' Navigation test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Navigation test');
  });

  test('should handle selection and deletion across pages', async ({ page }) => {
    const longContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10);
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type(longContent);
    
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Delete');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content?.trim().length).toBeLessThan(1500);
    
    await page.locator('.tiptap').type('New content after deletion');
    const finalContent = await page.locator('.tiptap').textContent();
    expect(finalContent).toContain('New content after deletion');
  });

  test('should handle window resize during pagination', async ({ page }) => {
    const longContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(10);
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type(longContent);
    
    await page.waitForTimeout(1000);
    
    await page.setViewportSize({ width: 800, height: 600 });
    await page.waitForTimeout(500);
    
    await page.setViewportSize({ width: 1200, height: 800 });
    await page.waitForTimeout(500);
    
    await page.locator('.tiptap').click();
    await page.locator('.tiptap').type(' After resize');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('After resize');
  });

  test('should handle focus and blur events', async ({ page }) => {
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type('Focus test content');
    
    await page.locator('.tiptap').click();
    await page.locator('body').click(); // Blur
    await page.locator('.tiptap').click(); // Focus again
    
    await page.locator('.tiptap').type(' After focus test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('After focus test');
  });
});
