import type { Locator } from '@playwright/test';

/**
 * React has committed this element (the live() test of lib/early-clicks; a fiber alone is still the render phase).
 * networkidle comes long before a code-split section hydrates on a slow runner (4x CPU: 3.6 s vs 8 - 9 s): a test that
 * is about a feature, not about early taps (tests/r24), waits for this before it presses or hovers.
 */
export const reactLive = (l: Locator) =>
  l.evaluate((el) => {
    type Fiber = { tag: number; flags: number; return: Fiber | null; alternate: Fiber | null };
    const key = Object.keys(el).find((k) => k.startsWith('__reactFiber$'));
    if (!key) return false;
    const fiber = (el as unknown as Record<string, Fiber>)[key];
    let node = fiber;
    let nearest: Fiber | null = fiber;
    if (fiber.alternate) while (node.return) node = node.return;
    else
      for (let f: Fiber | null = fiber; f; f = f.return) {
        node = f;
        if (node.flags & 4098) nearest = node.return;
      }
    return node.tag === 3 && nearest === fiber;
  });
