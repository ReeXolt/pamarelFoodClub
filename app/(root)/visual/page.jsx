'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const TeamStructureVisualization = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 my-10 bg-white rounded-xl shadow-md">
        <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Team Structure Explained
                </h2>
                
                <Link 
                href="/join-member" 
                className="inline-flex items-center text-amber-600 hover:text-amber-700 transition-colors duration-200 font-medium"
                >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 mr-2" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                >
                    <path 
                    fillRule="evenodd" 
                    d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                    clipRule="evenodd" 
                    />
                </svg>
                Back to Plans
                </Link>
            </div>
        </div>

      {/* Pyramid Visualization */}
      <div className="flex flex-col items-center space-y-6">
        {/* Level 0 - You */}
        <motion.div
          initial={{ scale: 0 }}
          whileInView={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <div className="w-24 h-24 rounded-full bg-amber-500 flex flex-col items-center justify-center text-white font-bold shadow-lg z-10">
            <span className="text-lg">YOU</span>
            <span className="text-sm font-normal">(1)</span>
          </div>
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 text-center text-sm text-gray-600">
            Level 0
          </div>
        </motion.div>

        {/* Connector */}
        <div className="h-8 w-0.5 bg-gray-300"></div>

        {/* Level 1 - Direct Team */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col items-center"
        >
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Direct Team (7 Members)</h3>
          <div className="flex flex-wrap justify-center gap-3 max-w-md">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="relative">
                <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold shadow-md">
                  {i+1}
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-4 text-center text-xs text-gray-600">
                  Level 1
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Connector */}
        <div className="h-8 w-0.5 bg-gray-300"></div>

        {/* Level 2 - Network Team */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          <h3 className="text-lg font-semibold mb-3 text-gray-700">Network Team (49 Members)</h3>
          <div className="grid grid-cols-7 gap-1 max-w-2xl">
            {[...Array(49)].map((_, i) => (
              <div 
                key={i} 
                className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center text-white text-xs shadow-sm"
              >
                {Math.floor(i/7)+1}.{i%7+1}
              </div>
            ))}
          </div>
          <div className="mt-2 text-sm text-gray-600">
            (7 members × 7 direct recruits)
          </div>
        </motion.div>
      </div>

      {/* Summary Table */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.9 }}
        className="mt-12 bg-gray-50 p-6 rounded-lg border border-gray-200"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800">Team Composition</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-amber-500 mr-2"></div>
              <span className="font-medium">You</span>
            </div>
            <div className="text-2xl font-bold text-amber-600">1</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-blue-500 mr-2"></div>
              <span className="font-medium">Direct Team</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">7</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 rounded-full bg-green-500 mr-2"></div>
              <span className="font-medium">Network Team</span>
            </div>
            <div className="text-2xl font-bold text-green-600">49</div>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Team Size:</span>
            <span className="text-xl font-bold">57 Members</span>
          </div>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="mt-8"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-800">How The System Works</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm font-bold">1</div>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">You join as a member</p>
              <p className="text-gray-600">Register with ₦4,000 for the Basic Food Plan</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold">2</div>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">Recruit 7 direct members</p>
              <p className="text-gray-600">These are people you personally bring into the business</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">3</div>
            </div>
            <div className="ml-3">
              <p className="font-medium text-gray-800">Your team grows to 49</p>
              <p className="text-gray-600">Each of your 7 members recruits 7 people (7×7=49)</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamStructureVisualization;