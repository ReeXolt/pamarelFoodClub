/**
 * Centralized Route Configuration
 * Organized by user context: Public, Auth, Account, Dashboard, Admin, API, and System
 * Use these constants instead of hardcoding route strings
 */

export const routes = {
  // =====================
  // PUBLIC ROUTES (Home)
  // =====================
  home: "/",

  // Information & Landing
  benefits: "/benefits",
  contact: "/contact",
  terms: "/terms",
  report: "/report",

  // Business Opportunities
  stockist: "/apply-stockist",
  joinMember: "/join-member",

  // =====================
  // SHOPPING ROUTES (Public)
  // =====================
  shop: {
    index: "/shop",
    market: "/market",
    product: (id: string) => `/product/${id}`,
    category: "/category",
    categoryDetail: (id: string) => `/category/${id}`,
  },

  // =====================
  // AUTHENTICATION ROUTES
  // =====================
  auth: {
    login: "/login",
    register: "/register",
    forgotPassword: "/forgot-password",
    resetPassword: "/reset-password",
  },

  // =====================
  // ACCOUNT/USER ROUTES
  // =====================
  account: {
    index: "/account",
    settings: "/account/settings",
    profile: "/profile",
    addresses: "/account/addresses",

    // Orders
    orders: "/account/orders",
    orderDetail: (id: string) => `/account/orders/${id}`,

    // Network & Affiliate
    affiliate: "/account/affiliate",
    genealogy: "/account/genealogy",

    // Reviews & Feedback
    reviews: "/account/reviews",
  },

  // =====================
  // CHECKOUT & PAYMENT
  // =====================
  checkout: "/checkout",
  orderConfirmation: "/order-confirmation",
  orderConfirmationDetail: (id: string) => `/order-confirmation/${id}`,

  payment: {
    success: "/payment/success",
    failed: "/payment/failed",
    verify: "/payment/verify",
    callback: "/payment/callback",
  },

  // =====================
  // WALLET ROUTES
  // =====================
  wallet: {
    verify: "/wallet/verify",
  },

  // =====================
  // VISUAL/TEAM ROUTES
  // =====================
  visual: "/visual",

  // =====================
  // DASHBOARD ROUTES (User)
  // =====================
  dashboard: {
    index: "/dashboard",
    orders: "/dashboard/orders",
    affiliate: "/dashboard/affiliate",
    genealogy: "/dashboard/genealogy",
    settings: "/dashboard/settings",
    reviews: "/dashboard/reviews",

    // Dashboard Shop
    shop: {
      index: "/dashboard/shop",
      detail: (id: string) => `/dashboard/shop/${id}`,
    },
  },

  // =====================
  // ADMIN ROUTES
  // =====================
  admin: {
    index: "/admin",

    // Dashboard & Overview
    stats: "/admin/stats",
    help: "/admin/help",

    // Products Management
    products: {
      index: "/admin/products",
      add: "/admin/products/new",
      edit: (id: string) => `/admin/products/edit/${id}`,
      inventory: "/admin/products/inventory",
      categories: "/admin/products/categories",
    },

    // Store Settings
    store: {
      general: "/admin/store/general",
      shipping: "/admin/store/shipping",
    },

    // Promotions & Deals
    coupons: "/admin/coupons",
    promotions: "/admin/promotions",

    // Order Management
    orders: {
      index: "/admin/orders",
      pending: "/admin/orders/pending",
      processing: "/admin/orders/processing",
      delivered: "/admin/orders/delivered",
      cancelled: "/admin/orders/cancelled",
      return: "/admin/orders/return",
    },

    // Other Management
    reviews: "/admin/reviews",
    shipping: "/admin/shipping",
    customers: "/admin/customers",
    transactions: "/admin/transactions",
    payments: "/admin/payments",
  },

  // =====================
  // API ROUTES (Reference)
  // =====================
  api: {
    // Authentication
    auth: {
      register: "/api/auth/register",
      login: "/api/auth/login",
      forgotPassword: "/api/auth/forgot-password",
      resetPassword: "/api/auth/reset-password",
    },

    // Account
    account: {
      user: "/api/account/user",
      userById: (userId: string) => `/api/account/user/${userId}`,
      update: "/api/account/update",
      password: "/api/account/password",
      stats: "/api/account/stats",
      genealogy: "/api/account/genealogy",
      checkBoard: "/api/account/check-board",
    },

    // Products
    products: {
      index: "/api/products",
      detail: (id: string) => `/api/products/${id}`,
      newArrivals: "/api/products/new-arrivals",
      foodEssentials: "/api/products/food-essentials",
      gadgetEssentials: "/api/products/gadget-essentials",
      flashSales: "/api/products/flash-sales",
      search: "/api/products/search",
      filter: "/api/products/filter",
    },

    // Product Management
    product: {
      detail: (id: string) => `/api/product/${id}`,
      inventory: "/api/product/inventory",
      upload: "/api/product/upload",
      edit: (id: string) => `/api/product/edit/${id}`,
      sectionFood: "/api/product/section/food",
      sectionGadget: "/api/product/section/gadget",
    },

    // Categories
    categories: {
      index: "/api/categories",
      detail: (id: string) => `/api/categories/${id}`,
      admin: "/api/category/admin",
      adminDetail: (id: string) => `/api/category/admin/${id}`,
    },

    // Orders
    orders: {
      index: "/api/orders",
      detail: (id: string) => `/api/orders/${id}`,
      stats: "/api/orders/stats",
    },

    // Reviews
    reviews: {
      submit: "/api/reviews/submit",
      pending: "/api/reviews/pending",
      byProduct: (id: string) => `/api/reviews/product/${id}`,
    },

    // Wallet
    wallet: {
      info: "/api/wallets",
      fund: "/api/wallets/fund",
      verify: "/api/wallets/verify",
      verifyAccount: "/api/wallets/verify-account",
      banks: "/api/wallets/banks",
      bankAccounts: "/api/wallets/bank-accounts",
      withdraw: "/api/wallets/withdraw",
    },

    // Payment
    payment: {
      initialize: "/api/payment/initialize",
      verify: "/api/payment/verify",
    },

    // Flutterwave
    flutterwave: {
      withdraw: "/api/flutterwave/withdraw",
      balance: "/api/flutterwave/balance",
    },

    // Affiliate
    affiliate: {
      board: "/api/affiliate/board",
      claimReward: "/api/affiliate/claim-reward",
      rewardClaim: "/api/affiliate/reward/claim",
    },

    // Admin
    admin: {
      stats: "/api/admin/stats",
      orders: "/api/admin/orders",
      orderStats: "/api/admin/orders/stats",
      reviews: "/api/admin/reviews",
      affiliates: "/api/admin/affiliates",
      transactions: "/api/admin/transactions",
      shippingRates: "/api/admin/shipping-rates",
      userById: (id: string) => `/api/admin/users/${id}`,
      userRewards: (id: string) => `/api/admin/users/${id}/rewards`,
      userDownlines: (id: string) => `/api/admin/users/${id}/downlines`,
      userNetwork: (id: string) => `/api/admin/users/${id}/network`,
    },

    // Shipping
    shipping: {
      calculate: "/api/shipping/calculate",
    },

    // File Upload
    upload: {
      image: "/api/image-upload",
      file: "/api/upload",
    },

    // Utility
    contact: "/api/contact",
    report: "/api/report",
    find: "/api/find/email",
    deals: "/api/deals-by-category",
    stockistApplication: "/api/stockist-application",
    cron: {
      processRewards: "/api/cron/process-rewards",
    },
    system: {
      migrateUsers: "/api/migrate-users",
      toggleShutdown: "/api/toggle-shutdown",
    },
  },

  // =====================
  // SYSTEM ROUTES
  // =====================
  maintenance: "/maintenance",
} as const;

/**
 * Type-safe route helper
 * Use: const href = getRoute('dashboard', 'orders');
 */
export type RouteKeys = keyof typeof routes;
