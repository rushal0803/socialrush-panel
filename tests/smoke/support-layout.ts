import { expect, type Locator } from '@playwright/test';

export async function expectControlsSeparated(first: Locator, second: Locator) {
  const a = await first.boundingBox();
  const b = await second.boundingBox();
  expect(a, 'First control must have a rendered box').not.toBeNull();
  expect(b, 'Second control must have a rendered box').not.toBeNull();
  if (!a || !b) throw new Error('Control missing its rendered box');
  const separated = a.x + a.width <= b.x || b.x + b.width <= a.x
    || a.y + a.height <= b.y || b.y + b.height <= a.y;
  expect(separated, 'Order action and support must not overlap on either axis').toBe(true);
  for (const [label, box] of [['order action', a], ['support', b]] as const) {
    expect(box.height, `${label} minimum touch height`).toBeGreaterThanOrEqual(44);
    expect(box.width, `${label} minimum touch width`).toBeGreaterThanOrEqual(44);
  }
}

export async function expectUnobscuredControl(control: Locator) {
  await expect(control).toBeInViewport({ ratio: 1 });
  const usable = await control.evaluate(element => {
    const box = element.getBoundingClientRect();
    return [[.15, .5], [.5, .5], [.85, .5], [.5, .15], [.5, .85]].every(([x, y]) => {
      const hit = document.elementFromPoint(box.left + box.width * x, box.top + box.height * y);
      return Boolean(hit && element.contains(hit));
    });
  });
  expect(usable, 'Visible control must receive pointer events across its surface').toBe(true);
  // Playwright also checks actionability without opening WhatsApp or ordering.
  await control.click({ trial: true });
}
