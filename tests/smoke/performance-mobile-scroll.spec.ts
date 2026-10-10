import { test, expect } from "./fixtures";

for (const path of ["/", "/services", "/packages", "/buy-instagram-followers-india"]) {
  test(`mobile scrolling keeps stable layout on ${path}`, async ({ page, context }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width:390, height:844 });
    await page.addInitScript(() => {
      (window as unknown as { scrollShifts:number[] }).scrollShifts=[];
      new PerformanceObserver(list => {
        for (const entry of list.getEntries()) {
          const shift=entry as PerformanceEntry & { hadRecentInput:boolean; value:number };
          if (!shift.hadRecentInput) (window as unknown as { scrollShifts:number[] }).scrollShifts.push(shift.value);
        }
      }).observe({type:"layout-shift",buffered:true});
    });
    const cdp=await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});
    await page.goto(path,{waitUntil:"load"});
    await page.waitForTimeout(1000);
    for (let step=0;step<160;step++) {
      const bottom=await page.evaluate(() => { scrollBy(0,420); return scrollY+innerHeight>=document.documentElement.scrollHeight-2; });
      await page.waitForTimeout(60);
      if(bottom)break;
    }
    await page.locator("footer").scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);
    const sum=await page.evaluate(() => (window as unknown as {scrollShifts:number[]}).scrollShifts.reduce((a,b)=>a+b,0));
    console.log(`${path} accumulated layout shifts including scroll: ${sum}`);
    expect(sum).toBeLessThanOrEqual(.1);
  });
}
