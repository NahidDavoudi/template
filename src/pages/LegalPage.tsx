import { Link } from 'react-router-dom';
import {
  Sparkles, MessageCircle, Scale, Lock, RotateCcw, HelpCircle, ChevronLeft,
  ShieldCheck, Truck, RefreshCcw, Gem,
} from 'lucide-react';
import { useStoreConfig } from '../context/ConfigContext';
import { usePageTitle } from '../lib/hooks/usePageTitle';
import type { LegalTexts } from '../config/storeConfig';

const ICONS: Record<string, typeof Sparkles> = {
  sparkles: Sparkles,
  'message-circle': MessageCircle,
  scale: Scale,
  lock: Lock,
  'rotate-ccw': RotateCcw,
  'help-circle': HelpCircle,
  'shield-check': ShieldCheck,
  truck: Truck,
  'refresh-ccw': RefreshCcw,
  gem: Gem,
};

type LegalPageKey = 'about' | 'contact' | 'terms' | 'privacy' | 'refund' | 'faq';

interface LegalPageProps {
  page: LegalPageKey;
}

export function LegalPage({ page }: LegalPageProps) {
  const cfg = useStoreConfig();
  const legal = cfg.texts.legal;
  const data = legal[page];
  usePageTitle(`${data.title} | ${cfg.name}`);
  const Icon = ICONS[data.icon] || Sparkles;

  return (
    <main className="max-w-[900px] mx-auto px-4 md:px-10 py-12 md:py-20 text-right">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
          <Icon className="w-7 h-7" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{data.title}</h1>
        <p className="text-muted max-w-xl leading-relaxed">{data.subtitle}</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-6 md:p-10 space-y-8">
        {page === 'about' && <AboutContent data={data as typeof legal.about} />}
        {page === 'contact' && <ContactContent data={data as typeof legal.contact} />}
        {(page === 'terms' || page === 'privacy' || page === 'refund') && (
          <SectionsContent data={data as typeof legal.terms} />
        )}
        {page === 'faq' && <FaqContent data={data as typeof legal.faq} />}
      </div>

      <div className="text-center mt-10">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted hover:text-accent">
          <ChevronLeft className="w-4 h-4" /> بازگشت به خانه
        </Link>
      </div>
    </main>
  );
}

function AboutContent({ data }: { data: import('../config/storeConfig').AboutTexts }) {
  const WhyIcon = (icon: string) => ICONS[icon] || Sparkles;
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">{data.sectionTitles.intro}</h2>
        <p className="text-muted leading-relaxed">{data.intro}</p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3">{data.sectionTitles.mission}</h2>
        <p className="text-muted leading-relaxed">{data.mission}</p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-3">{data.sectionTitles.vision}</h2>
        <p className="text-muted leading-relaxed">{data.vision}</p>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">{data.sectionTitles.whyChooseUs}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.whyChooseUs.map((w, i) => {
            const I = WhyIcon(w.icon);
            return (
              <div key={i} className="flex items-start gap-3 flex-row-reverse p-4 bg-surface rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                  <I className="w-5 h-5" />
                </div>
                <div className="text-right flex-1">
                  <h3 className="font-bold mb-1">{w.title}</h3>
                  <p className="text-sm text-muted leading-relaxed">{w.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">{data.sectionTitles.stats}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.stats.map((s, i) => (
            <div key={i} className="bg-surface rounded-xl p-5 text-center">
              <p className="text-2xl font-bold text-accent">{s.value}</p>
              <p className="text-xs text-muted mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-xl font-bold mb-4">{data.sectionTitles.team}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {data.team.map((m, i) => (
            <div key={i} className="bg-surface rounded-xl p-5 text-center">
              <div className="w-14 h-14 rounded-full bg-accent/10 text-accent flex items-center justify-center mx-auto mb-3 font-bold">
                {m.name.charAt(0)}
              </div>
              <p className="font-bold text-sm">{m.name}</p>
              <p className="text-xs text-muted mt-1">{m.role}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ContactContent({ data }: { data: import('../config/storeConfig').ContactTexts }) {
  const infos = [data.phone, data.email, data.address, data.hours];
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-4">{data.formSectionTitle}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {infos.map((info, i) => (
            <div key={i} className="bg-surface rounded-xl p-5 text-right">
              <p className="text-sm text-muted">{info.label}</p>
              <p className="font-bold mt-1" dir="ltr">{info.value}</p>
              {info.note && <p className="text-xs text-muted mt-2">{info.note}</p>}
            </div>
          ))}
        </div>
      </section>
      <section>
        <p className="text-muted text-center bg-surface rounded-xl p-6">{data.formUnavailable}</p>
      </section>
    </div>
  );
}

function SectionsContent({ data }: { data: import('../config/storeConfig').TermsTexts }) {
  return (
    <div className="space-y-8">
      {data.sections.map((section, i) => (
        <section key={i}>
          <h2 className="text-xl font-bold mb-3">{section.title}</h2>
          {section.content?.map((p, j) => <p key={j} className="text-muted leading-relaxed mb-3">{p}</p>)}
          {section.items && (
            <ul className="space-y-2 list-disc list-inside marker:text-accent">
              {section.items.map((item, j) => <li key={j} className="text-muted leading-relaxed">{item}</li>)}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}

function FaqContent({ data }: { data: import('../config/storeConfig').FaqTexts }) {
  return (
    <div className="space-y-3">
      {data.items.map((item, i) => (
        <details key={i} className="group bg-surface rounded-xl p-4">
          <summary className="font-bold cursor-pointer list-none flex items-center justify-between flex-row-reverse">
            <span>{item.question}</span>
            <ChevronLeft className="w-4 h-4 text-muted group-open:-rotate-90 transition-transform" />
          </summary>
          <p className="text-muted leading-relaxed mt-3 pr-1">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

export default LegalPage;

export type { LegalTexts };
