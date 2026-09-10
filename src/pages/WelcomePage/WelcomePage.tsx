import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, HeartHandshake, Leaf, ShieldCheck, Volume2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { staggerParent, cardVariants } from '../../utils/motion';
import AppShell from '../../components/shared/AppShell';
import Button from '../../components/ui/Button';

export default function WelcomePage() {
  const { t } = useLanguage();

  return (
    <AppShell>
      <div className="smriti-shell grid gap-6 py-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:py-8">
        <motion.div variants={staggerParent} initial="hidden" animate="show" className="space-y-5">
          <motion.div variants={cardVariants}>
            <span className="smriti-eyebrow border-pine-600/25 bg-pine-50 text-pine-800">
              <Leaf size={15} aria-hidden /> {t('welcome.eyebrow')}
            </span>
            <h1 className="smriti-h-display mt-4 max-w-[16ch] text-balance text-[40px] text-pine-950 sm:text-[52px] lg:text-[58px]">
              {t('welcome.title')}
            </h1>
            <p className="mt-3 max-w-[52ch] text-balance text-[19px] font-semibold leading-relaxed text-ink-600">
              {t('welcome.subtitle')}
            </p>
          </motion.div>

          <motion.div variants={cardVariants} className="grid gap-3 sm:grid-cols-2">
            <Link
              to="/auth/patient"
              className="smriti-card-cream group block p-6 transition hover:-translate-y-0.5 hover:shadow-card-lg"
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-pine-800 text-white">
                <HeartHandshake size={28} aria-hidden />
              </span>
              <span className="mt-3 block font-display text-[28px] font-semibold text-pine-950">
                {t('welcome.patient')}
              </span>
              <span className="mt-1 block text-[16px] font-bold text-ink-600">{t('welcome.patientSub')}</span>
              <span className="smriti-btn smriti-btn-amber smriti-btn-lg mt-4 w-full">
                {t('welcome.patient')} <ArrowRight size={22} aria-hidden />
              </span>
            </Link>

            <Link
              to="/auth/caregiver"
              className="smriti-card group block bg-pine-800 p-6 text-white transition hover:-translate-y-0.5 hover:shadow-card-lg"
              style={{ borderColor: 'rgba(255,255,255,0.14)' }}
            >
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-marigold-400 text-pine-950">
                <ShieldCheck size={28} aria-hidden />
              </span>
              <span className="mt-3 block font-display text-[28px] font-semibold">
                {t('welcome.caregiver')}
              </span>
              <span className="mt-1 block text-[16px] font-bold text-white/80">{t('welcome.caregiverSub')}</span>
              <span className="smriti-btn smriti-btn-lg mt-4 w-full bg-white text-pine-900 hover:bg-cream-100">
                {t('welcome.caregiver')} <ArrowRight size={22} aria-hidden />
              </span>
            </Link>
          </motion.div>

          <motion.div variants={cardVariants} className="flex flex-wrap gap-2">
            {[t('welcome.trust1'), t('welcome.trust2'), t('welcome.trust3')].map((chip) => (
              <span
                key={chip}
                className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border border-line bg-white px-4 text-[15px] font-extrabold text-pine-900"
              >
                <Volume2 size={17} aria-hidden /> {chip}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12 }}
          className="smriti-card-pine relative overflow-hidden p-6 sm:p-8"
        >
          <div aria-hidden className="pointer-events-none absolute inset-x-8 top-6 h-40 rounded-[2rem] bg-gradient-to-b from-[#7FD1B9]/30 to-transparent" />
          <div aria-hidden className="pointer-events-none absolute -bottom-10 left-1/2 h-40 w-[130%] -translate-x-1/2 rounded-[50%] bg-[#0A2E28]" />
          <h2 className="relative font-display text-[30px] font-semibold text-white">{t('welcome.howTitle')}</h2>
          <div className="relative mt-4 space-y-3">
            {[
              { title: t('welcome.how1Title'), sub: t('welcome.how1Sub') },
              { title: t('welcome.how2Title'), sub: t('welcome.how2Sub') },
              { title: t('welcome.how3Title'), sub: t('welcome.how3Sub') },
            ].map((s) => (
              <div key={s.title} className="rounded-3xl bg-white p-5 shadow-card">
                <p className="text-[19px] font-black text-pine-950">{s.title}</p>
                <p className="mt-1 text-[16px] font-bold text-ink-600">{s.sub}</p>
              </div>
            ))}
          </div>
          <Link to="/patient" className="relative mt-5 block">
            <Button variant="amber" size="lg" className="w-full">
              {t('common.continue')} <ArrowRight size={22} aria-hidden />
            </Button>
          </Link>
        </motion.aside>
      </div>
    </AppShell>
  );
}
