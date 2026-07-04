/**
 * PillCarousel — 3D overlapping pill carousel (ported from Framer PillCarousel)
 * https://framer.com/m/PillCarousel-Z6qwgL.js@HrqoC1NNBVJtv6kXuC7o
 */

const DEFAULTS = {
  cardWidth: 280,
  containerHeight: 500,
  mobileCardWidth: 220,
  mobileContainerHeight: 380,
  cardBorderRadius: 200,
  autoplay: true,
  autoplayMs: 3000,
  transitionMs: 600,
  hoverScale: 1.05,
  hoverBrightness: 1.15,
  cardShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
  activeBorderWidth: 6,
  activeBorderColor: '#FFFFFF',
  tooltipBackgroundColor: '#FFFFFF',
  tooltipTextColor: '#000000',
  tooltipPadding: '12px 24px',
  tooltipFontSize: 14,
  tooltipBorderRadius: 50,
  tooltipShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  pauseOnHover: true,
};

function mergeConfig(cfg = {}) {
  return { ...DEFAULTS, ...cfg };
}

function resolveSizing(cfg) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return {
    ...cfg,
    cardWidth: isMobile ? (cfg.mobileCardWidth ?? cfg.cardWidth) : cfg.cardWidth,
    containerHeight: isMobile ? (cfg.mobileContainerHeight ?? cfg.containerHeight) : cfg.containerHeight,
  };
}

function getSignedDiff(index, currentIndex, total) {
  let diff = index - currentIndex;
  if (diff > total / 2) diff -= total;
  if (diff < -total / 2) diff += total;
  return diff;
}

function getCardStyle(signedDiff, isHovered, cfg) {
  const { hoverScale, hoverBrightness } = cfg;
  const base = {
    zIndex: 10,
    opacity: 0,
    left: '50%',
    top: '50%',
    filter: 'blur(3px) brightness(1)',
    transform: 'translateX(-50%) translateY(-50%) scale(0.5)',
  };

  if (signedDiff === 0) {
    return {
      zIndex: 50,
      opacity: 1,
      left: '50%',
      top: '50%',
      filter: 'blur(0px) brightness(1)',
      transform: 'translateX(-50%) translateY(-50%) scale(1)',
    };
  }

  if (signedDiff === 1) {
    const scale = isHovered ? 0.85 * hoverScale : 0.85;
    return {
      zIndex: 40,
      opacity: isHovered ? 1 : 0.95,
      left: '88%',
      top: '34%',
      filter: `blur(0.5px) brightness(${isHovered ? hoverBrightness : 1})`,
      transform: `translateX(-50%) translateY(-50%) scale(${scale})`,
    };
  }

  if (signedDiff === 2) {
    const scale = isHovered ? 0.7 * hoverScale : 0.7;
    return {
      zIndex: 30,
      opacity: isHovered ? 0.9 : 0.85,
      left: '122%',
      top: '22%',
      filter: `blur(1.5px) brightness(${isHovered ? hoverBrightness : 1})`,
      transform: `translateX(-50%) translateY(-50%) scale(${scale})`,
    };
  }

  if (signedDiff === -1) {
    const scale = isHovered ? 0.85 * hoverScale : 0.85;
    return {
      zIndex: 40,
      opacity: isHovered ? 1 : 0.95,
      left: '12%',
      top: '66%',
      filter: `blur(0.5px) brightness(${isHovered ? hoverBrightness : 1})`,
      transform: `translateX(-50%) translateY(-50%) scale(${scale})`,
    };
  }

  if (signedDiff === -2) {
    const scale = isHovered ? 0.7 * hoverScale : 0.7;
    return {
      zIndex: 30,
      opacity: isHovered ? 0.9 : 0.85,
      left: '-22%',
      top: '78%',
      filter: `blur(1.5px) brightness(${isHovered ? hoverBrightness : 1})`,
      transform: `translateX(-50%) translateY(-50%) scale(${scale})`,
    };
  }

  return base;
}

const PillCarousel = {
  render({ id = 'pill-carousel', background = 'transparent' } = {}) {
    return `
      <div class="pill-carousel" data-pill-id="${id}" style="background:${background}">
        <div class="pill-carousel__stage" role="region" aria-label="کاروسل محصولات ویژه">
          <div class="pill-carousel__cards"></div>
          <a href="#" class="pill-carousel__tooltip" data-pill-tooltip data-link aria-live="polite">
            <span data-pill-tooltip-text></span>
            <span class="pill-carousel__tooltip-arrow" aria-hidden="true"></span>
          </a>
        </div>
      </div>`;
  },

  bind(root, { items = [], itemsHtml = [], config = {}, background = 'transparent' } = {}) {
    if (!root || !itemsHtml.length) return null;

    const cfg = mergeConfig(config);
    const total = itemsHtml.length;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let currentIndex = 0;
    let hoveredIndex = null;
    let paused = false;
    let inView = true;
    let intervalId = null;

    const stage = root.querySelector('.pill-carousel__stage');
    const cardsEl = root.querySelector('.pill-carousel__cards');
    const tooltip = root.querySelector('[data-pill-tooltip]');
    const tooltipText = root.querySelector('[data-pill-tooltip-text]');

    root.style.background = background;

    function applyCssVars() {
      const resolved = resolveSizing(cfg);
      root.style.setProperty('--pill-card-w', `${resolved.cardWidth}px`);
      root.style.setProperty('--pill-container-h', `${resolved.containerHeight}px`);
      root.style.setProperty('--pill-card-radius', `${cfg.cardBorderRadius}px`);
      root.style.setProperty('--pill-transition-ms', `${cfg.transitionMs}ms`);
      root.style.setProperty('--pill-card-shadow', cfg.cardShadow);
      root.style.setProperty('--pill-active-border-w', `${cfg.activeBorderWidth}px`);
      root.style.setProperty('--pill-active-border-color', cfg.activeBorderColor);
      root.style.setProperty('--pill-tooltip-bg', cfg.tooltipBackgroundColor);
      root.style.setProperty('--pill-tooltip-color', cfg.tooltipTextColor);
      root.style.setProperty('--pill-tooltip-padding', cfg.tooltipPadding);
      root.style.setProperty('--pill-tooltip-fs', `${cfg.tooltipFontSize}px`);
      root.style.setProperty('--pill-tooltip-radius', `${cfg.tooltipBorderRadius}px`);
      root.style.setProperty('--pill-tooltip-shadow', cfg.tooltipShadow);
      root.style.height = `${resolved.containerHeight}px`;
    }

    function clearAutoplay() {
      if (intervalId != null) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
    }

    function startAutoplay() {
      if (prefersReducedMotion || !cfg.autoplay || !inView || total <= 1) return;
      clearAutoplay();
      intervalId = window.setInterval(() => {
        currentIndex = (currentIndex + 1) % total;
        layoutCards();
      }, Math.max(500, cfg.autoplayMs));
    }

    function resetAutoplay() {
      clearAutoplay();
      startAutoplay();
    }

    function updateTooltip() {
      const item = items[currentIndex];
      const label = item?.tooltipText || item?.name || cfg.tooltipText || 'مشاهده جزئیات';
      if (tooltipText) tooltipText.textContent = label;
      if (tooltip && item?.href) tooltip.href = item.href;
      if (tooltip) {
        tooltip.style.animation = 'none';
        tooltip.offsetHeight;
        tooltip.style.animation = '';
      }
    }

    function layoutCards() {
      applyCssVars();

      for (let i = 0; i < total; i += 1) {
        let card = cardsEl.children[i];
        if (!card) {
          card = document.createElement('div');
          card.className = 'pill-carousel__card';
          card.innerHTML = '<div class="pill-carousel__card-frame"></div>';
          cardsEl.appendChild(card);
        }

        const signedDiff = getSignedDiff(i, currentIndex, total);
        const isCenter = signedDiff === 0;
        const isHovered = hoveredIndex === i;
        const style = getCardStyle(signedDiff, isHovered, cfg);

        card.style.zIndex = String(style.zIndex);
        card.style.opacity = String(style.opacity);
        card.style.left = style.left;
        card.style.top = style.top;
        card.style.filter = style.filter;
        card.style.transform = style.transform;
        card.style.pointerEvents = isCenter ? 'none' : 'auto';
        card.style.cursor = isCenter ? 'default' : 'pointer';
        card.dataset.index = String(i);
        card.setAttribute('aria-hidden', isCenter ? 'false' : 'true');
        card.classList.toggle('is-center', isCenter);
        card.classList.toggle('is-hovered', isHovered && !isCenter);

        const frame = card.querySelector('.pill-carousel__card-frame');
        if (card.dataset.itemIdx !== String(i)) {
          frame.innerHTML = itemsHtml[i];
          card.dataset.itemIdx = String(i);
        }
      }

      while (cardsEl.children.length > total) {
        cardsEl.lastElementChild?.remove();
      }

      updateTooltip();
    }

    function goTo(index) {
      if (total <= 1 || index === currentIndex) return;
      currentIndex = ((index % total) + total) % total;
      layoutCards();
      resetAutoplay();
    }

    function next() {
      goTo(currentIndex + 1);
    }

    function prev() {
      goTo(currentIndex - 1);
    }

    const onCardClick = (e) => {
      const card = e.target.closest('.pill-carousel__card');
      if (!card || card.classList.contains('is-center')) return;
      const index = Number(card.dataset.index);
      if (!Number.isNaN(index)) goTo(index);
    };

    const onCardEnter = (e) => {
      const card = e.target.closest('.pill-carousel__card');
      if (!card || card.classList.contains('is-center')) return;
      hoveredIndex = Number(card.dataset.index);
      layoutCards();
    };

    const onCardLeave = () => {
      hoveredIndex = null;
      layoutCards();
    };

    const onKeyDown = (e) => {
      if (!root.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        next();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        prev();
      }
    };

    const onResize = () => layoutCards();

    const onVisibility = () => {
      paused = document.hidden;
      if (paused) clearAutoplay();
      else startAutoplay();
    };

    const onMouseEnter = () => {
      if (cfg.pauseOnHover) clearAutoplay();
    };

    const onMouseLeave = () => {
      if (cfg.pauseOnHover && !paused) startAutoplay();
    };

    cardsEl?.addEventListener('click', onCardClick);
    cardsEl?.addEventListener('mouseenter', onCardEnter, true);
    cardsEl?.addEventListener('mouseleave', onCardLeave, true);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVisibility);
    root.addEventListener('mouseenter', onMouseEnter);
    root.addEventListener('mouseleave', onMouseLeave);

    const io = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(
        ([entry]) => {
          inView = entry.isIntersecting;
          if (inView) startAutoplay();
          else clearAutoplay();
        },
        { threshold: 0.2 }
      )
      : null;
    io?.observe(root);

    layoutCards();
    startAutoplay();

    const state = {
      io,
      onResize,
      onVisibility,
      onMouseEnter,
      onMouseLeave,
      onKeyDown,
      onCardClick,
      onCardEnter,
      onCardLeave,
      clearAutoplay,
    };
    root._pillState = state;
    return state;
  },

  destroy(root) {
    const state = root?._pillState;
    if (!state) return;

    state.clearAutoplay?.();
    state.io?.disconnect();
    window.removeEventListener('resize', state.onResize);
    window.removeEventListener('keydown', state.onKeyDown);
    document.removeEventListener('visibilitychange', state.onVisibility);
    root.removeEventListener('mouseenter', state.onMouseEnter);
    root.removeEventListener('mouseleave', state.onMouseLeave);

    const cardsEl = root.querySelector('.pill-carousel__cards');
    cardsEl?.removeEventListener('click', state.onCardClick);
    cardsEl?.removeEventListener('mouseenter', state.onCardEnter, true);
    cardsEl?.removeEventListener('mouseleave', state.onCardLeave, true);

    root._pillState = null;
  },
};

export default PillCarousel;
