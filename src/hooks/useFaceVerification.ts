import { useCallback, useEffect, useRef, useState } from 'react';
import { getCameraError, startCamera, type CameraHandle } from '../services/camera/cameraService';
import { FACE_DETECTION_CONFIG, HEAD_MOVEMENT_CONFIG } from '../services/verification/verificationConfig';
import { INITIAL_SNAPSHOT, type CameraErrorKind, type VerificationSnapshot, type VerificationState } from '../services/verification/verificationMachine';

const YAW_SCALE = 4.5;
function yawOf(lm: Array<{ x: number; y: number }>): number {
  try {
    const L = lm[234]; const R = lm[454]; const N = lm[1] ?? lm[4] ?? lm[0];
    if (!L || !R || !N) return 0;
    const w = Math.max(1e-6, R.x - L.x);
    return (((L.x + R.x) / 2 - N.x) / Math.abs(w)) * YAW_SCALE;
  } catch { return 0; }
}
function boxOf(lm: Array<{ x: number; y: number }>): { w: number; cx: number } {
  let a = 1; let b = 0;
  for (let i = 0; i < lm.length; i += 4) {
    const x = lm[i]?.x; if (typeof x !== 'number') continue;
    if (x < a) a = x; if (x > b) b = x;
  }
  return { w: Math.max(0, b - a), cx: (a + b) / 2 };
}
type Detector = { detectForVideo: (v: HTMLVideoElement, t: number) => { faceLandmarks?: Array<Array<{ x: number; y: number }>> }; close?: () => void };
export function useFaceVerification(o: { autoStart?: boolean; onSuccess?: () => void } = {}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hRef = useRef<CameraHandle | null>(null);
  const dRef = useRef<Detector | null>(null);
  const loopRef = useRef<number | null>(null);
  const stepRef = useRef<number | null>(null);
  const leftN = useRef(0); const rightN = useRef(0);
  const yawS = useRef(0); const stRef = useRef<VerificationState>('idle');
  const live = useRef(true); const done = useRef(false); const busy = useRef(false);
  const [snap, setSnap] = useState<VerificationSnapshot>(INITIAL_SNAPSHOT);
  const [ready, setReady] = useState(false);
  const onSuccessRef = useRef(o.onSuccess);
  onSuccessRef.current = o.onSuccess;
  const patch = useCallback((p: Partial<VerificationSnapshot>) => {
    if (!live.current) return;
    setSnap((prev) => { const n = { ...prev, ...p }; stRef.current = n.state; return n; });
  }, []);
  const clearT = useCallback(() => {
    if (loopRef.current !== null) { window.clearTimeout(loopRef.current); loopRef.current = null; }
    if (stepRef.current !== null) { window.clearTimeout(stepRef.current); stepRef.current = null; }
  }, []);
  const stopCamera = useCallback(() => {
    clearT();
    try { dRef.current?.close?.(); } catch { /* noop */ }
    dRef.current = null; setReady(false);
    try { hRef.current?.stop(); } catch { /* noop */ }
    hRef.current = null;
  }, [clearT]);
  const fail = useCallback((k: CameraErrorKind) => {
    patch({ state: 'error', errorKind: k, facePresent: false, hint: 'none' });
  }, [patch]);
  const stepLater = useCallback((fn: () => void, ms: number) => {
    if (stepRef.current !== null) window.clearTimeout(stepRef.current);
    stepRef.current = window.setTimeout(() => { if (live.current) fn(); }, ms);
  }, []);
  const loop = useCallback(() => {
    if (!live.current) return;
    if (loopRef.current !== null) window.clearTimeout(loopRef.current);
    loopRef.current = window.setTimeout(() => {
      if (!live.current) return;
      const v = videoRef.current; const d = dRef.current; const s = stRef.current;
      const on = s === 'waiting_for_face' || s === 'face_detected' || s === 'waiting_for_left' || s === 'left_detected' || s === 'waiting_for_right' || s === 'right_detected';
      if (!v || !d || !on) { loop(); return; }
      if (v.readyState < 2 || v.videoWidth === 0) { loop(); return; }
      let faces: Array<Array<{ x: number; y: number }>> = [];
      try { faces = (d.detectForVideo(v, performance.now())?.faceLandmarks ?? []) as Array<Array<{ x: number; y: number }>>; }
      catch { loop(); return; }
      if (faces.length === 0) {
        leftN.current = 0; rightN.current = 0;
        setSnap((p) => (!p.facePresent && p.hint === 'none' ? p : { ...p, facePresent: false, hint: 'none' }));
        loop(); return;
      }
      if (faces.length > FACE_DETECTION_CONFIG.maxFaces) {
        leftN.current = 0; rightN.current = 0;
        setSnap((p) => (p.hint === 'multiple' ? p : { ...p, facePresent: true, hint: 'multiple' }));
        loop(); return;
      }
      const lm = faces[0]; const { w, cx } = boxOf(lm);
      let hint: VerificationSnapshot['hint'] = 'ok';
      if (w < FACE_DETECTION_CONFIG.minFaceWidthFraction) hint = 'too-far';
      else if (Math.abs(cx - 0.5) > FACE_DETECTION_CONFIG.centerToleranceFraction) hint = 'off-center';
      const raw = yawOf(lm); const al = HEAD_MOVEMENT_CONFIG.smoothingAlpha;
      yawS.current = al * yawS.current + (1 - al) * raw;
      const yaw = yawS.current; const cur = stRef.current;
      if (cur === 'waiting_for_face') {
        if (hint === 'ok') {
          leftN.current = 0; rightN.current = 0;
          patch({ state: 'face_detected', facePresent: true, hint: 'ok', yaw });
          stepLater(() => { if (stRef.current === 'face_detected') patch({ state: 'waiting_for_left' }); }, 900);
        } else setSnap((p) => ({ ...p, facePresent: true, hint, yaw }));
        loop(); return;
      }
      if (cur === 'waiting_for_left') {
        if (hint !== 'ok') { leftN.current = 0; setSnap((p) => ({ ...p, facePresent: true, hint, yaw })); loop(); return; }
        leftN.current = yaw <= -HEAD_MOVEMENT_CONFIG.leftYawThreshold ? leftN.current + 1 : 0;
        if (leftN.current >= HEAD_MOVEMENT_CONFIG.requiredConsecutiveFrames) {
          leftN.current = 0;
          patch({ state: 'left_detected', facePresent: true, hint: 'ok', leftDone: true, yaw });
          stepLater(() => { if (stRef.current === 'left_detected') patch({ state: 'waiting_for_right' }); }, 1000);
        } else setSnap((p) => ({ ...p, facePresent: true, hint, yaw }));
        loop(); return;
      }
      if (cur === 'waiting_for_right') {
        if (hint !== 'ok') { rightN.current = 0; setSnap((p) => ({ ...p, facePresent: true, hint, yaw })); loop(); return; }
        rightN.current = yaw >= HEAD_MOVEMENT_CONFIG.rightYawThreshold ? rightN.current + 1 : 0;
        if (rightN.current >= HEAD_MOVEMENT_CONFIG.requiredConsecutiveFrames) {
          rightN.current = 0;
          patch({ state: 'right_detected', facePresent: true, hint: 'ok', rightDone: true, yaw });
          stepLater(() => {
            if (stRef.current !== 'right_detected') return;
            patch({ state: 'success' });
            if (!done.current) {
              done.current = true;
              window.setTimeout(() => { try { onSuccessRef.current?.(); } catch { /* noop */ } }, 1400);
            }
          }, 800);
        } else setSnap((p) => ({ ...p, facePresent: true, hint, yaw }));
        loop(); return;
      }
      setSnap((p) => ({ ...p, facePresent: true, hint, yaw }));
      loop();
    }, FACE_DETECTION_CONFIG.detectIntervalMs);
  }, [patch, stepLater]);
  const start = useCallback(async () => {
    if (busy.current) return;
    const v = videoRef.current;
    if (!v) { fail('init-failed'); return; }
    busy.current = true; done.current = false;
    leftN.current = 0; rightN.current = 0; yawS.current = 0; clearT();
    patch({ state: 'camera_initializing', errorKind: null, facePresent: false, leftDone: false, rightDone: false, hint: 'none', yaw: 0 });
    try {
      const h = await startCamera(v);
      if (!live.current) { try { h.stop(); } catch { /* noop */ } busy.current = false; return; }
      hRef.current = h;
    } catch (e) { busy.current = false; fail(getCameraError(e) as CameraErrorKind); return; }
    try {
      if (!dRef.current) {
        const m = await import('@mediapipe/tasks-vision');
        const fs = await m.FilesetResolver.forVisionTasks(FACE_DETECTION_CONFIG.wasmBasePath);
        const lm = await m.FaceLandmarker.createFromOptions(fs, {
          baseOptions: { modelAssetPath: FACE_DETECTION_CONFIG.modelAssetPath, delegate: 'GPU' },
          runningMode: 'VIDEO', numFaces: 2,
          minFaceDetectionConfidence: FACE_DETECTION_CONFIG.minPresenceScore,
          minFacePresenceConfidence: FACE_DETECTION_CONFIG.minPresenceScore,
          minTrackingConfidence: 0.4,
        });
        dRef.current = lm as unknown as Detector;
        if (live.current) setReady(true);
      }
    } catch { try { hRef.current?.stop(); } catch { /* noop */ } hRef.current = null; busy.current = false; fail('detector-failed'); return; }
    if (!live.current) { busy.current = false; return; }
    busy.current = false;
    patch({ state: 'waiting_for_face', facePresent: false, hint: 'none' });
    loop();
  }, [clearT, fail, loop, patch]);
  const retry = useCallback(async () => {
    stopCamera();
    await new Promise((r) => window.setTimeout(r, 250));
    if (live.current) await start();
  }, [start, stopCamera]);
  useEffect(() => {
    live.current = true;
    if (o.autoStart) { const id = window.setTimeout(() => { void start(); }, 350); return () => window.clearTimeout(id); }
    return () => {};
  }, [o.autoStart, start]);
  useEffect(() => () => {
    live.current = false; clearT();
    try { hRef.current?.stop(); } catch { /* noop */ }
    hRef.current = null;
    try { dRef.current?.close?.(); } catch { /* noop */ }
    dRef.current = null;
  }, [clearT]);
  return { videoRef, snapshot: snap, detectorReady: ready, start, retry, stopCamera };
}
