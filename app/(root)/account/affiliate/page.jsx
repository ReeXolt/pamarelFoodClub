"use client";
import UserDashboard from "@/components/account/UserDashboard";
import { AffiliateProgress } from "@/components/layout/AffiliateProgress";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";

export default function AffiliatePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);
  
  // Show loading state while session is being fetched
  if (status === "loading") {
    return <div>Loading...</div>;
  }
  
  // Return null or loading while redirecting
  if (!session) {
    return <div>Redirecting...</div>
  }
  
  return (
    <div className="container mx-auto p-4 space-y-8">
      <UserDashboard userId={session.user.id} />
      
      {/* How the Network Works Section */}
      <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 text-center">
          How the Network Works
        </h2>
        
        <div className="space-y-8">
          {/* First Image - Simple 1-to-7 Structure */}
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Direct Team Structure
            </h3>
            <p className="text-gray-600 mb-4 text-center max-w-2xl mx-auto">
              As a member, you start by recruiting 7 direct members. Each of these members becomes part of your direct team, 
              forming the foundation of your network.
            </p>
            <div className="flex justify-center">
              <div className="relative w-full max-w-2xl aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/network-structure-1.jpeg"
                  alt="Direct Team Structure - One person managing 7 direct members"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="mt-4 bg-white rounded-lg p-4 border border-purple-200">
              <h4 className="font-semibold text-gray-800 mb-2">Key Points:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li>You are at the top of your network</li>
                <li>You recruit 7 direct members (Level 1)</li>
                <li>Each direct member can also recruit 7 members</li>
                <li>This creates exponential growth in your network</li>
              </ul>
            </div>
          </div>

          {/* Second Image - Deep MLM Tree Structure */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Complete Network Structure
            </h3>
            <p className="text-gray-600 mb-4 text-center max-w-2xl mx-auto">
              Your network expands through multiple levels. Each member in your team recruits 7 members, 
              and those members recruit 7 more, creating a powerful multi-level network structure.
            </p>
            <div className="flex justify-center">
              <div className="relative w-full max-w-4xl aspect-video bg-black rounded-lg overflow-hidden shadow-xl">
                <Image
                  src="/images/network-structure-2.jpeg"
                  alt="Complete Network Structure - Multi-level MLM tree with 7 levels"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <div className="mt-4 bg-white rounded-lg p-4 border border-green-200">
              <h4 className="font-semibold text-gray-800 mb-2">Network Levels Explained:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                <li><strong>Level 1:</strong> Your 7 direct recruits (1.1, 1.2, ..., 1.7)</li>
                <li><strong>Level 2:</strong> Each direct recruit brings 7 members (49 total)</li>
                <li><strong>Level 3+:</strong> The network continues to expand exponentially</li>
                <li><strong>Labeling System:</strong> Numbers like "1.1", "2.3" show the position in the network hierarchy</li>
                <li>The first number indicates which Level 1 member they're under</li>
                <li>The second number shows their position within that branch</li>
              </ul>
            </div>
          </div>

          {/* How It Works Steps */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
              How to Build Your Network
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                <div className="w-12 h-12 rounded-full bg-purple-500 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  1
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-center">Start Your Journey</h4>
                <p className="text-sm text-gray-600 text-center">
                  Join with a plan and get your unique referral code. Share it with friends and family.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  2
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-center">Recruit 7 Direct Members</h4>
                <p className="text-sm text-gray-600 text-center">
                  Each person who joins using your referral code becomes part of your direct team. 
                  Aim to recruit 7 direct members to complete your Bronze board.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-5 shadow-sm border border-gray-200">
                <div className="w-12 h-12 rounded-full bg-green-500 text-white flex items-center justify-center text-xl font-bold mb-4 mx-auto">
                  3
                </div>
                <h4 className="font-semibold text-gray-800 mb-2 text-center">Watch Your Network Grow</h4>
                <p className="text-sm text-gray-600 text-center">
                  As your direct members recruit their own teams, your network expands exponentially. 
                  You earn rewards as your network grows through different board levels.
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Network Benefits
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Exponential Growth</h4>
                  <p className="text-sm text-gray-600">7 members become 49, then 343, and so on - your network grows rapidly!</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Multiple Income Streams</h4>
                  <p className="text-sm text-gray-600">Earn from direct recruits and your network's growth across all levels.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Board Progression</h4>
                  <p className="text-sm text-gray-600">Advance through Bronze, Silver, Gold, and Platinum boards with increasing rewards.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-yellow-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 mt-1">
                  ✓
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800">Passive Growth</h4>
                  <p className="text-sm text-gray-600">Your network continues to grow even as your direct members build their own teams.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}