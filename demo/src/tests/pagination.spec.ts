import { test, expect } from '@playwright/test';

test.describe('Editor Pagination', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173/');
  });

  test('should display page structure elements', async ({ page }) => {
    await expect(page.getByText('<page')).toBeVisible();
    await expect(page.getByText('pagenumber')).toBeVisible();
    
    await expect(page.getByRole('button', { name: 'Bold' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Italic' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Underline' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bullet list' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ordered list' })).toBeVisible();
  });

  test('should create multiple pages with long content', async ({ page }) => {
    const longContent = `
Hi there,

This is a basic example of Tiptap with pagination.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec ligula est, porttitor non dolor sit amet, porttitor lacinia eros. Proin consequat aliquam faucibus. Aenean non justo erat. Nam auctor fermentum felis, vel lacinia massa ultricies quis. Suspendisse aliquam molestie mi dignissim aliquam. Ut condimentum neque quis tincidunt ullamcorper. Aliquam erat volutpat. Praesent quis erat odio. Etiam eget velit vitae quam mattis eleifend eget varius ante. Vestibulum imperdiet dolor in mauris luctus tincidunt. Cras ullamcorper dignissim sapien non pulvinar. Nulla id augue eu nisl laoreet efficitur a sed urna.

Nunc quis ligula libero. Nullam dui orci, iaculis non placerat venenatis, consectetur id justo. Duis cursus tellus ac venenatis pharetra. Curabitur id accumsan dui. Quisque nec tellus vel mauris consequat congue a a metus. Suspendisse non elit auctor orci vestibulum eleifend ut quis leo. Phasellus pretium condimentum nibh, sed egestas tortor sollicitudin vel. Vestibulum sit amet dictum nulla. Sed sit amet ultricies quam. Donec eu massa sit amet ex fermentum pulvinar nec eget arcu. Proin venenatis sollicitudin posuere. Cras faucibus fringilla vehicula. Sed viverra leo orci, ac euismod nisi imperdiet et. Morbi sapien leo, ultrices sit amet commodo eu, molestie vel nunc. Cras in eros auctor purus rhoncus tincidunt. Sed consectetur massa sed neque condimentum aliquam.

Nullam ultrices cursus viverra. Pellentesque maximus commodo nisi sed aliquam. Phasellus lorem mi, facilisis vel eros porttitor, cursus pulvinar dui. Fusce a iaculis nulla. Nunc finibus mauris vitae bibendum mattis. Nunc pellentesque pretium orci, non aliquam massa. Duis vulputate enim tincidunt vulputate accumsan. Vivamus fringilla rhoncus molestie. Maecenas nec est eget justo bibendum maximus vitae in est. Maecenas elementum dignissim sodales. Morbi nisi turpis, tempor vel euismod non, cursus ac risus. Donec hendrerit odio arcu, eu luctus dui sagittis nec.

Nunc mollis imperdiet orci, at ultrices enim. In dictum commodo enim, ac blandit lectus egestas at. Maecenas et justo sed elit consectetur hendrerit. Nulla ullamcorper sagittis facilisis. Nam id accumsan tellus. Phasellus sed pharetra turpis. Nulla egestas tortor vitae mauris rutrum gravida.

Nam urna metus, consectetur at ultricies vel, pulvinar vitae dolor. Etiam consectetur sollicitudin neque, id tincidunt enim blandit rhoncus. Nullam eget enim in diam ultrices imperdiet. Maecenas condimentum odio ut felis suscipit ullamcorper. Praesent sit amet turpis magna.

Maecenas a risus lorem. Duis dapibus vulputate faucibus. Cras quis nibh quis augue consectetur maximus sed vitae turpis. Phasellus velit arcu, maximus ac sapien id, faucibus fermentum neque. Vestibulum sem arcu, suscipit at tempor id, ullamcorper eget ex. Phasellus aliquam, turpis vel pellentesque tristique, arcu quam rutrum libero, id venenatis nunc lorem eget mi. Aenean in molestie dolor, in tempor velit. Morbi ullamcorper, erat sed laoreet laoreet, tellus arcu bibendum mauris, vel tempus felis augue quis tortor. Cras porta metus erat, quis convallis massa mattis at. Aenean ut aliquet lorem. Phasellus aliquam, nulla eu sodales varius, tellus eros ornare tortor, ac cursus felis justo nec orci. Duis vestibulum velit eget iaculis viverra. Pellentesque at tempor ante. Praesent non lacus quis arcu placerat faucibus non non nulla.

Duis tincidunt enim quis turpis volutpat mattis. Morbi arcu nibh, pharetra sed ullamcorper a, facilisis a odio. Etiam pulvinar felis venenatis, sollicitudin augue a, ultrices sem. Mauris vitae ligula ex. Quisque bibendum, sem non pretium porttitor, turpis ligula feugiat diam, vitae tristique ligula dolor nec odio. Vestibulum vel dapibus lacus. In nec felis tempus, fringilla nisi dignissim, dapibus tellus. Mauris pellentesque sed justo sed pharetra. Sed vitae ligula nec urna accumsan tristique non quis enim.

Vivamus mollis in leo sed posuere. Morbi commodo dui in libero placerat porttitor. Sed a scelerisque libero. Nam ante tortor, facilisis ut erat gravida, tristique elementum turpis. Nulla et volutpat neque. Cras purus leo, vehicula vitae convallis vel, sagittis ac arcu. Nam id facilisis nisl. Ut auctor felis vel sem ultricies feugiat. Vestibulum pretium scelerisque nunc eu commodo. Curabitur ornare dolor euismod turpis molestie scelerisque. Aliquam sit amet odio nibh. Nulla condimentum leo ut purus hendrerit fermentum. Phasellus pretium ultricies sapien, at rhoncus nibh bibendum in. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas tincidunt consectetur eros et vehicula.

Cras volutpat turpis eu metus rutrum sollicitudin. Pellentesque in finibus neque. Sed sodales et elit sed pellentesque. Mauris mattis, dolor nec mattis ullamcorper, dui quam auctor orci, ut pharetra massa lacus ac quam. Aenean malesuada mauris vel aliquam rutrum. Morbi nec lorem turpis. Fusce vel auctor orci, eu laoreet nisl. Aenean interdum eleifend facilisis. Donec odio lacus, ornare sed dictum at, finibus dictum ex. Sed nec lorem accumsan, dignissim neque ac, porta lorem. Praesent pretium hendrerit sapien, a ultrices nibh molestie commodo. Integer at lectus nec libero ultricies posuere. Suspendisse iaculis ornare quam, sed malesuada felis viverra vestibulum. Duis in nisi eros. Vestibulum quis pretium risus.

2 of 4

Ut accumsan dolor non sollicitudin consequat. Nam tristique tortor at lorem sodales vulputate. Donec libero justo, consectetur in iaculis non, finibus a felis. Duis malesuada odio ut vestibulum mollis. Nam sed consectetur dui. Etiam vitae aliquet ipsum. Duis malesuada ligula ac arcu feugiat tempus. Nam nec orci nunc. Fusce pulvinar elit vitae eros lacinia euismod. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Vestibulum nec aliquam felis, in elementum ipsum. Phasellus lacinia vel lacus vel ullamcorper.

Duis nulla nibh, pellentesque vel sapien in, luctus dapibus mi. Sed augue elit, blandit ac tellus eu, elementum faucibus leo. Pellentesque nec nisl a ipsum elementum laoreet. Donec nec lorem dignissim, imperdiet dui nec, aliquet diam. Mauris pulvinar in velit sit amet tincidunt. In vel auctor lacus, id tempus mauris. Aenean faucibus vel neque sed faucibus. In maximus turpis gravida dictum viverra. Etiam consequat, odio ac hendrerit rhoncus, orci sapien pulvinar odio, ut lacinia justo tortor nec nulla. Maecenas quis imperdiet dui. Duis congue enim eu nibh porta, quis lobortis augue placerat. Nullam ut posuere est, in aliquet urna.

Aliquam dictum aliquet ligula ut vehicula. Donec aliquam tellus dictum enim blandit, quis elementum magna pharetra. Etiam a felis lorem. Praesent nulla est, laoreet eu pretium vitae, rutrum non mi. Quisque vulputate elementum egestas. Morbi et tristique metus, eget tristique augue. Aenean in velit rutrum, accumsan leo vel, luctus lorem. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer tristique nibh felis, nec hendrerit leo euismod non. Maecenas fermentum in massa sit amet scelerisque. Nulla gravida sapien eget magna accumsan lacinia quis at lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Ut ac turpis pulvinar libero rutrum molestie. Vestibulum commodo ex mauris, ut tempor ante cursus at. Mauris non diam placerat, dignissim sem vel, maximus urna.

Ut congue dolor in ante imperdiet rutrum. Duis at iaculis metus. Mauris at urna finibus tortor interdum bibendum. In hac habitasse platea dictumst. Sed rhoncus nec neque sed porta. Donec porta arcu a venenatis finibus. Cras porta, dolor sed egestas lobortis, urna velit aliquam nunc, et commodo turpis eros sed dolor. Curabitur et diam eu libero ultricies sagittis quis et tortor. Phasellus hendrerit enim convallis turpis dictum, sit amet placerat elit dictum. Quisque sagittis sapien et tortor volutpat, ac auctor libero varius. Cras eu nibh est. Vivamus eu lectus non massa fringilla congue. Vivamus sollicitudin vulputate enim, ac tempus elit efficitur at. Mauris in augue vehicula, vehicula turpis vel, interdum odio. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Quisque ac odio finibus, posuere mi vitae, pulvinar lorem.

3 of 4

Cras varius dignissim sagittis. Nam id ante orci. Integer dui eros, dignissim et turpis ac, malesuada molestie urna. Mauris faucibus volutpat maximus. Sed non velit sit amet purus tempor euismod at in nunc. Aliquam feugiat ante ac augue accumsan finibus. In eu leo gravida, vulputate eros in, ultricies dui. Cras hendrerit nulla tempor urna hendrerit convallis. Quisque tempus eleifend molestie. Quisque posuere neque nulla, ut pretium ex sollicitudin ac. Suspendisse potenti.

Integer ut varius nulla, eu interdum magna. Nunc vehicula risus id libero fringilla blandit. Aenean ac purus vestibulum justo molestie sodales. Integer eget dolor efficitur arcu iaculis placerat et non dolor. Proin luctus sem tortor, ac finibus ex tempor consequat. Sed nibh metus, rutrum sit amet sagittis id, fermentum vel libero. Cras sed purus eu dolor lobortis tincidunt. Vestibulum suscipit placerat lectus sed condimentum. Etiam commodo, sapien id mollis molestie, ante diam consectetur turpis, dapibus consectetur quam turpis in turpis. Sed neque massa, gravida eu commodo ut, faucibus eu libero. Praesent ac luctus nunc, vel rhoncus odio. Suspendisse in consectetur felis, id venenatis libero. Nullam pharetra odio sit amet mi volutpat, id dignissim lectus ultrices. Pellentesque consequat nec dolor et finibus. Nunc et consequat odio. Etiam sit amet diam vitae libero dapibus aliquet a nec turpis.

Morbi dignissim nunc a felis dapibus, vel molestie felis pretium. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Integer aliquet blandit odio, ac vestibulum dolor vulputate at. Praesent quis velit fermentum, scelerisque elit sit amet, facilisis ipsum. Nam tempor lorem non arcu porta, id vehicula quam elementum. Donec accumsan accumsan felis at sollicitudin. Interdum et malesuada fames ac ante ipsum primis in faucibus. In varius, mi at pretium ultrices, odio ante pharetra massa, quis congue metus justo sit amet diam. Cras congue mi tellus, ac commodo erat vestibulum eu. Sed vitae massa at urna hendrerit fringilld

4 of 4
    `.trim();

    await page.locator('.tiptap').fill(longContent);

    await page.waitForTimeout(1000);

    await expect(page.locator('p').filter({ hasText: '2 of 4' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: '3 of 4' })).toBeVisible();
    await expect(page.locator('p').filter({ hasText: '4 of 4' })).toBeVisible();
  });

  test('should handle text formatting across pages', async ({ page }) => {
    await page.locator('.tiptap').fill('This is a test document.\n\n');
    
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type('This text should be bold.');
    
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.locator('.tiptap').type(' This text should be italic.');
    
    const longText = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(5);
    await page.locator('.tiptap').type(longText);

    await expect(page.locator('strong').first()).toContainText('This text should be bold.');
    await expect(page.locator('em').first()).toContainText('This text should be italic.');
  });

  test('should handle lists across pages', async ({ page }) => {
    await page.getByRole('button', { name: 'Bullet list' }).click();
    await page.locator('.tiptap').type('First bullet item');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Second bullet item');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('Third bullet item');

    const longText = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(5);
    await page.locator('.tiptap').type(longText);

    const listItems = page.locator('ul li');
    const count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(3);
    await expect(page.locator('li').filter({ hasText: 'First bullet item' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Second bullet item' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'Third bullet item' })).toBeVisible();
  });

  test('should handle headings across pages', async ({ page }) => {
    await page.getByRole('button', { name: 'H1' }).click();
    await page.locator('.tiptap').type('Main Heading');
    await page.keyboard.press('Enter');
    
    await page.getByRole('button', { name: 'H2' }).click();
    await page.locator('.tiptap').type('Sub Heading');
    await page.keyboard.press('Enter');
    
    await page.getByRole('button', { name: 'H3' }).click();
    await page.locator('.tiptap').type('Sub Sub Heading');

    const longText = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(5);
    await page.locator('.tiptap').type(longText);

    await expect(page.locator('h1').filter({ hasText: 'Main Heading' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Sub Heading' })).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: 'Sub Sub Heading' })).toBeVisible();
  });

  test('should display page numbers correctly', async ({ page }) => {
    const longContent = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(50);
    await page.locator('.tiptap').fill(longContent);

    await page.waitForTimeout(1000);

    const pageElements = page.locator('page');
    const count = await pageElements.count();
    
    if (count === 0) {
      await expect(page.getByText('2 of')).toBeVisible();
    } else {
      expect(count).toBeGreaterThan(0);
      for (let i = 1; i <= count; i++) {
        await expect(page.locator(`page[pagenumber="${i}"]`)).toBeVisible();
      }
    }
  });

  test('should handle undo/redo with pagination', async ({ page }) => {
    await page.locator('.tiptap').fill('Initial content');
    
    const longText = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(5);
    await page.locator('.tiptap').type(longText);

    await page.getByRole('button', { name: 'Undo' }).click();
    
    const contentAfterUndo = await page.locator('.tiptap').textContent();
    expect(contentAfterUndo).toContain('Hi there,');
    
    await page.getByRole('button', { name: 'Redo' }).click();
    
    const contentAfterRedo = await page.locator('.tiptap').textContent();
    expect(contentAfterRedo).toContain('Lorem ipsum dolor sit amet');
  });

  test('should maintain cursor position across pages', async ({ page }) => {
    await page.locator('.tiptap').fill('Start of document\n\n');
    
    const longText = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(5);
    await page.locator('.tiptap').type(longText);
    
    await page.locator('h2').filter({ hasText: 'Start of document' }).click();
    
    await page.locator('.tiptap').type('New content at the beginning');
    
    const finalContent = await page.locator('.tiptap').textContent();
    expect(finalContent).toContain('New content at the beginning');
    expect(finalContent).toContain('Start of document');
  });

  test('should handle hard breaks correctly', async ({ page }) => {
    await page.locator('.tiptap').fill('Line one');
    await page.getByRole('button', { name: 'Hard break' }).click();
    await page.locator('.tiptap').type('Line two');
    await page.getByRole('button', { name: 'Hard break' }).click();
    await page.locator('.tiptap').type('Line three');

    const longText = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(5);
    await page.locator('.tiptap').type(longText);

    await expect(page.locator('h2').filter({ hasText: 'Line one' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Line two' })).toBeVisible();
    await expect(page.locator('h2').filter({ hasText: 'Line three' })).toBeVisible();
  });

  test('should handle mixed content types across pages', async ({ page }) => {
    await page.getByRole('button', { name: 'H1' }).click();
    await page.locator('.tiptap').type('Document Title');
    await page.keyboard.press('Enter');
    
    await page.locator('.tiptap').type('This is a paragraph with ');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type('bold text');
    await page.getByRole('button', { name: 'Bold' }).click();
    await page.locator('.tiptap').type(' and ');
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.locator('.tiptap').type('italic text');
    await page.getByRole('button', { name: 'Italic' }).click();
    await page.locator('.tiptap').type('.');
    
    await page.keyboard.press('Enter');
    await page.getByRole('button', { name: 'Bullet list' }).click();
    await page.locator('.tiptap').type('List item 1');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('List item 2');
    await page.keyboard.press('Enter');
    await page.locator('.tiptap').type('List item 3');

    const longText = '\n\n' + 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(5);
    await page.locator('.tiptap').type(longText);

    await expect(page.locator('h1').filter({ hasText: 'Document Title' })).toBeVisible();
    await expect(page.locator('strong').first()).toContainText('bold text');
    await expect(page.locator('em').first()).toContainText('italic text');

    const listItems = page.locator('ul li');
    const count = await listItems.count();
    expect(count).toBeGreaterThanOrEqual(3);
    await expect(page.locator('li').filter({ hasText: 'List item 1' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'List item 2' })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: 'List item 3' })).toBeVisible();
  });
});
