export type CameraErrorKind =
  | 'permission-denied'
  | 'no-camera'
  | 'in-use'
  | 'unsupported'
  | 'init-failed';

export interface CameraHandle {
  stream: MediaStream;
  stop: () => void;
}

function mapGetUserMediaError(err: unknown): CameraErrorKind {
  const name =
    typeof err === 'object' && err !== null && 'name' in err
      ? String((err as { name: unknown }).name)
      : '';
  if (name === 'NotAllowedError' || name === 'SecurityError') return 'permission-denied';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'no-camera';
  if (name === 'NotReadableError' || name === 'AbortError') return 'in-use';
  return 'init-failed';
}

export function isCameraSupported(): boolean {
  try {
    return (
      typeof navigator !== 'undefined' &&
      !!navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  } catch {
    return false;
  }
}

export async function startCamera(videoEl: HTMLVideoElement): Promise<CameraHandle> {
  if (!isCameraSupported()) {
    throw { kind: 'unsupported' as CameraErrorKind };
  }
  let stream: MediaStream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
      audio: false,
    });
  } catch (err) {
    throw { kind: mapGetUserMediaError(err) as CameraErrorKind, cause: err };
  }
  try {
    videoEl.srcObject = stream;
    videoEl.muted = true;
    videoEl.playsInline = true;
    await videoEl.play();
  } catch (err) {
    try {
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      /* ignore */
    }
    throw { kind: 'init-failed' as CameraErrorKind, cause: err };
  }
  const stop = () => {
    try {
      stream.getTracks().forEach((t) => {
        try {
          t.stop();
        } catch {
          /* ignore */
        }
      });
    } catch {
      /* ignore */
    }
    try {
      videoEl.pause();
    } catch {
      /* ignore */
    }
    try {
      // eslint-disable-next-line no-param-reassign
      videoEl.srcObject = null;
    } catch {
      /* ignore */
    }
  };
  return { stream, stop };
}

export function getCameraError(err: unknown): CameraErrorKind {
  if (typeof err === 'object' && err !== null && 'kind' in err) {
    return (err as { kind: CameraErrorKind }).kind;
  }
  return 'init-failed';
}
