import { Award, Trophy, Crown } from 'lucide-react';

export const plans = [
  {
    id: 'basic',
    name: 'Basic Food Plan',
    price: '₦1,250',
    priceNum: 1250,
    tagline: 'Your entry point to the Pamarel system',
    color: 'primary',
    boards: [
      {
        name: 'Bronze Board',
        level: 'Level 1',
        icon: Award,
        requirements: ['7 people'],
        rewards: [
          'Welcome FOODY BAG (250ml Honey, 100g Sea Salt & Bonus gadget)',
          'OR ₦2,500 Cash Wallet',
        ],
      },
      {
        name: 'Silver Board',
        level: 'Levels 1-2',
        icon: Trophy,
        requirements: ['7 people', '7×7 (49 people)'],
        rewards: [
          'Total: ₦27,000 Rewards',
          'Food Wallet: ₦5,000',
          'Cash Wallet: ₦5,000',
          'Gadget Wallet: ₦2,500',
          'Auto Registration into CLASSIC FOOD PLAN: ₦12,500',
          'CSR Donation: ₦1,000',
          'Arising Leader Bonus (30 days): ₦1,000 cash',
        ],
      },
      {
        name: 'Gold Board',
        level: 'Levels 1-2',
        icon: Crown,
        requirements: ['7 people', '7×7 (49 people)'],
        rewards: [
          'Total: ₦2,500,000 Rewards',
          'Food Wallet: ₦1,000,000 (₦100K/mo × 10 months)',
          'Gadget Wallet: ₦330,000',
          'Cash Wallet: ₦500,000',
          'Auto Registration into DELUXE FOOD PLAN: ₦170,000',
          'HSF Project: ₦500,000',
        ],
      },
    ],
  },
  {
    id: 'classic',
    name: 'Classic Food Plan',
    price: '₦12,500',
    priceNum: 12500,
    tagline: 'Scale your rewards with expanded board access',
    color: 'accent',
    boards: [
      {
        name: 'Bronze Board',
        level: 'Level 1',
        icon: Award,
        requirements: ['7 people'],
        rewards: ['₦30,000 Foody Bag'],
      },
      {
        name: 'Silver Board',
        level: 'Levels 1-2',
        icon: Trophy,
        requirements: ['7 people', '7×7 (49 people)'],
        rewards: [
          'Total: ₦280K-300K Rewards',
          'Food Wallet: ₦50,000',
          'Cash Wallet: ₦50,000',
          'Gadget Wallet: ₦25,000',
          'CSR Donation: ₦10,000',
          'Auto Registration into DELUXE FOOD PLAN',
          'Arising Leader Bonus: ₦20,000 Foody Bag',
        ],
      },
      {
        name: 'Gold Board',
        level: 'Levels 1-2',
        icon: Crown,
        requirements: ['7 people', '7×7 (49 people)'],
        rewards: [
          'Total: ₦20,000,000 Rewards',
          'Food Wallet: ₦8,000,000',
          'Gadget Wallet: ₦2,000,000',
          'Cash Wallet: ₦5,000,000',
          '₦10M Car Incentive',
          'African Trip',
          '₦1M Health Insurance',
        ],
      },
    ],
  },
  {
    id: 'deluxe',
    name: 'Deluxe Food Plan',
    price: '₦170,000',
    priceNum: 170000,
    tagline: 'Maximum rewards & premium lifestyle benefits',
    color: 'destructive',
    boards: [
      {
        name: 'Bronze Board',
        level: 'Level 1',
        icon: Award,
        requirements: ['7 people'],
        rewards: [
          'Total: ₦300,000',
          'Cashback: ₦170,000',
          'FOODY BAG: ₦100,000',
          'Gadget Wallet: ₦30,000',
        ],
      },
      {
        name: 'Silver Board',
        level: 'Levels 1-2',
        icon: Trophy,
        requirements: ['7 people', '7×7 (49 people)'],
        rewards: [
          'Total: ₦4,400,000 Rewards',
          'Food Wallet: ₦2,000,000 (₦200,000 monthly food supplies for 10 months)',
          'Gadget Wallet: ₦500,000',
          'Cash Wallet: ₦1,000,000',
          'CSR Donation: ₦100,000',
          'Arising Leader Bonus (complete within 30 days): ₦87,500',
          'Reinvestment into CLASSIC FOOD PLAN with 57 accounts: ₦712,500',
        ],
      },
      {
        name: 'Gold Board',
        level: 'Levels 1-2',
        icon: Crown,
        requirements: ['7 people', '7×7 (49 people)'],
        rewards: [
          'Total: ₦120,000,000 Rewards',
          'Food Wallet: ₦40,000,000',
          'Gadget Wallet: ₦10,000,000',
          'Cash Wallet: ₦30,000,000',
          '₦20M Car Incentive',
          'International Trip',
          '₦40M Housing Support',
          '₦5,000,000 HSF Project',
        ],
      },
    ],
  },
];

export const comparisonFeatures = [
  {
    feature: 'Registration Fee',
    basic: '₦1,250',
    classic: '₦12,500',
    deluxe: '₦170,000',
  },
  {
    feature: 'Total Gold Board Earnings',
    basic: '₦2.5M',
    classic: '₦20M',
    deluxe: '₦120M',
  },
  {
    feature: 'Bronze Board Earnings',
    basic: 'Foody Bag + Bonus',
    classic: '₦30,000 Foody Bag',
    deluxe: '₦300,000 Total',
  },
  {
    feature: 'Silver Board Earnings',
    basic: '₦27,000 Total',
    classic: '₦280K-300K Total',
    deluxe: '₦4.4M Total',
  },
  {
    feature: 'Gold Board Earnings',
    basic: '₦2.5M Total',
    classic: '₦20M Total',
    deluxe: '₦120M Total',
  },
  { feature: 'Food Wallet', basic: '✓', classic: '✓', deluxe: '✓' },
  { feature: 'Cash Wallet', basic: '✓', classic: '✓', deluxe: '✓' },
  { feature: 'Gadget Wallet', basic: '✓', classic: '✓', deluxe: '✓' },
  {
    feature: 'Arising Leader Bonus',
    basic: '₦1,000 Cash',
    classic: '₦20,000 Foody Bag',
    deluxe: '₦87,500 Cash',
  },
  {
    feature: 'Car Incentive',
    basic: '✗',
    classic: '₦10M Car',
    deluxe: '₦20M Car',
  },
  {
    feature: 'Travel Incentive',
    basic: '✗',
    classic: 'African Trip',
    deluxe: 'International Trip',
  },
  {
    feature: 'Health Insurance',
    basic: '✗',
    classic: '₦1M Coverage',
    deluxe: '✓',
  },
  {
    feature: 'Housing Support',
    basic: '✗',
    classic: '✗',
    deluxe: '₦40M Support',
  },
  {
    feature: 'HSF Project',
    basic: '₦500,000',
    classic: '₦1,000,000',
    deluxe: '₦5,000,000',
  },
  {
    feature: 'Automatic Upgrade',
    basic: '→ Classic',
    classic: '→ Deluxe',
    deluxe: '✗',
  },
  {
    feature: 'Requirements',
    basic: '7 people/level',
    classic: '7 people/level',
    deluxe: '7 people/level',
  },
];


/* ─── Plan config ─── */
export const planConfig: Record<
  string,
  {
    name: string;
    price: string;
    priceNum: number;
    gradient: string;
    accent: string;
    badge: string;
  }
> = {
  basic: {
    name: 'Basic Food Plan',
    price: '₦1,250',
    priceNum: 1250,
    gradient: 'from-primary to-primary/80',
    accent: 'text-primary',
    badge: 'bg-primary/10 text-primary border-primary/20',
  },
  classic: {
    name: 'Classic Food Plan',
    price: '₦12,500',
    priceNum: 12500,
    gradient: 'from-[hsl(270,60%,40%)] to-[hsl(270,50%,30%)]',
    accent: 'text-[hsl(270,60%,40%)]',
    badge:
      'bg-[hsl(270,60%,90%)] text-[hsl(270,60%,40%)] border-[hsl(270,60%,80%)]',
  },
  deluxe: {
    name: 'Deluxe Food Plan',
    price: '₦170,000',
    priceNum: 170000,
    gradient: 'from-foreground to-foreground/80',
    accent: 'text-foreground',
    badge: 'bg-muted text-foreground border-border',
  },
};