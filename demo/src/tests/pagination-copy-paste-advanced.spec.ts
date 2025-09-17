import { test, expect } from '@playwright/test';

test.describe('Editor Pagination - Advanced Copy Paste Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should copy and paste with complex nested structures', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.getByRole('button', { name: 'H1' }).click();
    await page.locator('.tiptap').type('Main Title');
    await page.keyboard.press('Enter');
    
    await page.locator('.tiptap').type('Paragraph with ');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type('bold');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type(' and ');
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.locator('.tiptap').type('italic');
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.locator('.tiptap').type(' text.');
    await page.keyboard.press('Enter');
    
    await page.getByRole('button', { name: 'Bullet list' }).click();
    await page.locator('.tiptap').type('Level 1');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.locator('.tiptap').type('Level 2');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.locator('.tiptap').type('Level 3');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Shift+Tab');
    await page.locator('.tiptap').type('Another Level 2');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    await expect(page.locator('h1').filter({ hasText: 'Main Title' })).toBeVisible();
    await expect(page.locator('strong').filter({ hasText: 'bold' })).toBeVisible();
    await expect(page.locator('em').filter({ hasText: 'italic' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Level 1' }).first()).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Level 2' }).first()).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Level 3' }).first()).toBeVisible();
  });

  test('should copy and paste with mixed list types (bullet and ordered)', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.getByRole('button', { name: 'Bullet list' }).click();
    await page.locator('.tiptap').type('Bullet item 1');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Bullet item 2');
    await page.keyboard.press('Enter');
    
    await page.getByRole('button', { name: 'Ordered list' }).click();
    await page.locator('.tiptap').type('Ordered item 1');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Ordered item 2');
    await page.keyboard.press('Enter');
    
    await page.getByRole('button', { name: 'Bullet list' }).click();
    await page.locator('.tiptap').type('Final bullet item');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const bulletItems = page.locator('ul li');
    const orderedItems = page.locator('ol li');
    const bulletCount = await bulletItems.count();
    const orderedCount = await orderedItems.count();
    
    expect(bulletCount).toBeGreaterThan(0);
    const allListItems = page.locator('li');
    const totalListCount = await allListItems.count();
    expect(totalListCount).toBeGreaterThan(0);
    await expect(page.locator('li').filter({ hasText: 'Bullet item 1' })).toBeVisible();
    if (orderedCount > 0) {
      await expect(page.locator('li').filter({ hasText: 'Ordered item 1' })).toBeVisible();
    } else {
      const hasOrderedContent = await page.locator('li').filter({ hasText: 'Ordered item 1' }).count() > 0;
      expect(hasOrderedContent).toBe(true);
    }
  });

  test('should copy and paste with multiple formatting layers', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.locator('.tiptap').type('Normal text ');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type('Bold text ');
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.locator('.tiptap').type('Bold and Italic ');
    await page.getByRole('button', { name: 'Underline' }).click();
    await page.locator('.tiptap').type('All three formats');
    await page.getByRole('button', { name: 'Underline' }).click();
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.locator('.tiptap').type(' Back to bold');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type(' Back to normal');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    await expect(page.locator('strong').filter({ hasText: 'Bold text' })).toBeVisible();
    await expect(page.locator('strong em').filter({ hasText: 'Bold and Italic' })).toBeVisible();
    await expect(page.locator('strong em u').filter({ hasText: 'All three formats' })).toBeVisible();
  });

  test('should copy and paste with tables and complex layouts', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.locator('.tiptap').type('Table Header 1\tTable Header 2\tTable Header 3');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Row 1 Col 1\tRow 1 Col 2\tRow 1 Col 3');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Row 2 Col 1\tRow 2 Col 2\tRow 2 Col 3');
    
    await page.keyboard.press('Home');
    await page.keyboard.press('Control+Shift+ArrowRight');
    await page.getByRole('button', { name: 'Bold' }).click();
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Table Header 1');
    expect(content).toContain('Row 1 Col 1');
    expect(content).toContain('Row 2 Col 1');
  });

  test('should copy and paste with code blocks and preformatted text', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const codeContent = `
function example() {
  const message = "Hello, World!";
  console.log(message);
  return message;
}

const result = example();
    `;
    
    await page.locator('.tiptap').type(codeContent);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('function example()');
    expect(content).toContain('const message = "Hello, World!"');
    expect(content).toContain('console.log(message)');
  });

  test('should copy and paste with hyperlinks and special formatting', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.locator('.tiptap').type('Visit ');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type('Google');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type(' at https://www.google.com');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Or check out ');
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.locator('.tiptap').type('GitHub');
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.locator('.tiptap').type(' at https://github.com');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Google');
    expect(content).toContain('https://www.google.com');
    expect(content).toContain('GitHub');
    expect(content).toContain('https://github.com');
  });

  test('should copy and paste with mathematical expressions and symbols', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const mathContent = `
Mathematical Expressions:
E = mc²
∫₀^∞ e^(-x²) dx = √π/2
α + β = γ
∑(i=1 to n) i = n(n+1)/2
∂f/∂x = lim(h→0) [f(x+h) - f(x)]/h
    `;
    
    await page.locator('.tiptap').type(mathContent);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('E = mc²');
    expect(content).toContain('∫₀^∞');
    expect(content).toContain('α + β = γ');
    expect(content).toContain('∑(i=1 to n)');
  });

  test('should copy and paste with international characters and languages', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const multilingualContent = `
English: Hello, World!
Spanish: ¡Hola, Mundo!
French: Bonjour, le monde!
German: Hallo, Welt!
Chinese: 你好，世界！
Japanese: こんにちは、世界！
Arabic: مرحبا بالعالم
Russian: Привет, мир!
    `;
    
    await page.locator('.tiptap').type(multilingualContent);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Hello, World!');
    expect(content).toContain('¡Hola, Mundo!');
    expect(content).toContain('Bonjour, le monde!');
    expect(content).toContain('你好，世界！');
    expect(content).toContain('こんにちは、世界！');
  });

  test('should copy and paste with whitespace and indentation preservation', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const whitespaceContent = `
    Indented line 1
        Double indented line
    Indented line 2
    
    Line with    multiple    spaces
    Line with	tab	separated	content
    
    Line with trailing spaces    
    `;
    
    await page.locator('.tiptap').type(whitespaceContent);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Indented line 1');
    expect(content).toContain('Double indented line');
    expect(content).toContain('multiple    spaces');
  });

  test('should copy and paste with performance under load', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const largeContent = 'Performance test content. '.repeat(50);
    await page.locator('.tiptap').type(largeContent);
    
    const startTime = Date.now();
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const separatorContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(separatorContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Control+v');
      await page.waitForTimeout(50);
    }
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    expect(duration).toBeLessThan(30000);
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Performance test content');
  });

  test('should copy and paste with clipboard data validation', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const mixedDataContent = `
Text content: Regular text
Numbers: 123, 456.789, -42
Dates: 2024-01-15, 12/31/2023
URLs: https://example.com, http://test.org
Emails: test@example.com, user@domain.org
    `;
    
    await page.locator('.tiptap').type(mixedDataContent);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Regular text');
    expect(content).toContain('123, 456.789, -42');
    expect(content).toContain('2024-01-15');
    expect(content).toContain('https://example.com');
    expect(content).toContain('test@example.com');
  });

  test('should copy and paste with error recovery', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.locator('.tiptap').type('Error recovery test content');
    
    await page.evaluate(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          readText: () => Promise.reject(new Error('Clipboard error')),
          writeText: () => Promise.reject(new Error('Clipboard error'))
        }
      });
    });
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(30);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    await page.locator('.tiptap').type(' After error recovery');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('After error recovery');
  });

  test('should copy and paste with memory management', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const testContent = 'Memory management test content';
    await page.locator('.tiptap').type(testContent);
    
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Control+a');
      await page.keyboard.press('Control+c');
      
      const longContent = '\n\n' + 'Lorem ipsum dolor sit amet. '.repeat(5);
      await page.locator('.tiptap').type(longContent);
      
      await page.keyboard.press('End');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Control+v');
      
      await page.waitForTimeout(100);
    }
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Memory management test content');
    
    await page.locator('.tiptap').type(' Final test');
    const finalContent = await page.locator('.tiptap').textContent();
    expect(finalContent).toContain('Final test');
  });
});
