"use client";

import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { PLANS } from '@/lib/plans';
import Link from 'next/link';

export default function PlanComponent({ planType }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });
  const plan = PLANS[planType];

  const handleRegister = async () => {
    if (!session?.user) {
      router.push(`/auth/login?callbackUrl=/plans/${planType}`);
      return;
    }

    setIsProcessing(true);
    setPaymentError(null);

    try {
      const response = await fetch('/api/payment/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: session.user.email,
          amount: plan.price,
          planType,
          userId: session.user.id,
          metadata: {
            username: session.user.username,
            planName: plan.name
          }
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Open payment in new tab with fallback
      const newWindow = window.open(data.authorizationUrl, '_blank');
      if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
        window.location.href = data.authorizationUrl;
      }

    } catch (error) {
      console.error('Payment initialization error:', error);
      setPaymentError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };


  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600 font-semibold">
        Invalid plan type
      </div>
    );
  }

  

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl font-bold text-gray-900 sm:text-5xl"
          >
            <span className={`bg-clip-text bg-gradient-to-r text-${plan.color}-500`}>
              {plan.name}
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
          >
            {planType === 'basic' ? 'Progress through our 3-board system to unlock increasing rewards' :
             planType === 'classic' ? 'Gold-tier rewards with our 3-level compensation plan' :
             'Black-tier elite rewards with our highest compensation plan'}
          </motion.p>
        </div>

        {/* Registration Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className={`bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-${plan.color}-400 mb-16`}
        >
          <div className={`bg-gradient-to-r from-${plan.color}-400 to-${plan.color}-500 px-8 py-6`}>
            <h2 className="text-2xl font-bold text-black">
              {planType === 'basic' ? 'Start Your Journey' : 
               planType === 'classic' ? 'Start Earning Big' : 'Elite Membership'}
            </h2>
            <p className={`text-gray-800 mt-1`}>
              Register for the {plan.name}
            </p>
          </div>
          <div className="px-8 py-6 bg-white">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                <p className="text-gray-600 mt-1">
                  {planType === 'basic' ? 'Your entry point to the Pamarel system' :
                   planType === 'classic' ? 'Premium rewards with our gold-tier plan' :
                   'Our highest tier with elite rewards'}
                </p>
                <div className={`mt-4 text-${plan.color}-600 font-bold text-xl`}>₦{plan.price.toLocaleString()} Registration</div>
              </div>
              <Button 
                // onClick={handleRegister}
                // disabled={isProcessing}
                className={`inline-flex items-center justify-center px-8 py-6 border border-transparent text-base font-medium rounded-md text-white bg-${plan.color}-600 hover:bg-${plan.color}-700 md:py-6 md:text-lg md:px-10 transition-all duration-200 hover:shadow-lg`}
              >
                <Link href={`/auth/register?planType=${planType}`}>
                  Join {planType === 'deluxe' ? 'Deluxe' : plan.name.split(' ')[0]} Plan
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Board Progression */}
        <div className="mb-20" ref={ref}>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            {planType === 'basic' ? 'Board Progression Path' : 'Compensation Structure'}
            <span className={`text-${plan.color}-600`}> {planType === 'basic' ? '' : ''}</span>
          </motion.h2>
          
          {/* Connecting Line Container */}
          <div className="relative">
            {/* Horizontal Connecting Line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={inView ? { scaleX: 1 } : {}}
              transition={{ delay: 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className={`hidden lg:block absolute h-1 bg-gradient-to-r from-${plan.color}-300 via-${plan.color}-400 to-${plan.color}-500 top-1/2 left-16 right-16 -translate-y-1/2 rounded-full`}
              style={{ originX: 0 }}
            />
            
            {/* Board Grid */}
            <motion.div 
              variants={container}
              initial="hidden"
              animate={inView ? "show" : ""}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10"
            >
              {plan.boards.map((board, index) => (
                <motion.div 
                  key={index}
                  variants={item}
                  className={`relative rounded-xl overflow-hidden border-2 ${board.border} bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2`}
                >
                  {/* Board Header */}
                  <div className={`px-6 py-5 ${board.color} border-b-2 ${board.border}`}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{board.icon}</span>
                      <div>
                        <h3 className={`text-xl font-bold ${
                          board.color.includes('800') || board.color.includes('900') || board.color.includes('black') 
                            ? 'text-white' 
                            : 'text-gray-900'
                        }`}>
                          {board.name}
                        </h3>
                        <p className={`text-sm font-medium ${
                          board.color.includes('800') || board.color.includes('900') || board.color.includes('black') 
                            ? 'text-gray-300' 
                            : 'text-gray-700'
                        }`}>
                          {board.level}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Board Content */}
                  <div className="px-6 py-5">
                    <div className="mb-5">
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Requirements</h4>
                      <p className="mt-1 text-gray-700 font-medium">{board.requirements1}</p>

                      {/* {board.requirement2 && ( */}
                        <p className="mt-1 text-gray-700 font-medium">{board.requirements2}</p>
                      {/* )} */}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Rewards</h4>
                      <ul className="space-y-3">
                        {board.earnings.map((item, i) => (
                          <motion.li 
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={inView ? { opacity: 1, x: 0 } : {}}
                            transition={{ delay: 0.6 + (index * 0.1) + (i * 0.05) }}
                            className="flex items-start"
                          >
                            <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-700">{item}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Progress Indicator (mobile) */}
                  {index < plan.boards.length - 1 && (
                    <div className="lg:hidden absolute -bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                      <div className="h-8 w-8 flex items-center justify-center bg-white rounded-full border-2 border-gray-300 shadow-md">
                        <svg className={`h-5 w-5 text-${plan.color}-600 rotate-90`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
        {paymentError && (
          <div className="mt-4 text-red-600 text-sm">
            {paymentError}
          </div>
        )}
      </div>
    </div>
  );
}