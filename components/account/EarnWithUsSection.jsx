"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export function EarnWithUsSection() {
  return (
    <section className="w-full bg-gradient-to-br from-indigo-50 to-purple-50 py-24">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex flex-col items-center gap-12 lg:flex-row lg:gap-16">
          {/* Content Section - Right Side */}
          <div className="flex-1 space-y-8">
            <h2 className="font-display text-4xl font-bold text-gray-900 md:text-5xl leading-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">4-Board</span><br />
              Matrix <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">System</span>
            </h2>
            
            <p className="text-xl text-gray-700 leading-relaxed">
              Pamarel's straightforward matrix requires just 7 members per level across 4 boards to unlock your full earning potential.
            </p>
            
            {/* 2x2 Board Grid for Large Screens */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Bronze Board */}
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-amber-500 h-full"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-amber-100 text-amber-800 rounded-lg px-3 py-1 font-bold">Bronze</div>
                  <h3 className="font-display text-xl font-bold text-gray-900">Board</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg">
                    <div className="bg-amber-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-medium">Level 1</p>
                      <p className="text-sm text-amber-800">7 members</p>
                    </div>
                  </div>
                  <div className="text-center py-2 bg-amber-100 rounded-lg">
                    <p className="text-sm font-medium">Earns</p>
                    <p className="text-lg font-bold text-amber-800">₦13,000</p>
                  </div>
                </div>
              </motion.div>

              {/* Silver Board */}
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-gray-400 h-full"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gray-100 text-gray-800 rounded-lg px-3 py-1 font-bold">Silver</div>
                  <h3 className="font-display text-xl font-bold text-gray-900">Board</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-gray-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-medium">Level 1</p>
                      <p className="text-sm text-gray-700">7 members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="bg-gray-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="font-medium">Level 2</p>
                      <p className="text-sm text-gray-700">7 × 7 members</p>
                    </div>
                  </div>
                  <div className="text-center py-2 bg-gray-100 rounded-lg">
                    <p className="text-sm font-medium">Earns</p>
                    <p className="text-lg font-bold text-gray-800">₦100K-110K</p>
                  </div>
                </div>
              </motion.div>

              {/* Gold Board */}
              <motion.div 
                className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-yellow-500 h-full"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-yellow-100 text-yellow-800 rounded-lg px-3 py-1 font-bold">Gold</div>
                  <h3 className="font-display text-xl font-bold text-gray-900">Board</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="bg-yellow-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-medium">Level 1</p>
                      <p className="text-sm text-yellow-800">7 members</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="bg-yellow-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="font-medium">Level 2</p>
                      <p className="text-sm text-yellow-800">7 × 7 members</p>
                    </div>
                  </div>
                  <div className="text-center py-2 bg-yellow-100 rounded-lg">
                    <p className="text-sm font-medium">Earns</p>
                    <p className="text-lg font-bold text-yellow-800">₦1.3M</p>
                  </div>
                </div>
              </motion.div>

              {/* Platinum Board */}
              {/* <motion.div 
                className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500 h-full"
                whileHover={{ y: -5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-100 text-blue-800 rounded-lg px-3 py-1 font-bold">Platinum</div>
                  <h3 className="font-display text-xl font-bold text-gray-900">Board</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-500 text-white rounded-full h-8 w-8 flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-medium">Level 1</p>
                      <p className="text-sm text-blue-800">7 members</p>
                    </div>
                  </div>
                  <div className="text-center py-2 bg-blue-100 rounded-lg">
                    <p className="text-sm font-medium">Earns</p>
                    <p className="text-lg font-bold text-blue-800">₦14M</p>
                  </div>
                </div>
              </motion.div> */}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row pt-4">
              <Button asChild className="bg-gradient-to-r from-primary to-purple-600 px-10 py-7 text-lg font-semibold hover:from-primary/90 hover:to-purple-600/90">
                <Link href="/register">
                  <span className="drop-shadow-sm">Start Building Now →</span>
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="px-10 py-7 text-lg font-semibold border-2 border-gray-300 hover:bg-white/90">
                <Link href="/visual">
                  <span className="text-gray-800">How It Works</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}