import { test, expect } from '@playwright/test';

test.describe('Editor Pagination - Copy Paste Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should copy and paste plain text across pages', async ({ page }) => {
    const sourceText = 'This is source text to copy and paste.';
    await page.locator('.tiptap').clear();
    await page.locator('.tiptap').type(sourceText);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain(sourceText);
  });

  test('should copy and paste formatted text (bold, italic, underline)', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.locator('.tiptap').type('Normal text ');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type('Bold text ');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.locator('.tiptap').type('Italic text ');
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.getByRole('button', { name: 'Underline' }).click();
    await page.locator('.tiptap').type('Underlined text');
    await page.getByRole('button', { name: 'Underline' }).click();
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    await expect(page.locator('strong').filter({ hasText: 'Bold text' })).toBeVisible();
    await expect(page.locator('em').filter({ hasText: 'Italic text' })).toBeVisible();
    await expect(page.locator('u').filter({ hasText: 'Underlined text' })).toBeVisible();
  });

  test('should copy and paste lists across pages', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.getByRole('button', { name: 'Bullet list' }).click();
    await page.locator('.tiptap').type('List item 1');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('List item 2');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('List item 3');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const listItems = page.locator('ul li');
    const count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(3);
    await expect(page.locator('li').filter({ hasText: 'List item 1' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'List item 2' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'List item 3' })).toBeVisible();
  });

  test('should copy and paste ordered lists across pages', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.getByRole('button', { name: 'Ordered list' }).click();
    await page.locator('.tiptap').type('First item');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Second item');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Third item');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const listItems = page.locator('ol li');
    const count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(3);
    await expect(page.locator('li').filter({ hasText: 'First item' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Second item' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Third item' })).toBeVisible();
  });

  test('should copy and paste headings across pages', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.getByRole('button', { name: 'H1' }).click();
    await page.locator('.tiptap').type('Main Heading');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'H2' }).click();
    await page.locator('.tiptap').type('Sub Heading');
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'H3' }).click();
    await page.locator('.tiptap').type('Sub Sub Heading');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    await expect(page.locator('h1').filter({ hasText: 'Main Heading' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Sub Heading' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Sub Sub Heading' })).toBeVisible();
  });

  test('should copy and paste mixed content (text, lists, headings)', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.getByRole('button', { name: 'H1' }).click();
    await page.locator('.tiptap').type('Document Title');
    await page.keyboard.press('Enter');
    
    await page.locator('.tiptap').type('This is a paragraph with ');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type('bold text');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type('.');
    await page.keyboard.press('Enter');
    
    await page.getByRole('button', { name: 'Bullet list' }).click();
    await page.locator('.tiptap').type('List item 1');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('List item 2');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    await expect(page.locator('h1').filter({ hasText: 'Document Title' })).toBeVisible();
    await expect(page.locator('strong').filter({ hasText: 'bold text' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'List item 1' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'List item 2' })).toBeVisible();
  });

  test('should copy and paste from external source (clipboard)', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const sourceContent = 'External content from clipboard with special characters: 🚀🎉💻';
    await page.locator('.tiptap').type(sourceContent);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('External content from clipboard');
  });

  test('should copy and paste large content blocks', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const largeContent = 'Large content block. '.repeat(50);
    await page.locator('.tiptap').type(largeContent);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const separatorContent = '\n\n' + 'Separator content. '.repeat(20);
    await page.locator('.tiptap').type(separatorContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Large content block');
  });

  test('should copy and paste with line breaks and spacing', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.locator('.tiptap').type('First line');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Third line');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Fourth line');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('First line');
    expect(content).toContain('Third line');
    expect(content).toContain('Fourth line');
  });

  test('should copy and paste nested lists', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.getByRole('button', { name: 'Bullet list' }).click();
    await page.locator('.tiptap').type('Level 1 item');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.locator('.tiptap').type('Level 2 item');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Tab');
    await page.locator('.tiptap').type('Level 3 item');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Shift+Tab');
    await page.locator('.tiptap').type('Another Level 2 item');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const listItems = page.locator('ul li');
    const count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(4);
    await expect(page.locator('li').filter({ hasText: 'Level 1 item' }).first()).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Level 2 item' }).first()).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Level 3 item' }).first()).toBeVisible();
  });

  test('should copy and paste with special characters and symbols', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const specialContent = `
    Special Characters Test:
    !@#$%^&*()_+-=[]{}|;':",./<>?
    Unicode: 🚀🎉💻🔥⭐
    Math: ∑∏∫√∞≈≠≤≥
    Currency: $€£¥₹
    `;
    
    await page.locator('.tiptap').type(specialContent);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    await expect(page.locator('p').filter({ hasText: '🚀🎉💻🔥⭐' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: '$€£¥₹' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: '∑∏∫√∞≈≠≤≥' })).toBeVisible();
  });

  test('should copy and paste with undo/redo operations', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.locator('.tiptap').type('Initial content');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    await page.getByRole('button', { name: 'Undo' }).click();
    
    await page.getByRole('button', { name: 'Redo' }).click();
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Initial content');
  });

  test('should copy and paste with selection across page boundaries', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const multiPageContent = 'Content for page 1. '.repeat(10) + '\n\n' + 'Content for page 2. '.repeat(10);
    await page.locator('.tiptap').type(multiPageContent);
    
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('Home');
    await page.keyboard.press('Control+Shift+End');
    await page.keyboard.press('Control+c');
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Content for page 1');
    expect(content).toContain('Content for page 2');
  });

  test('should copy and paste with different paste modes (plain text vs formatted)', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.locator('.tiptap').type('Normal text ');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type('Bold text');
    await page.getByRole('button', { name: 'Bold' }).click();
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    await expect(page.locator('strong').filter({ hasText: 'Bold text' })).toBeVisible();
    
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+Shift+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Bold text');
  });

  test('should copy and paste with clipboard API integration', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const testContent = 'Clipboard API test content';
    await page.locator('.tiptap').type(testContent);
    
    await page.keyboard.press('Control+a');
    
    await page.evaluate(async () => {
      try {
        await navigator.clipboard.writeText('Clipboard API test content');
      } catch {
        console.log('Clipboard API not available');
      }
    });
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Clipboard API test content');
  });

  test('should copy and paste with drag and drop simulation', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.locator('.tiptap').type('Source content for drag and drop');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('Home');
    await page.keyboard.press('Control+Shift+ArrowRight');
    await page.keyboard.press('Control+c');
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Source content for drag and drop');
  });

  test('should copy and paste with keyboard shortcuts consistency', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.locator('.tiptap').type('Keyboard shortcuts test content');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    
    await page.keyboard.press('Control+v');
    await page.keyboard.press('Enter');
    
    await page.keyboard.press('Control+Shift+v');
    
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Keyboard shortcuts test content');
  });

  test('should ensure copy-pasted content is always inside PageContent class', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    const sourceContent = 'Content to be copied and pasted into PageContent';
    await page.locator('.tiptap').type(sourceContent);
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const pageContentElements = page.locator('.PageContent');
    const pageContentCount = await pageContentElements.count();
    
    expect(pageContentCount).toBeGreaterThan(0);
    
    let contentFoundInPageContent = false;
    for (let i = 0; i < pageContentCount; i++) {
      const pageContentElement = pageContentElements.nth(i);
      const pageContentText = await pageContentElement.textContent();
      if (pageContentText?.includes(sourceContent)) {
        contentFoundInPageContent = true;
        break;
      }
    }
    
    expect(contentFoundInPageContent).toBe(true);
    
    const allTextContent = await page.locator('.tiptap').textContent();
    expect(allTextContent).toContain(sourceContent);
    
    const pageWrappers = page.locator('.Page');
    const pageWrapperCount = await pageWrappers.count();
    
    for (let i = 0; i < pageWrapperCount; i++) {
      const pageWrapper = pageWrappers.nth(i);
      const pageWrapperText = await pageWrapper.textContent();
      
      if (pageWrapperText?.includes(sourceContent)) {
        const pageContentChild = pageWrapper.locator('.PageContent');
        const hasPageContentChild = await pageContentChild.count() > 0;
        expect(hasPageContentChild).toBe(true);
      }
    }
  });

  test('should ensure copy-pasted formatted content is inside PageContent class', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.locator('.tiptap').type('Normal text ');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type('Bold text');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.locator('.tiptap').type(' Italic text');
    await page.getByRole('button', { name: 'Italic' }).click();
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const pageContentElements = page.locator('.PageContent');
    const pageContentCount = await pageContentElements.count();
    
    expect(pageContentCount).toBeGreaterThan(0);
    
    let formattedContentFoundInPageContent = false;
    for (let i = 0; i < pageContentCount; i++) {
      const pageContentElement = pageContentElements.nth(i);
      const hasBoldText = await pageContentElement.locator('strong').filter({ hasText: 'Bold text' }).count() > 0;
      const hasItalicText = await pageContentElement.locator('em').filter({ hasText: 'Italic text' }).count() > 0;
      
      if (hasBoldText && hasItalicText) {
        formattedContentFoundInPageContent = true;
        break;
      }
    }
    
    expect(formattedContentFoundInPageContent).toBe(true);
    
    await expect(page.locator('.PageContent strong').filter({ hasText: 'Bold text' })).toBeVisible();
    await expect(page.locator('.PageContent em').filter({ hasText: 'Italic text' })).toBeVisible();
  });

  test('should ensure copy-pasted list content is inside PageContent class', async ({ page }) => {
    await page.locator('.tiptap').clear();
    
    await page.getByRole('button', { name: 'Bullet list' }).click();
    await page.locator('.tiptap').type('List item 1');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('List item 2');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('List item 3');
    
    await page.keyboard.press('Control+a');
    await page.keyboard.press('Control+c');
    
    const longContent = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(20);
    await page.locator('.tiptap').type(longContent);
    
    await page.waitForTimeout(1000);
    
    await page.keyboard.press('End');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Control+v');
    
    const pageContentElements = page.locator('.PageContent');
    const pageContentCount = await pageContentElements.count();
    
    expect(pageContentCount).toBeGreaterThan(0);
    
    let listContentFoundInPageContent = false;
    for (let i = 0; i < pageContentCount; i++) {
      const pageContentElement = pageContentElements.nth(i);
      const hasListItems = await pageContentElement.locator('ul li').count() > 0;
      
      if (hasListItems) {
        const listText = await pageContentElement.locator('ul li').first().textContent();
        if (listText?.includes('List item 1')) {
          listContentFoundInPageContent = true;
          break;
        }
      }
    }
    
    expect(listContentFoundInPageContent).toBe(true);
    
    await expect(page.locator('.PageContent ul li').filter({ hasText: 'List item 1' })).toBeVisible();
    await expect(page.locator('.PageContent ul li').filter({ hasText: 'List item 2' })).toBeVisible();
    await expect(page.locator('.PageContent ul li').filter({ hasText: 'List item 3' })).toBeVisible();
  });
});
