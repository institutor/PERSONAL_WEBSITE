"use client";

/**
 * v1 preload animation (recovered package, adapted):
 *  - canvas-drawn "by Jiewen" cursive + a checkmark sweeping THROUGH it
 *  - restyled to the site's two colors (ink bg owned by the parent overlay)
 *  - a11y handled by the parent [data-loader] progressbar, so this renders
 *    purely decorative
 */
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import {
  checkmarkStroke,
  signatureStrokes,
  type BezierCurve,
  type Stroke,
} from "@/lib/v1/signature-path";
import {
  cancelLoaderWork,
  resolveLoaderPhase,
  type LoaderPhase,
  type LoaderScheduledWork,
} from "@/lib/v1/loader-state";

export type SignatureLoaderProps = {
  fontsReady: boolean;
  imageReady: boolean;
  rendererReady: boolean;
  onComplete?: () => void;
};

function clampUnit(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function cubicCoordinate(
  start: number,
  control1: number,
  control2: number,
  end: number,
  progress: number,
): number {
  const remaining = 1 - progress;

  return (
    remaining ** 3 * start
    + 3 * remaining ** 2 * progress * control1
    + 3 * remaining * progress ** 2 * control2
    + progress ** 3 * end
  );
}

function estimateStrokeLength(
  stroke: Stroke,
  width: number,
  height: number,
): number {
  let [startX, startY] = stroke.start;
  let length = 0;

  for (const curve of stroke.curves) {
    let previousX = startX * width;
    let previousY = startY * height;

    for (let sample = 1; sample <= 12; sample += 1) {
      const progress = sample / 12;
      const nextX = cubicCoordinate(startX, curve[0], curve[2], curve[4], progress) * width;
      const nextY = cubicCoordinate(startY, curve[1], curve[3], curve[5], progress) * height;

      length += Math.hypot(nextX - previousX, nextY - previousY);
      previousX = nextX;
      previousY = nextY;
    }

    startX = curve[4];
    startY = curve[5];
  }

  return length;
}

function traceStroke(
  context: CanvasRenderingContext2D,
  stroke: Stroke,
  width: number,
  height: number,
): void {
  context.beginPath();
  context.moveTo(stroke.start[0] * width, stroke.start[1] * height);

  for (const curve of stroke.curves) {
    const [control1X, control1Y, control2X, control2Y, endX, endY] = curve as BezierCurve;

    context.bezierCurveTo(
      control1X * width,
      control1Y * height,
      control2X * width,
      control2Y * height,
      endX * width,
      endY * height,
    );
  }
}

function drawStroke(
  context: CanvasRenderingContext2D,
  stroke: Stroke,
  elapsedMs: number,
  reducedMotion: boolean,
  width: number,
  height: number,
  color: string,
): void {
  const progress = reducedMotion
    ? 1
    : clampUnit((elapsedMs - stroke.startsAtMs) / (stroke.endsAtMs - stroke.startsAtMs));

  if (progress === 0) {
    return;
  }

  const length = estimateStrokeLength(stroke, width, height);
  traceStroke(context, stroke, width, height);
  context.strokeStyle = color;
  context.lineWidth = Math.max(1.5, Math.min(width, height) * stroke.width);
  context.setLineDash([length, length]);
  context.lineDashOffset = length * (1 - progress);
  context.stroke();
}

function drawSignature(
  canvas: HTMLCanvasElement,
  elapsedMs: number,
  reducedMotion: boolean,
): void {
  const context = canvas.getContext("2d");
  if (!context) {
    return;
  }

  const bounds = canvas.getBoundingClientRect();
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  const pixelWidth = Math.max(1, Math.round(bounds.width * pixelRatio));
  const pixelHeight = Math.max(1, Math.round(bounds.height * pixelRatio));

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  context.clearRect(0, 0, bounds.width, bounds.height);
  context.lineCap = "round";
  context.lineJoin = "round";

  const styles = window.getComputedStyle(canvas);
  const signatureColor = styles.getPropertyValue("--loader-signature").trim() || "#e8e3d8";
  const checkColor = styles.getPropertyValue("--loader-check").trim() || "rgba(232,227,216,0.55)";

  for (const stroke of signatureStrokes) {
    drawStroke(context, stroke, elapsedMs, reducedMotion, bounds.width, bounds.height, signatureColor);
  }

  drawStroke(context, checkmarkStroke, elapsedMs, reducedMotion, bounds.width, bounds.height, checkColor);
}

export function SignatureLoader({
  fontsReady,
  imageReady,
  rendererReady,
  onComplete,
}: SignatureLoaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startedAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const phaseRef = useRef<LoaderPhase>("drawing");
  const onCompleteRef = useRef(onComplete);
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<LoaderPhase>("drawing");

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || completedRef.current) {
      return;
    }

    const startedAt = startedAtRef.current ?? window.performance.now();
    startedAtRef.current = startedAt;

    const scheduledWork: LoaderScheduledWork = {
      animationFrame: null,
      completionTimer: null,
    };
    const cancelScheduledWork = () => {
      cancelLoaderWork(
        scheduledWork,
        window.cancelAnimationFrame.bind(window),
        window.clearTimeout.bind(window),
      );
    };

    const finish = (elapsedMs: number) => {
      if (completedRef.current) {
        return;
      }

      cancelScheduledWork();
      completedRef.current = true;
      drawSignature(canvas, elapsedMs, reducedMotion);
      phaseRef.current = "complete";
      setPhase("complete");
      onCompleteRef.current?.();
    };

    const renderFrame = (timestamp: number) => {
      scheduledWork.animationFrame = null;
      const elapsedMs = Math.max(0, timestamp - startedAt);
      const nextPhase = resolveLoaderPhase({
        elapsedMs,
        fontsReady,
        imageReady,
        rendererReady,
        reducedMotion,
      });

      drawSignature(canvas, elapsedMs, reducedMotion);

      if (nextPhase === "complete") {
        finish(elapsedMs);
        return;
      }

      if (nextPhase !== phaseRef.current) {
        phaseRef.current = nextPhase;
        setPhase(nextPhase);
      }

      scheduledWork.animationFrame = window.requestAnimationFrame(renderFrame);
    };

    const assetsReady = fontsReady && imageReady && rendererReady;
    const deadlineMs = reducedMotion ? 300 : assetsReady ? 1600 : 3000;
    const elapsedAtSetup = Math.max(0, window.performance.now() - startedAt);

    scheduledWork.completionTimer = window.setTimeout(() => {
      scheduledWork.completionTimer = null;
      finish(deadlineMs);
    }, Math.max(0, deadlineMs - elapsedAtSetup));
    scheduledWork.animationFrame = window.requestAnimationFrame(renderFrame);

    return cancelScheduledWork;
  }, [fontsReady, imageReady, reducedMotion, rendererReady]);

  if (phase === "complete") {
    return null;
  }

  return (
    <div className="signature-loader" data-phase={phase} aria-hidden="true">
      <canvas ref={canvasRef} className="signature-loader__canvas" />
    </div>
  );
}
