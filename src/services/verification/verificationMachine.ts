/**
 * Explicit Phase 2 verification state machine.
 * idle -> camera_initializing -> waiting_for_face -> face_detected
 * -> waiting_for_left -> left_detected -> waiting_for_right
 * -> right_detected -> success ; plus error / retry.
 */
export type VerificationState =
  | 'idle'
  | 'camera_initializing'
  | 'waiting_for_face'
  | 'face_detected'
  | 'waiting_for_left'
  | 'left_detected'
  | 'waiting_for_right'
  | 'right_detected'
  | 'success'
  | 'error';

export type FaceQualityHint = 'none' | 'ok' | 'too-far' | 'off-center' | 'multiple';

export type CameraErrorKind =
  | 'permission-denied'
  | 'no-camera'
  | 'in-use'
  | 'unsupported'
  | 'init-failed'
  | 'detector-failed';

export interface VerificationSnapshot {
  state: VerificationState;
  facePresent: boolean;
  leftDone: boolean;
  rightDone: boolean;
  hint: FaceQualityHint;
  errorKind: CameraErrorKind | null;
  yaw: number;
  detail: string;
}

export const INITIAL_SNAPSHOT: VerificationSnapshot = {
  state: 'idle',
  facePresent: false,
  leftDone: false,
  rightDone: false,
  hint: 'none',
  errorKind: null,
  yaw: 0,
  detail: '',
};

export function progressOf(state: VerificationState): 0 | 1 | 2 | 3 {
  switch (state) {
    case 'left_detected':
    case 'waiting_for_right':
      return 2;
    case 'right_detected':
    case 'success':
      return 3;
    case 'face_detected':
    case 'waiting_for_left':
      return 1;
    default:
      return 0;
  }
}
