"use client";

import { useState } from 'react';
import BasicFoodPlan from "./basic-food-plan";
import ClassicFoodPlan from "./classic-food-plan";
import PremiumFoodPlan from './premium-food-plan';
import { motion } from 'framer-motion';

export default function JoinMember() {
  const [activeTab, setActiveTab] = useState('basic');

  const tabs = [
    { id: 'basic', label: 'Basic Plan', color: 'from-green-400 to-green-500' },
    { id: 'classic', label: 'Classic Plan', color: 'from-purple-500 to-purple-600' },
    { id: 'premium', label: 'Deluxe Plan', color: 'from-gray-700 to-gray-900' }
  ];

  
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-900 sm:text-5xl mb-4"
          >
            Choose Your <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-amber-600">Food Plan</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Select the plan that matches your goals and start earning rewards today
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-12">
          <div className="inline-flex rounded-xl bg-gray-200 p-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-6 py-3 rounded-lg text-sm font-medium transition-colors focus:outline-none ${
                  activeTab === tab.id 
                    ? 'text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {activeTab === tab.id && (
                  <motion.span
                    layoutId="activeTab"
                    className={`absolute inset-0 bg-gradient-to-r ${tab.color} rounded-lg`}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
        >
          {activeTab === 'basic' && <BasicFoodPlan />}
          {activeTab === 'classic' && <ClassicFoodPlan />}
          {activeTab === 'premium' && <PremiumFoodPlan />}
        </motion.div>

        {/* Comparison CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Not sure which plan is right for you?</h2>
          <p className="text-lg text-gray-600 mb-6 max-w-3xl mx-auto">
            Compare all plans to see which one matches your goals
          </p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-block"
          >
            <button
              onClick={() => {
                // Scroll to comparison section or open modal
                document.getElementById('plan-comparison')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 transition-all duration-200 hover:shadow-lg"
            >
              Compare All Plans
            </button>
          </motion.div>
        </motion.div>

        <div id="plan-comparison" className="mt-16 px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-900 mb-8 sm:mb-12">Plan Comparison</h2>
          
          <div className="relative">
            {/* Scrollable container */}
            <div className="overflow-x-auto pb-4">
              <div className="inline-block min-w-full rounded-xl shadow-lg">
                <div className="min-w-[800px] md:min-w-full bg-white rounded-xl overflow-hidden">
                  {/* Header Row */}
                  <div className="grid grid-cols-4 min-w-full">
                    <div className="p-4 sm:p-6 bg-gray-50 sticky left-0 z-10">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900">Features</h3>
                    </div>
                    <div className="p-4 sm:p-6 bg-green-800">
                      <h3 className="text-sm sm:text-base font-bold text-gray-50">Basic</h3>
                      <p className="text-xs sm:text-sm text-gray-50 font-medium mt-1">₦1,250</p>
                    </div>
                    <div className="p-4 sm:p-6 bg-purple-800">
                      <h3 className="text-sm sm:text-base font-bold text-gray-50">Classic</h3>
                      <p className="text-xs sm:text-sm text-gray-50 font-medium mt-1">₦12,500</p>
                    </div>
                    <div className="p-4 sm:text-sm sm:p-6 bg-gray-800 text-white">
                      <h3 className="text-sm sm:text-base font-bold">Deluxe</h3>
                      <p className="text-xs sm:text-sm text-gray-300 font-medium mt-1">₦170,000</p>
                    </div>
                  </div>

                  {/* Comparison Rows */}
                  {[
                    { feature: "Registration Fee", basic: "₦1,250", classic: "₦12,500", premium: "₦170,000" },
                    { feature: "Total Gold Board Earnings", basic: "₦2.5M", classic: "₦20M", premium: "₦120M" },
                    { feature: "Bronze Board Earnings", basic: "Foody Bag + Bonus", classic: "₦30,000 Foody Bag", premium: "₦300,000 Total" },
                    { feature: "Silver Board Earnings", basic: "₦27,000 Total", classic: "₦280K-300K Total", premium: "₦4.4M Total" },
                    { feature: "Gold Board Earnings", basic: "₦2.5M Total", classic: "₦20M Total", premium: "₦120M Total" },
                    { feature: "Food Wallet", basic: "✓", classic: "✓", premium: "✓" },
                    { feature: "Cash Wallet", basic: "✓", classic: "✓", premium: "✓" },
                    { feature: "Gadget Wallet", basic: "✓", classic: "✓", premium: "✓" },
                    { feature: "Arising Leader Bonus", basic: "₦1,000 Cash", classic: "₦20,000 Foody Bag", premium: "₦87,500 Cash" },
                    { feature: "Car Incentive", basic: "✗", classic: "₦10M Car", premium: "₦20M Car" },
                    { feature: "Travel Incentive", basic: "✗", classic: "African Trip", premium: "International Trip" },
                    { feature: "Health Insurance", basic: "✗", classic: "₦1M Coverage", premium: "✓" },
                    { feature: "Housing Support", basic: "✗", classic: "✗", premium: "₦40M Support" },
                    { feature: "CSR Donation", basic: "₦1,000", classic: "₦10,000", premium: "₦100,000" },
                    { feature: "HSF Project", basic: "₦500,000", classic: "₦1,000,000", premium: "₦5,000,000" },
                    { feature: "Automatic Upgrade", basic: "→ Classic", classic: "→ Deluxe", premium: "✗" },
                    { feature: "Requirements", basic: "7 people per level", classic: "7 people per level", premium: "7 people per level" },
                  ].map((row, index) => (
                    <div key={index} className="grid grid-cols-4 min-w-full border-t border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="p-3 sm:p-4 bg-gray-50 sticky left-0 z-10">
                        <p className="text-xs sm:text-sm font-medium text-gray-700">{row.feature}</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-green-900">
                        <p className="text-xs sm:text-sm text-gray-200">{row.basic}</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-purple-900">
                        <p className="text-xs sm:text-sm text-gray-200">{row.classic}</p>
                      </div>
                      <div className="p-3 sm:p-4 bg-gray-900">
                        <p className="text-xs sm:text-sm text-gray-200">{row.premium}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Scroll indicator for mobile */}
            <div className="md:hidden absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
              <svg className="w-6 h-6 animate-bounce-x" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Mobile-friendly key */}
          <div className="mt-6 md:hidden bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-bold text-gray-700 mb-2">Key:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <span className="mr-2">✓</span>
                <span>Included</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">✗</span>
                <span>Not Included</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">₦</span>
                <span>Naira Value</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">M</span>
                <span>Million</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">K</span>
                <span>Thousand</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">→</span>
                <span>Upgrade to</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}