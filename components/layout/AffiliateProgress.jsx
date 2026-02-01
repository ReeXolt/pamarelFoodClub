'use client';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowRight, Info, Users, Trophy, Gift, Wallet, Copy, Check } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { PLANS } from "@/lib/plans";

const ReferralLink = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const referralLink = typeof window !== 'undefined' ? `${window.location.origin}/auth/register?ref=${code}` : '';

  const copyToClipboard = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success('Referral link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
      <h3 className="font-medium mb-2">Your Referral Link</h3>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={referralLink}
          readOnly
          className="flex-1 p-2 border rounded-md bg-white text-sm"
        />
        <button
          onClick={copyToClipboard}
          className="p-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Share this link to recruit members and earn rewards
      </p>
    </div>
  );
};

const BoardCard = ({ board, data, isCurrent, isClaiming, onClaim, planColor, currentPlan }) => {
  const boardInfo = {
    bronze: { name: 'Bronze', color: 'bg-amber-500' },
    silver: { name: 'Silver', color: 'bg-gray-400' },
    gold: { name: 'Gold', color: 'bg-yellow-500' },
    platinum: { name: 'Platinum', color: 'bg-blue-500' }
  };

  // Get the correct plan's board rewards
  const getPlanRewards = (boardType) => {
    const plan = PLANS[currentPlan?.toLowerCase()] || PLANS.basic;
    const boardData = plan.boards.find(b => 
      b.name.toLowerCase().includes(boardType)
    );
    return boardData?.earnings || [];
  };

  const rewards = getPlanRewards(board);

  // Calculate progress percentage
  const progressPercentage = data.requirements.indirect === 0
    ? Math.min(100, Math.round((data.current.direct / data.requirements.direct) * 100))
    : Math.min(100, Math.round(
        ((data.current.direct + data.current.indirect) / 
        (data.requirements.direct + data.requirements.indirect)) * 100
      ));

  return (
    <div className={cn(
      `relative border rounded-xl p-4 transition-all`,
      isCurrent ? 'ring-2 shadow-md' : 'hover:shadow-md',
      isCurrent ? `ring-${planColor}-500` : ''
    )}>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center mb-2">
            <div className={`w-3 h-3 rounded-full ${boardInfo[board].color} mr-2`}></div>
            <h4 className="font-medium text-sm">{boardInfo[board].name}</h4>
          </div>
          <p className="text-xs text-muted-foreground mb-3">{data.description}</p>
          
          {!data.completed ? (
            <>
              <div className="mb-2">
                <Progress value={progressPercentage} className="h-2" />
                <div className="flex justify-between text-xs mt-1">
                  <span>
                    {data.requirements.indirect === 0
                      ? `${data.current.direct}/${data.requirements.direct} direct`
                      : `${data.current.direct}/${data.requirements.direct} direct, ${data.current.indirect}/${data.requirements.indirect} indirect`}
                  </span>
                  <span>{progressPercentage}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reward:</span>
                <span className="font-medium text-right">
                  {rewards.join(', ')}
                </span>
              </div>
            </>
          ) : data.rewardClaimed ? (
            <>
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reward Claimed:</span>
                <span className="font-medium text-green-600">
                  {rewards.join(', ')}
                </span>
              </div>
              <Button
                disabled
                className="w-full bg-gray-100 text-gray-400 cursor-not-allowed"
              >
                Already Claimed
              </Button>
            </>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reward Earned:</span>
                <span className="font-medium text-green-600">
                  {rewards.join(', ')}
                </span>
              </div>
              <Button
                onClick={() => onClaim(board)}
                disabled={isClaiming === board}
                className={cn(
                  "w-full hover:bg-green-700",
                  isClaiming === board ? 'bg-green-600/80' : 'bg-green-600'
                )}
              >
                {isClaiming === board ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Claiming...
                  </>
                ) : (
                  'Claim Reward'
                )}
              </Button>
            </>
          )}
        </div>
        
        <div className={`p-2 rounded-lg ${isCurrent ? `bg-${planColor}-100` : 'bg-muted'}`}>
          <span className="text-lg">{data.icon}</span>
        </div>
      </div>
      
      {data.completed && (
        <div className="absolute -top-2 -right-2">
          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, description, icon, isCurrency = false }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        {icon}
      </div>
      <p className="text-2xl font-bold">
        {isCurrency ? `₦${value.toLocaleString()}` : value.toLocaleString()}
      </p>
      <Tooltip>
        <TooltipTrigger className="mt-2 text-xs text-muted-foreground flex items-center">
          <Info className="w-3 h-3 mr-1" />
          {description}
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-sm max-w-xs">{description}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

// ... existing imports ...

// ... BoardCard component ... (no major changes needed inside BoardCard itself, logic is in parent)

export const AffiliateProgress = () => {
  const { data: session } = useSession();
  const [affiliateData, setAffiliateData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(null);
  
  // Modal State
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimingBoard, setClaimingBoard] = useState(null);
  const [rewardOptions, setRewardOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');

  // ... fetchAffiliateData ...

  const handleClaimClick = (boardType) => {
    // 1. Get rewards for this board
    const plan = PLANS[affiliateData.currentPlan?.toLowerCase().split(' ')[0]] || PLANS.basic;
    const boardData = plan.boards.find(b => b.name.toLowerCase().includes(boardType));
    const earnings = boardData?.earnings || [];

    // 2. Check for OR options
    const orEarning = earnings.find(e => e.includes('OR'));
    
    if (orEarning) {
      // 3. Parse options
      const options = orEarning.split('OR').map(opt => opt.trim());
      setRewardOptions(options);
      setClaimingBoard(boardType);
      setSelectedOption(options[0]); // Default to first
      setShowClaimModal(true);
    } else {
      // 4. No options, direct claim
      executeClaim(boardType, 'auto');
    }
  };

  const executeClaim = async (boardType, option) => {
    setIsClaiming(boardType);
    setShowClaimModal(false); // Close if open
    
    try {
      const response = await fetch('/api/affiliate/claim-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          boardType,
          rewardOption: option 
        })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error || 'Claim failed');
      
      toast.success(data.message);
      
      // Refresh data
      const updatedResponse = await fetch('/api/affiliate/board');
      const updatedData = await updatedResponse.json();
      setAffiliateData(updatedData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsClaiming(null);
      setClaimingBoard(null);
      setRewardOptions([]);
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (!affiliateData) return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
      <p className="text-red-600">Error loading affiliate data</p>
      <Button 
        variant="outline" 
        className="mt-2"
        onClick={() => window.location.reload()}
      >
        Retry
      </Button>
    </div>
  );

  const currentBoardData = affiliateData.boards[affiliateData.currentBoard];
  const planColorMap = {
    basic: 'green',
    classic: 'purple',
    deluxe: 'black'
  };
  const planColor = planColorMap[affiliateData.currentPlan?.toLowerCase().split(' ')[0]] || 'green';

  return (
    <>
      <Card className="mb-6 border-0 shadow-lg">
        {/* ... existing CardHeader ... */}
        <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-primary" />
                <span className="text-xl sm:text-2xl font-bold">Affiliate Dashboard</span>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4">
                <Badge 
                variant="outline" 
                className={cn(
                    "px-2 py-0.5 sm:px-3 sm:py-1 text-xs sm:text-sm capitalize w-full sm:w-auto text-center",
                    `bg-${planColor}-100 text-${planColor}-800 border-${planColor}-300`
                )}
                >
                {affiliateData.currentPlan}
                </Badge>
                <ReferralLink code={affiliateData.referralCode} />
            </div>
            </CardTitle>
        </CardHeader>

        <CardContent className="space-y-8">
            {/* ... Wallets ... */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard 
                title="Cash Wallet"
                value={affiliateData.wallets?.cash || 0}
                description="Available cash balance for withdrawals"
                icon={<Wallet className="w-5 h-5 text-green-500" />}
                isCurrency
            />
            <StatCard 
                title="Food Wallet"
                value={affiliateData.wallets?.food || 0}
                description="Food credits for purchasing food items"
                icon={<Gift className="w-5 h-5 text-amber-500" />}
                isCurrency
            />
            <StatCard 
                title="Gadget Wallet"
                value={affiliateData.wallets?.gadget || 0}
                description="Credits for purchasing gadgets"
                icon={<Gift className="w-5 h-5 text-blue-500" />}
                isCurrency
            />
            </div>

            {/* ... Board Progression ... */}
            <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-primary" />
                Board Progression
                </h3>
                <div className="text-sm text-muted-foreground">
                Lifetime: {affiliateData.lifetimeStats?.totalRecruits || 0} recruits • 
                {affiliateData.lifetimeStats?.rewardsClaimed || 0} rewards claimed
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                {['bronze', 'silver', 'gold', 'platinum'].map(board => (
                <BoardCard 
                    key={board}
                    board={board}
                    data={affiliateData.boards[board]}
                    isCurrent={affiliateData.currentBoard === board}
                    isClaiming={isClaiming === board}
                    onClaim={handleClaimClick} // Changed to handleClaimClick
                    planColor={planColor}
                    currentPlan={affiliateData.currentPlan}
                />
                ))}
            </div>
            </div>

            {/* ... Team Stats ... */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2 text-primary" />
                Current Board Team Overview ({affiliateData.currentBoard})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                title="Direct Team"
                value={currentBoardData?.current?.direct || 0}
                description="Members you personally recruited in current board"
                icon={<Users className="w-5 h-5 text-blue-500" />}
                />
                <StatCard 
                title="Network Team"
                value={currentBoardData?.current?.indirect || 0}
                description="Your team's indirect recruits in current board"
                icon={<Users className="w-5 h-5 text-purple-500" />}
                />
                <StatCard 
                title="Total Team"
                value={(currentBoardData?.current?.direct || 0) + (currentBoardData?.current?.indirect || 0)}
                description="Your complete team in current board"
                icon={<Users className="w-5 h-5 text-green-500" />}
                />
            </div>
            </div>
        </CardContent>
      </Card>

      {/* Claim Reward Modal */}
      <Dialog open={showClaimModal} onOpenChange={setShowClaimModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Your Reward</DialogTitle>
            <DialogDescription>
              Please choose one of the available reward options for completing this board.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption}>
              {rewardOptions.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 border p-3 rounded-lg hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedOption(option)}>
                  <RadioGroupItem value={option} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-medium">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter className="sm:justify-end">
             <Button
              type="button"
              variant="secondary"
              onClick={() => setShowClaimModal(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              onClick={() => executeClaim(claimingBoard, selectedOption)}
              disabled={!selectedOption}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Claim
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};