import { BannerItem } from '../types/banner';

export const EDITED_PROMO_BANNERS: BannerItem[] = [
  {
    id: 'banner_1',
    title: 'Artisanal Pizzas',
    subtitle: 'Stone-baked with 100% Mozzarella',
    tag: 'FLAT 10% OFF',
    imageUrl: '/banners/banner_pizza.jpg',
    categoryLink: 'pizza',
    isActive: true,
  },
  {
    id: 'banner_2',
    title: 'Gourmet Burgers',
    subtitle: 'Juicy Grilled Patties & Cheddar',
    tag: 'BESTSELLER',
    imageUrl: '/banners/banner_burger.jpg',
    categoryLink: 'burger',
    isActive: true,
  },
  {
    id: 'banner_3',
    title: 'Royal Dum Biryani',
    subtitle: 'Slow-Cooked Royal Clay Pot Feast',
    tag: 'CHEF’S SPECIAL',
    imageUrl: '/banners/banner_biryani.jpg',
    categoryLink: 'biryani',
    isActive: true,
  },
  {
    id: 'banner_4',
    title: 'Grilled Sandwiches',
    subtitle: 'Crisp Triple-Layered Golden Toast',
    tag: 'CRISP & FRESH',
    imageUrl: '/banners/banner_sandwich.jpg',
    categoryLink: 'jumbo-sandwich',
    isActive: true,
  },
  {
    id: 'banner_5',
    title: 'Midnight Combos',
    subtitle: 'Pizza + Burger + Fries + Drink',
    tag: 'SAVE UP TO 30%',
    imageUrl: '/banners/banner_combo.jpg',
    categoryLink: 'special-combo',
    isActive: true,
  },
];
