import { useStoreConfig } from '../context/ConfigContext';
import { pickVariantSet } from '../lib/utils/imageUrl';
import Button from './Button';

export function HeroSection() {
  const cfg = useStoreConfig();
  const { hero } = cfg;
  const heroImage = pickVariantSet(hero.imageVariants, 'large') || hero.image;

  return (
    <section className="hero-fullbleed relative w-full overflow-hidden bg-body">
      <div className="relative w-full aspect-[4/5] sm:aspect-[16/9] md:aspect-[21/9] min-h-[320px] sm:min-h-[420px] md:min-h-[560px]">
        <img src={heroImage} alt={cfg.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
      </div>
      <div className="absolute bottom-8 md:bottom-12 left-0 right-0 z-10 px-4 md:px-6">
        <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-stretch md:items-end justify-between gap-6">
          <div className="text-right min-w-0">
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl text-white mb-2 leading-none drop-shadow-lg" dir="ltr">
              {hero.title}
            </h1>
            {hero.subtitle && <p className="text-white/75 text-sm md:text-base max-w-sm">{hero.subtitle}</p>}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button to="/shop" variant="aluminum" size="lg" className="w-full sm:w-auto justify-center">
              {hero.ctaPrimary}
            </Button>
            <Button to="/categories" variant="glass" size="lg" className="w-full sm:w-auto justify-center text-white !border-white/30">
              {hero.ctaSecondary}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
