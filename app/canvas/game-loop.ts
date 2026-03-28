import { PIXEL_SCALE, FRAME_BUDGET_MS } from './constants';
import type { SimulationSnapshot, AnimationState, LayerDrawFn, RenderContext } from './types';

export function createGameLoop(
  canvas: HTMLCanvasElement,
  getSnapshot: () => SimulationSnapshot,
  getAnimationState: () => AnimationState,
  layers: LayerDrawFn[]
): { start: () => void; stop: () => void } {
  const maybeCtx = canvas.getContext('2d');
  if (!maybeCtx) {
    throw new Error('Failed to get 2D context from canvas');
  }
  const ctx: CanvasRenderingContext2D = maybeCtx;

  let rafId: number | null = null;
  let lastRenderTime = 0;

  function frame(time: number) {
    const deltaTime = time - lastRenderTime;

    if (deltaTime < FRAME_BUDGET_MS * 0.8) {
      rafId = requestAnimationFrame(frame);
      return;
    }

    lastRenderTime = time;

    const rc: RenderContext = {
      ctx,
      time,
      deltaTime,
      simulationSnapshot: getSnapshot(),
      animationState: getAnimationState(),
    };

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.scale(PIXEL_SCALE, PIXEL_SCALE);

    for (const draw of layers) {
      draw(rc);
    }

    ctx.restore();
    rafId = requestAnimationFrame(frame);
  }

  return {
    start: () => {
      lastRenderTime = performance.now();
      rafId = requestAnimationFrame(frame);
    },
    stop: () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = null;
    },
  };
}
