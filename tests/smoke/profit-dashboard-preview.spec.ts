import {test,expect} from './fixtures';
import {execFileSync} from 'node:child_process';
const html=execFileSync(process.execPath,['--experimental-strip-types','scripts/render-profit-dashboard-preview.ts'],{encoding:'utf8',env:{PATH:process.env.PATH,NODE_ENV:"test"},stdio:['ignore','pipe','ignore']});
for(const width of [320,390,1440])test(`offline synthetic profit review is readable and keyboard operable at ${width}px`,async({page,context,baseURL},info)=>{
  await page.setViewportSize({width,height:900});
  await context.route(`${new URL(baseURL!).origin}/__offline-profit-review`,route=>route.fulfill({contentType:'text/html',body:html}));
  await page.goto('/__offline-profit-review');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByText('SYNTHETIC FIXTURES — NOT BUSINESS RESULTS',{exact:true})).toBeVisible();
  await expect(page.locator('#complete .metric').first()).toContainText('-₹265.00');
  await expect(page.locator('#incomplete .metric').first()).toContainText('UNKNOWN');
  await page.keyboard.press('Tab');
  const skip=page.getByRole('link',{name:'Skip to reports'});await expect(skip).toBeFocused();await skip.press('Enter');
  const summary=page.locator('#incomplete summary').filter({hasText:'Customer and service intelligence'});await summary.focus();await page.keyboard.press('Enter');
  await expect(page.locator('#incomplete').getByText('Customer lifetime value',{exact:true})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width+1);
  await page.screenshot({path:info.outputPath(`profit-${width}.png`),fullPage:true});
  await info.attach(`profit-${width}`,{path:info.outputPath(`profit-${width}.png`),contentType:'image/png'});
});
