import { Link } from 'react-router-dom';
import { useStoreConfig } from '../context/ConfigContext';
import { pickVariantSet } from '../lib/utils/imageUrl';

export function Footer() {
  const cfg = useStoreConfig();
  const { footer, nav, legal } = cfg.texts;
  const legalLinks = legal.footerLinks;
  const logoSrc = pickVariantSet(cfg.logoVariants, 'thumb') || cfg.logo;
  const enamad = footer.enamad;
  const contact = legal.contact;

  return (
    <footer className="border-t border-border bg-body mt-20">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          <div className="text-right flex flex-col items-start">
            <div className="flex items-center gap-2 justify-end mb-4">
              <span className="font-display text-lg text-body">{cfg.name}</span>
              <img src={logoSrc} alt="" className="w-8 h-8 object-contain" />
            </div>
            <p className="text-sm text-muted leading-relaxed">{footer.tagline}</p>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-body mb-4">دسترسی سریع</h3>
            <ul className="space-y-2">
              {nav.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-muted hover:text-body transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-body mb-4">قوانین و اعتماد</h3>
            <ul className="space-y-2">
              {legalLinks.map((l) => (
                <li key={l.href}>
                  <Link to={l.href} className="text-sm text-muted hover:text-body transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-bold text-body mb-4">تماس با ما</h3>
            <p className="text-sm text-muted mb-2">{footer.support}</p>
            {contact.phone.value && <p className="text-sm text-body mb-1" dir="ltr">{contact.phone.value}</p>}
            {contact.email.value && <p className="text-sm text-body mb-2" dir="ltr">{contact.email.value}</p>}
            <p className="text-sm text-body" dir="ltr">{footer.social}</p>
          </div>
        </div>
        <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted/60">
          <p>{footer.copyright}</p>
          {enamad?.href && enamad?.logoUrl && (
            <a href={enamad.href} target="_blank" rel="noopener noreferrer" referrerPolicy="origin" className="inline-block shrink-0">
              <img src={enamad.logoUrl} alt="نماد اعتماد الکترونیکی" referrerPolicy="origin" className="cursor-pointer h-16 w-auto object-contain" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}

export default Footer;
