import { BannerItem } from '../types/banner';

// Helper to create a sleek, minimal graphic promotional banner (SVG data URL)
function createMinimalBannerSvg(config: {
  accentColor: string;
  tag: string;
  title: string;
  subtitle: string;
  ctaText: string;
  foodEmoji: string;
  priceTag: string;
}): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 480" width="1200" height="480">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#090D16"/>
      <stop offset="60%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="${config.accentColor}"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="50%" r="55%">
      <stop offset="0%" stop-color="${config.accentColor}" stop-opacity="0.38"/>
      <stop offset="100%" stop-color="#090D16" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#000000" flood-opacity="0.55"/>
    </filter>
  </defs>

  <!-- Clean Minimal Background -->
  <rect width="1200" height="480" fill="url(#bg)"/>
  <rect width="1200" height="480" fill="url(#glow)"/>

  <!-- Subtle Minimal Accent Bar -->
  <rect x="85" y="100" width="4" height="60" rx="2" fill="#F59E0B" />

  <!-- Minimal Typography Content -->
  <g transform="translate(105, 100)">
    <!-- Minimal Tag Pill -->
    <g transform="translate(0, 0)">
      <rect width="150" height="30" rx="15" fill="${config.accentColor}" fill-opacity="0.3" stroke="#F59E0B" stroke-width="1.2"/>
      <text x="75" y="20" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#FDE68A" text-anchor="middle" letter-spacing="1.5">${config.tag}</text>
    </g>

    <!-- Bold Clean Title -->
    <text x="0" y="85" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="52" font-weight="900" fill="#FFFFFF" letter-spacing="-1">${config.title}</text>

    <!-- Sleek Minimal Subtitle -->
    <text x="0" y="132" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="500" fill="#9CA3AF">${config.subtitle}</text>

    <!-- Clean Action Pill -->
    <g transform="translate(0, 180)">
      <rect width="165" height="44" rx="22" fill="#F59E0B" filter="url(#shadow)"/>
      <text x="82" y="28" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="900" fill="#090D16" text-anchor="middle" letter-spacing="0.5">${config.ctaText}</text>
    </g>
  </g>

  <!-- Right Visual Presentation -->
  <g transform="translate(860, 240)">
    <!-- Soft Ambient Halo -->
    <circle cx="0" cy="0" r="150" fill="${config.accentColor}" fill-opacity="0.2"/>
    <circle cx="0" cy="0" r="125" fill="#1E293B" stroke="rgba(255,255,255,0.12)" stroke-width="2" filter="url(#shadow)"/>
    
    <!-- Dish Icon -->
    <text x="0" y="42" font-size="115" text-anchor="middle">${config.foodEmoji}</text>

    <!-- Minimal Price Pill -->
    <g transform="translate(45, -90)" filter="url(#shadow)">
      <rect width="115" height="36" rx="18" fill="#EA580C"/>
      <text x="57" y="23" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="13" font-weight="900" fill="#FFFFFF" text-anchor="middle">${config.priceTag}</text>
    </g>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const EDITED_PROMO_BANNERS: BannerItem[] = [
  {
    id: 'banner_1',
    title: 'Artisanal Pizzas',
    subtitle: 'Stone-baked with 100% Mozzarella',
    tag: 'FLAT 10% OFF',
    imageUrl: createMinimalBannerSvg({
      accentColor: '#991B1B',
      tag: 'FLAT 10% OFF',
      title: 'Artisanal Pizzas',
      subtitle: 'Stone-baked with fresh mozzarella & herbs',
      ctaText: 'Order Now →',
      foodEmoji: '🍕',
      priceTag: 'From ₹89',
    }),
    categoryLink: 'pizza',
    isActive: true,
  },
  {
    id: 'banner_2',
    title: 'Gourmet Burgers',
    subtitle: 'Grilled Patties & Secret Aioli',
    tag: 'BESTSELLER',
    imageUrl: createMinimalBannerSvg({
      accentColor: '#854D0E',
      tag: 'BESTSELLER',
      title: 'Gourmet Burgers',
      subtitle: 'Juicy patties with melted cheddar',
      ctaText: 'Explore →',
      foodEmoji: '🍔',
      priceTag: 'From ₹59',
    }),
    categoryLink: 'burger',
    isActive: true,
  },
  {
    id: 'banner_3',
    title: 'Royal Dum Biryani',
    subtitle: 'Slow-Cooked Royal Spices',
    tag: 'CHEF’S SPECIAL',
    imageUrl: createMinimalBannerSvg({
      accentColor: '#831843',
      tag: 'CHEF’S SPECIAL',
      title: 'Royal Dum Biryani',
      subtitle: 'Aromatic basmati slow-cooked with spices',
      ctaText: 'Taste Now →',
      foodEmoji: '🍛',
      priceTag: 'Royal Pick',
    }),
    categoryLink: 'biryani',
    isActive: true,
  },
  {
    id: 'banner_4',
    title: 'Grilled Sandwiches',
    subtitle: 'Triple-Layered Golden Toast',
    tag: 'FRESH & CRISP',
    imageUrl: createMinimalBannerSvg({
      accentColor: '#1E3A8A',
      tag: 'FRESH & CRISP',
      title: 'Grilled Sandwiches',
      subtitle: 'Triple-layered with cheese & veggies',
      ctaText: 'Grab a Bite →',
      foodEmoji: '🥪',
      priceTag: 'From ₹65',
    }),
    categoryLink: 'jumbo-sandwich',
    isActive: true,
  },
  {
    id: 'banner_5',
    title: 'Midnight Combos',
    subtitle: 'Pizza + Burger + Fries + Drink',
    tag: 'SAVE UP TO 30%',
    imageUrl: createMinimalBannerSvg({
      accentColor: '#14532D',
      tag: 'SAVE UP TO 30%',
      title: 'Midnight Combos',
      subtitle: 'Pizza, burger, fries & drink pack',
      ctaText: 'Save Now →',
      foodEmoji: '🎁',
      priceTag: 'Combo Value',
    }),
    categoryLink: 'special-combo',
    isActive: true,
  },
];
