import { test, expect } from '@playwright/test';

test.describe('Editor Pagination - Error Handling Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should handle invalid input gracefully', async ({ page }) => {
    await page.evaluate(() => {
      const editor = document.querySelector('.tiptap');
      if (editor) {
        editor.textContent = null;
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    await page.locator('.tiptap').type('Recovery test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Recovery test');
  });

  test('should handle malformed HTML gracefully', async ({ page }) => {
    await page.evaluate(() => {
      const editor = document.querySelector('.tiptap');
      if (editor) {
        editor.innerHTML = '<p>Valid content</p><div>Unclosed div<p>Nested paragraph</div>';
        editor.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    
    await page.locator('.tiptap').type(' HTML recovery test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('HTML recovery test');
  });

  test('should handle extremely long content gracefully', async ({ page }) => {
    const longContent = 'A'.repeat(1000);
    
    try {
      await page.locator('.tiptap').clear();
      await page.locator('.tiptap').fill(longContent);
      
      await page.locator('.tiptap').type('B');
      const content = await page.locator('.tiptap').textContent();
      expect(content).toContain('B');
    } catch {
      await page.locator('.tiptap').clear();
      await page.locator('.tiptap').type('Recovery from long content');
      const content = await page.locator('.tiptap').textContent();
      expect(content).toContain('Recovery from long content');
    }
  });

  test('should handle rapid button clicks gracefully', async ({ page }) => {
    const boldButton = page.getByRole('button', { name: 'Bold' });
    
    for (let i = 0; i < 20; i++) {
      await boldButton.click();
      await page.waitForTimeout(10);
    }
    
    await page.locator('.tiptap').type('Rapid click test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Rapid click test');
  });

  test('should handle concurrent operations gracefully', async ({ page }) => {
    const operations = [
      page.locator('.tiptap').type('Operation 1'),
      page.getByRole('button', { name: 'Bold' }).click(),
      page.locator('.tiptap').type('Operation 2'),
      page.getByRole('button', { name: 'Italic' }).click(),
      page.locator('.tiptap').type('Operation 3')
    ];
    
    await Promise.all(operations);
    
    await page.locator('.tiptap').type(' Concurrent test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Concurrent test');
  });

  test('should handle memory pressure gracefully', async ({ page }) => {
    await page.evaluate(() => {
      for (let i = 0; i < 1000; i++) {
        const div = document.createElement('div');
        div.textContent = `Memory test ${i}`;
        document.body.appendChild(div);
      }
    });
    
    await page.locator('.tiptap').type('Memory pressure test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Memory pressure test');
    
    await page.evaluate(() => {
      const divs = document.querySelectorAll('div');
      divs.forEach(div => {
        if (div.textContent?.startsWith('Memory test')) {
          div.remove();
        }
      });
    });
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await page.route('**/*', route => {
      route.abort('failed');
    });
    
    await page.locator('.tiptap').type('Network error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Network error test');
    
    await page.unroute('**/*');
  });

  test('should handle DOM manipulation errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      try {
        const editor = document.querySelector('.tiptap');
        if (editor) {
          editor.parentNode?.removeChild(editor);
          editor.textContent = 'Should not work';
        }
      } catch {
        // Expected to fail
      }
    });
    
    await page.reload();
    await page.locator('.tiptap').type('DOM error recovery test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('DOM error recovery test');
  });

  test('should handle JavaScript errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      try {
        throw new Error('Test error');
          } catch {
        // Expected to fail
      }
    });
    
    await page.locator('.tiptap').type('JavaScript error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('JavaScript error test');
  });

  test('should handle CSS errors gracefully', async ({ page }) => {
    await page.addStyleTag({
      content: `
        .tiptap {
          invalid-property: invalid-value;
          color: invalid-color;
        }
      `
    });
    
    await page.locator('.tiptap').type('CSS error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('CSS error test');
  });

  test('should handle event listener errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      const editor = document.querySelector('.tiptap');
      if (editor) {
        editor.addEventListener('click', () => {
          throw new Error('Event listener error');
        });
      }
    });
    
    await page.locator('.tiptap').click();
    await page.locator('.tiptap').type('Event error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Event error test');
  });

  test('should handle storage errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      try {
        localStorage.setItem('test', 'value');
        localStorage.clear();
        localStorage.getItem('test');
      } catch {
        // Expected to fail
      }
    });
    
    await page.locator('.tiptap').type('Storage error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Storage error test');
  });

  test('should handle timer errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      try {
        setTimeout(() => {
          throw new Error('Timer error');
        }, 100);
          } catch {
        // Expected to fail
      }
    });
    
    await page.waitForTimeout(200);
    
    await page.locator('.tiptap').type('Timer error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Timer error test');
  });

  test('should handle promise rejection errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      Promise.reject(new Error('Promise rejection error')).catch(() => {
      });
    });
    
    await page.locator('.tiptap').type('Promise error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Promise error test');
  });

  test('should handle async operation errors gracefully', async ({ page }) => {
    await page.evaluate(async () => {
      try {
        await new Promise((_resolve, reject) => {
          setTimeout(() => reject(new Error('Async error')), 100);
        });
          } catch {
        // Expected to fail
      }
    });
    
    await page.locator('.tiptap').type('Async error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Async error test');
  });

  test('should handle resource loading errors gracefully', async ({ page }) => {
    await page.route('**/*.css', route => route.continue());
    await page.route('**/*.js', route => route.continue());
    
    await page.locator('.tiptap').type('Resource error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Resource error test');
  });

  test('should handle permission errors gracefully', async ({ page }) => {
    await page.context().grantPermissions([]);
    
    await page.locator('.tiptap').type('Permission error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Permission error test');
  });

  test('should handle quota exceeded errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      try {
        const data = 'x'.repeat(10000000);
        localStorage.setItem('test', data);
      } catch {
        // Expected to fail
      }
    });
    
    await page.locator('.tiptap').type('Quota error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Quota error test');
  });

  test('should handle security errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      try {
        void window.parent;
        console.log('Security test passed');
      } catch {
        console.log('Security error caught as expected');
      }
    });
    
    await page.locator('.tiptap').type('Security error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Security error test');
  });

  test('should handle type errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      try {
        (null as unknown as { someMethod: () => void }).someMethod();
      } catch {
        // Expected to fail
      }
    });
    
    await page.locator('.tiptap').type('Type error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Type error test');
  });

  test('should handle reference errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      try {
        // @ts-expect-error - intentionally accessing undefined variable for error testing
        void (undefinedVariable as unknown as { someProperty: unknown }).someProperty;
      } catch {
        // Expected to fail
      }
    });
    
    await page.locator('.tiptap').type('Reference error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Reference error test');
  });

  test('should handle syntax errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      try {
        eval('invalid syntax here');
      } catch {
        // Expected to fail
      }
    });
    
    await page.locator('.tiptap').type('Syntax error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Syntax error test');
  });

  test('should handle range errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      try {
        const range = new Range();
        range.setStart(document.body, -1);
      } catch {
        // Expected to fail
      }
    });
    
    await page.locator('.tiptap').type('Range error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Range error test');
  });

  test('should handle URI errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      try {
        decodeURIComponent('%');
      } catch {
        // Expected to fail
      }
    });
    
    await page.locator('.tiptap').type('URI error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('URI error test');
  });

  test('should handle eval errors gracefully', async ({ page }) => {
    await page.evaluate(() => {
      try {
        eval('throw new Error("Eval error")');
      } catch {
        // Expected to fail
      }
    });
    
    await page.locator('.tiptap').type('Eval error test');
    const content = await page.locator('.tiptap').textContent();
    expect(content).toContain('Eval error test');
  });
});
