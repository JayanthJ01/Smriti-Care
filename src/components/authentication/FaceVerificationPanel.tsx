import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Camera, CheckCircle2, Loader2, RefreshCw, ScanFace, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useFaceVerification } from '../../hooks/useFaceVerification';
import { progressOf, type CameraErrorKind } from '../../services/verification/verificationMachine';
import Button from '../ui/Button';
import Card from '../ui/Card';

function errKey(k: CameraErrorKind | null): string {
  if (k === 'permission-denied') return 'auth.patient.verify.errPermission';
  if (k === 'no-camera') return 'auth.patient.verify.errNoCamera';
  if (k === 'in-use') return 'auth.patient.verify.errInUse';
  if (k === 'unsupported') return 'auth.patient.verify.errUnsupported';
  if (k === 'detector-failed') return 'auth.patient.verify.errDetector';
  return 'auth.patient.verify.errInit';
}

function Step({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div
      role="listitem"
      className={(ok ? 'border-green-600 bg-green-50 text-green-800' : 'border-line bg-white text-ink-500') +
        ' rounded-2xl border-2 p-3'}
    >
      <div className="mx-auto grid h-11 w-11 place-items-center rounded-full">
        {ok ? <CheckCircle2 size={30} aria-hidden /> : <span className="h-7 w-7 rounded-full border-4 border-current" aria-hidden />}
      </div>
      <p className="mt-1 text-[15px] font-black">{label} {ok ? '✓' : ''}</p>
    </div>
  );
}

/**
 * Phase 2 - REAL prototype Face + Movement Verification.
 * Local-only MediaPipe landmarks. No recording, no upload, no identity match.
 */
export default function FaceVerificationPanel({ onVerified }: { onVerified: () => void }) {
  const { t } = useLanguage();
  const { videoRef, snapshot, start, retry } = useFaceVerification({ autoStart: true, onSuccess: onVerified });
  const st = snapshot.state;
  const done = progressOf(st);
  const busy = st === 'idle' || st === 'camera_initializing';
  const failed = st === 'error';
  const passed = st === 'success';
  const faceOk = snapshot.facePresent || done >= 1;
  const leftOk = snapshot.leftDone || done >= 2;
  const rightOk = snapshot.rightDone || done >= 3;
  let title = t('auth.patient.verify.look');
  let sub = t('auth.patient.verify.sub');
  if (st === 'face_detected') { title = t('auth.patient.verify.faceFound'); sub = t('auth.patient.verify.turnLeftSub'); }
  else if (st === 'waiting_for_left') { title = t('auth.patient.verify.turnLeft'); sub = t('auth.patient.verify.turnLeftSub'); }
  else if (st === 'left_detected') { title = t('auth.patient.verify.leftOk'); sub = t('auth.patient.verify.turnRightSub'); }
  else if (st === 'waiting_for_right') { title = t('auth.patient.verify.turnRight'); sub = t('auth.patient.verify.turnRightSub'); }
  else if (st === 'right_detected' || passed) { title = t('auth.patient.verify.complete'); sub = t('auth.patient.verify.completeSub'); }
  else if (failed) { title = t('auth.patient.verify.retry'); sub = t(errKey(snapshot.errorKind)); }
  let hint: string | null = null;
  const guiding = st === 'waiting_for_face' || st === 'waiting_for_left' || st === 'waiting_for_right';
  if (!failed && !passed && guiding) {
    if (!snapshot.facePresent) hint = t('auth.patient.verify.hintNoFace');
    else if (snapshot.hint === 'too-far') hint = t('auth.patient.verify.hintCloser');
    else if (snapshot.hint === 'off-center') hint = t('auth.patient.verify.hintCenter');
    else if (snapshot.hint === 'multiple') hint = t('auth.patient.verify.hintMultiple');
  }
  const showLeftIcon = st === 'waiting_for_left' || st === 'left_detected';
  const showRightIcon = st === 'waiting_for_right' || st === 'right_detected';
  const stepLabel = t('auth.patient.instructionTitle');
return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-cream-50 px-5 py-4 sm:px-6">
        <div>
          <h2 className="font-display text-[24px] font-semibold text-pine-950">{t('auth.patient.cameraTitle')}</h2>
          <p className="text-[15px] font-bold text-ink-500">{t('auth.patient.cameraSub')}</p>
        </div>
        <span className="smriti-eyebrow border-marigold-300 bg-marigold-100 text-[#7A4A00]">
          <ScanFace size={16} aria-hidden /> {t('common.prototype')}
        </span>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-3xl border-2 border-pine-800/20 bg-pine-950">
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className="aspect-[4/3] w-full -scale-x-100 bg-pine-950 object-cover"
            aria-label={t('auth.patient.verify.live')}
          />
          <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-pine-950/85 px-3 py-1.5 text-[13px] font-extrabold text-white">
            <span
              className={busy
                ? 'h-2.5 w-2.5 animate-pulse rounded-full bg-marigold-400'
                : failed
                  ? 'h-2.5 w-2.5 rounded-full bg-red-400'
                  : 'h-2.5 w-2.5 animate-pulse rounded-full bg-green-400'}
              aria-hidden
            />
            {busy ? t('auth.patient.verify.loadingCamera') : failed ? t('auth.patient.verify.retry') : t('auth.patient.verify.live')}
          </div>
          <div className="pointer-events-none absolute inset-0 grid place-items-center p-6" aria-hidden>
            <div className={(faceOk ? 'border-green-300' : 'border-white/70') + ' h-52 w-40 rounded-[3rem] border-4 sm:h-60 sm:w-48'} />
          </div>
          {busy && (
            <div className="absolute inset-0 grid place-items-center bg-pine-950/45 p-6 text-center">
              <div className="rounded-3xl bg-white/95 p-5">
                <Loader2 className="mx-auto animate-spin text-pine-800" size={30} aria-hidden />
                <p className="mt-2 text-[16px] font-extrabold text-pine-950">{t('auth.patient.verify.loadingDetector')}</p>
              </div>
            </div>
          )}
          {failed && (
            <div className="absolute inset-0 grid place-items-center bg-pine-950/55 p-6 text-center">
              <div className="max-w-[320px] rounded-3xl bg-white p-5">
                <Camera size={34} className="mx-auto text-pine-800" aria-hidden />
                <p className="mt-2 text-[16px] font-extrabold text-ink-900">{t(errKey(snapshot.errorKind))}</p>
                <Button size="lg" className="mt-4 w-full" onClick={() => void retry()}>
                  <RefreshCw size={20} aria-hidden /> {t('auth.patient.verify.retry')}
                </Button>
              </div>
            </div>
          )}
          <AnimatePresence>
            {passed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 grid place-items-center bg-pine-950/55 p-6 text-center"
              >
                <div className="rounded-3xl bg-white p-6">
                  <motion.div initial={{ scale: 0.6 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}>
                    <CheckCircle2 size={54} className="mx-auto text-green-600" aria-hidden />
                  </motion.div>
                  <p className="mt-2 text-[22px] font-black text-pine-950">{t('auth.patient.verify.complete')}</p>
                  <p className="mt-1 text-[16px] font-bold text-ink-600">{t('auth.patient.verify.completeSub')}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
<div className="flex flex-col gap-4">
          <div className="rounded-3xl border border-line bg-white p-5" aria-live="polite">
            <div className="flex items-center gap-2 text-[14px] font-extrabold uppercase tracking-[0.12em] text-ink-500">
              {showLeftIcon ? <ArrowLeft size={18} aria-hidden /> : null}
              {showRightIcon ? <ArrowRight size={18} aria-hidden /> : null}
              {!showLeftIcon && !showRightIcon ? <ShieldCheck size={18} aria-hidden /> : null}
              {stepLabel}
            </div>
            <p className="mt-2 text-[24px] font-black leading-snug text-ink-900">{title}</p>
            <p className="mt-1 text-[17px] font-bold text-ink-600">{sub}</p>
            {hint && <p className="mt-3 rounded-2xl bg-cream-200/70 p-3 text-[16px] font-extrabold text-ink-800">{hint}</p>}
          </div>

          <div className="rounded-3xl border border-line bg-cream-50 p-5">
            <div className="grid grid-cols-3 gap-2 text-center" role="list" aria-label={t('auth.patient.progress')}>
              <Step ok={faceOk} label={t('auth.patient.verify.stepFace')} />
              <Step ok={leftOk} label={t('auth.patient.verify.stepLeft')} />
              <Step ok={rightOk} label={t('auth.patient.verify.stepRight')} />
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white" role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={3}>
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-pine-600 to-marigold-400"
                initial={{ width: 0 }}
                animate={{ width: `${(done / 3) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <p className="mt-3 text-[13px] font-bold leading-snug text-ink-500">{t('auth.patient.verify.privacy')}</p>
            {!busy && !passed && (
              <Button variant="ghost" size="lg" className="mt-3 w-full" onClick={() => void (failed ? retry() : start())}>
                <RefreshCw size={20} aria-hidden /> {failed ? t('auth.patient.verify.retry') : t('auth.patient.verify.start')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}