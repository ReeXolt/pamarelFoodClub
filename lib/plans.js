export const PLANS = {
  basic: {
    name: "BASIC FOOD PLAN",
    price: 1250,
    color: "green",
    boards: [
      {
        name: "Bronze Board",
        level: "Level 1",
        requirements1: "7 people",
        requirements2: "",
        earnings: [
          "Welcome FOODY BAG containing 250ml Honey, 100g Sea Salt and Bonus gadget",
          "OR ₦2,500 Cash Wallet"
        ],
        color: "bg-green-100",
        border: "border-green-300",
        icon: "🥉"
      },
      {
        name: "Silver Board",
        level: "Levels 1-2",
        requirements1: "7 people",
        requirements2: "7X7 (49 people)",
        earnings: [
          "Total: ₦27,000 Rewards",
          "Food Wallet: ₦5,000",
          "Cash Wallet: ₦5,000", 
          "Gadget Wallet: ₦2,500",
          "Automatic Registration into CLASSIC FOOD PLAN: ₦12,500",
          "CSR Donation: ₦1,000",
          "Arising Leader Bonus (complete within 30 days): ₦1,000 cash"
        ],
        color: "bg-gray-100",
        border: "border-gray-300",
        icon: "🥈"
      },
      {
        name: "Gold Board",
        level: "Levels 1-2",
        requirements1: "7 people",
        requirements2: "7X7 (49 people)",
        earnings: [
          "Total: ₦2,500,000 Rewards",
          "Food Wallet: ₦1,000,000 (₦100,000 monthly food supplies for 10 months)",
          "Gadget Wallet: ₦330,000",
          "Cash Wallet: ₦500,000",
          "Automatic Registration into DELUXE FOOD PLAN: ₦170,000",
          "HSF Project: ₦500,000"
        ],
        color: "bg-yellow-100",
        border: "border-yellow-300",
        icon: "🥇"
      }
    ]
  },
  classic: {
    name: "CLASSIC FOOD PLAN", 
    price: 12500,
    color: "purple",
    boards: [
      {
        name: "Bronze Board",
        level: "Level 1",
        requirements1: "7 people",
        requirements2: "",
        earnings: [
          "₦30,000 FOODY BAG"
        ],
        color: "bg-purple-100",
        border: "border-purple-300",
        icon: "🥉"
      },
      {
        name: "Silver Board",
        level: "Levels 1-2", 
        requirements1: "7 people",
        requirements2: "7X7 (49 people)",
        earnings: [
          "Total: ₦280,000 - ₦300,000 Rewards",
          "Food Wallet: ₦60,000",
          "Gadgets Wallet: ₦20,000",
          "Cash Wallet: ₦20,000",
          "Automatic Registration into DELUXE FOOD PLAN: ₦170,000",
          "CSR Donation: ₦10,000",
          "Arising Leader Bonus (complete within 30 days): Mini Breakfast Foody Bag valued at ₦20,000"
        ],
        color: "bg-gray-100",
        border: "border-gray-300", 
        icon: "🥈"
      },
      {
        name: "Gold Board",
        level: "Levels 1-2",
        requirements1: "7 people",
        requirements2: "7X7 (49 people)",
        earnings: [
          "Total: ₦20,000,000 Rewards",
          "Food Wallet: ₦2,000,000 (₦200,000 monthly food supplies for 10 months)",
          "Gadgets Wallet: ₦1,000,000", 
          "Cash Wallet: ₦2,000,000",
          "Finisher Bonus: ₦200,000",
          "Health Insurance: ₦1,000,000",
          "HSF Project: ₦1,000,000", 
          "Car Award: ₦10,000,000",
          "African Country Trip: ₦2,800,000"
        ],
        color: "bg-yellow-100",
        border: "border-yellow-300",
        icon: "🥇"
      }
    ]
  },
  deluxe: {
    name: "DELUXE FOOD PLAN",
    price: 170000,
    color: "gray", 
    boards: [
      {
        name: "Bronze Board",
        level: "Level 1",
        requirements1: "7 people",
        requirements2: "",
        earnings: [
          "Total: ₦300,000",
          "Cashback: ₦170,000",
          "FOODY BAG: ₦100,000", 
          "Gadget Wallet: ₦30,000"
        ],
        color: "bg-gray-100",
        border: "border-gray-300",
        icon: "🥉"
      },
      {
        name: "Silver Board",
        level: "Levels 1-2",
        requirements1: "7 people", 
        requirements2: "7X7 (49 people)",
        earnings: [
          "Total: ₦4,400,000 Rewards",
          "Food Wallet: ₦2,000,000 (₦200,000 monthly food supplies for 10 months)",
          "Gadget Wallet: ₦500,000",
          "Cash Wallet: ₦1,000,000",
          "CSR Donation: ₦100,000", 
          "Arising Leader Bonus (complete within 30 days): ₦87,500",
          "Reinvestment into CLASSIC FOOD PLAN with 57 accounts: ₦712,500"
        ],
        color: "bg-gray-800",
        border: "border-gray-900",
        icon: "🥈"
      },
      {
        name: "Gold Board",
        level: "Levels 1-2",
        requirements1: "Level 1: 7 people",
        requirements2: "Level 2: 7X7 (49 people)", 
        earnings: [
          "Level 1 Earnings: ₦20,000,000",
          "Level 2 Total: ₦100,000,000 Rewards",
          "Food Wallet: ₦9,000,000 (₦300,000 monthly food supplies for 30 months)",
          "Gadget Wallet: ₦5,000,000",
          "Cash Wallet: ₦10,000,000", 
          "Finisher Bonus: ₦640,000",
          "Reinvestment into DELUXE FOOD PLAN with 8 Accounts: ₦1,360,000",
          "Car Award: ₦20,000,000",
          "Housing Support: ₦40,000,000", 
          "International Trip: ₦9,000,000",
          "HSF: ₦5,000,000"
        ],
        color: "bg-gray-900",
        border: "border-black",
        icon: "🥇"
      }
    ]
  }
};