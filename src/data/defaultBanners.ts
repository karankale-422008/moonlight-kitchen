import { BannerItem } from '../types/banner';

// Helper to create an SVG data URL for an edited promotional marketing banner
function createPromoBannerSvg(config: {
  accentColor: string;
  badgeText: string;
  headline: string;
  subheadline: string;
  offerText: string;
  ctaText: string;
  foodEmoji: string;
  dishName: string;
  priceTag: string;
}): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 480" width="1200" height="480">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0B1120"/>
      <stop offset="50%" stop-color="#111827"/>
      <stop offset="100%" stop-color="${config.accentColor}"/>
    </linearGradient>
    <radialGradient id="glow" cx="80%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${config.accentColor}" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#0B1120" stop-opacity="0"/>
    </radialGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Background -->
  <rect width="1200" height="480" fill="url(#bg)"/>
  <rect width="1200" height="480" fill="url(#glow)"/>

  <!-- Subtle Decorative Grid Lines -->
  <g stroke="rgba(255,255,255,0.04)" stroke-width="1">
    <line x1="0" y1="120" x2="1200" y2="120"/>
    <line x1="0" y1="240" x2="1200" y2="240"/>
    <line x1="0" y1="360" x2="1200" y2="360"/>
    <line x1="300" y1="0" x2="300" y2="480"/>
    <line x1="600" y1="0" x2="600" y2="480"/>
    <line x1="900" y1="0" x2="900" y2="480"/>
  </g>

  <!-- LEFT PROMOTIONAL CONTENT (Inside the Banner) -->
  <g transform="translate(70, 75)">
    <!-- Small Brand Identifier -->
    <text x="0" y="24" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="900" fill="#F59E0B" letter-spacing="3">MOONLIGHT KITCHEN • SPECIAL</text>

    <!-- Promotional Badge Pill -->
    <g transform="translate(0, 42)">
      <rect width="260" height="34" rx="17" fill="#F59E0B" fill-opacity="0.18" stroke="#F59E0B" stroke-width="1.5"/>
      <text x="130" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="900" fill="#FDE68A" text-anchor="middle" letter-spacing="1.5">${config.badgeText}</text>
    </g>

    <!-- Main Headline -->
    <text x="0" y="145" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#FFFFFF" letter-spacing="-0.5">${config.headline}</text>

    <!-- Subheadline -->
    <text x="0" y="185" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="18" font-weight="500" fill="#9CA3AF">${config.subheadline}</text>

    <!-- Offer Callout Tag -->
    <g transform="translate(0, 220)">
      <rect width="360" height="42" rx="10" fill="rgba(0,0,0,0.4)" stroke="rgba(245,158,11,0.4)" stroke-width="1.2"/>
      <text x="18" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="800" fill="#FCD34D">${config.offerText}</text>
    </g>

    <!-- Action Button (Rendered directly in banner) -->
    <g transform="translate(0, 285)">
      <rect width="180" height="48" rx="14" fill="#F59E0B" filter="url(#shadow)"/>
      <text x="90" y="30" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="900" fill="#0B1120" text-anchor="middle" letter-spacing="1">${config.ctaText}</text>
    </g>
  </g>

  <!-- RIGHT FOOD SHOWCASE VISUAL (Inside the Banner) -->
  <g transform="translate(760, 240)">
    <!-- Glow Ring -->
    <circle cx="100" cy="0" r="170" fill="${config.accentColor}" fill-opacity="0.25"/>
    <circle cx="100" cy="0" r="145" fill="none" stroke="rgba(245,158,11,0.3)" stroke-width="2" stroke-dasharray="8 6"/>

    <!-- Large Appetizing Food Presentation Circle -->
    <g filter="url(#shadow)">
      <circle cx="100" cy="0" r="130" fill="#1F2937" stroke="rgba(255,255,255,0.15)" stroke-width="3"/>
      <!-- Food Icon/Emoji Centerpiece -->
      <text x="100" y="42" font-size="120" text-anchor="middle">${config.foodEmoji}</text>
    </g>

    <!-- Floating Price / Badge Tag -->
    <g transform="translate(190, -100)" filter="url(#shadow)">
      <rect width="130" height="42" rx="21" fill="#EA580C"/>
      <text x="65" y="26" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="14" font-weight="900" fill="#FFFFFF" text-anchor="middle">${config.priceTag}</text>
    </g>

    <!-- Floating Dish Name Pill -->
    <g transform="translate(15, 110)" filter="url(#shadow)">
      <rect width="180" height="34" rx="17" fill="rgba(11,17,32,0.9)" stroke="rgba(245,158,11,0.5)" stroke-width="1.5"/>
      <text x="90" y="22" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="12" font-weight="800" fill="#F3F4F6" text-anchor="middle">${config.dishName}</text>
    </g>
  </g>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const EDITED_PROMO_BANNERS: BannerItem[] = [
  {
    id: 'banner_1',
    title: 'Artisanal Handcrafted Pizzas',
    subtitle: '100% Real Mozzarella & Rich Herbs',
    tag: 'FLAT 10% OFF',
    imageUrl: createPromoBannerSvg({
      accentColor: '#991B1B',
      badgeText: 'FLAT 10% OFF • CODE: MOONLIGHT10',
      headline: 'Artisanal Cheesy Pizzas',
      subheadline: 'Stone-baked crust loaded with 100% mozzarella & fresh herbs',
      offerText: '🍕 Use code MOONLIGHT10 for 10% OFF',
      ctaText: 'ORDER NOW ›',
      foodEmoji: '🍕',
      dishName: 'Fresh Mozzarella Pizza',
      priceTag: 'From ₹89',
    }),
    categoryLink: 'pizza',
    isActive: true,
  },
  {
    id: 'banner_2',
    title: 'Gourmet Loaded Burgers',
    subtitle: 'Grilled Patties & Secret House Aioli',
    tag: 'BESTSELLER FROM ₹59',
    imageUrl: createPromoBannerSvg({
      accentColor: '#854D0E',
      badgeText: 'HOT & FRESH • BESTSELLER',
      headline: 'Gourmet Loaded Burgers',
      subheadline: 'Crisp seasoned patties with melted cheddar & house garlic aioli',
      offerText: '🍔 Double cheese & veggie options available',
      ctaText: 'EXPLORE BURGERS ›',
      foodEmoji: '🍔',
      dishName: 'Cheddar Crunch Burger',
      priceTag: 'From ₹59',
    }),
    categoryLink: 'burger',
    isActive: true,
  },
  {
    id: 'banner_3',
    title: 'Royal Dum Biryani',
    subtitle: 'Slow-Cooked with Royal Spices',
    tag: 'CHEF’S SPECIAL',
    imageUrl: createPromoBannerSvg({
      accentColor: '#831843',
      badgeText: 'ROYAL RECIPE • CLAY POT DUM',
      headline: 'Royal Dum Biryani Feast',
      subheadline: 'Aromatic long-grain basmati infused with saffron & secret masalas',
      offerText: '🍛 Served with fresh cooling raita & salan',
      ctaText: 'TASTE ROYALTY ›',
      foodEmoji: '🍛',
      dishName: 'Authentic Dum Biryani',
      priceTag: 'Chef’s Pick',
    }),
    categoryLink: 'biryani',
    isActive: true,
  },
  {
    id: 'banner_4',
    title: 'Jumbo Grilled Sandwiches',
    subtitle: 'Triple-Layered Golden Toasted',
    tag: 'STREET STYLE CRUNCH',
    imageUrl: createPromoBannerSvg({
      accentColor: '#1E3A8A',
      badgeText: 'TRIPLE-DECKER OVERLOAD',
      headline: 'Jumbo Grilled Sandwiches',
      subheadline: 'Loaded with melted cheese, bell peppers, corn & spicy green chutney',
      offerText: '🥪 Freshly toasted golden crisp on order',
      ctaText: 'GRAB A BITE ›',
      foodEmoji: '🥪',
      dishName: 'Jumbo Cheese Grill',
      priceTag: 'From ₹65',
    }),
    categoryLink: 'jumbo-sandwich',
    isActive: true,
  },
  {
    id: 'banner_5',
    title: 'Moonlight Super Combos',
    subtitle: 'Pizza + Burger + Fries + Drink',
    tag: 'SAVE UP TO 30%',
    imageUrl: createPromoBannerSvg({
      accentColor: '#14532D',
      badgeText: 'MEGA SAVER PARTY COMBO',
      headline: 'Moonlight Feast Combos',
      subheadline: 'Cheesy Pizza + Crispy Burger + Loaded Fries + Chilled Mojito',
      offerText: '🎁 The complete party pack • Save up to 30%',
      ctaText: 'SAVE WITH COMBOS ›',
      foodEmoji: '🎁',
      dishName: 'Party Combo Meal',
      priceTag: 'Super Value',
    }),
    categoryLink: 'special-combo',
    isActive: true,
  },
];
