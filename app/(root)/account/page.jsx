'use client';

import { DashboardSummary } from "@/components/account/dashboard-summary";
import { OrderHistory } from "@/components/account/order-history";
import { PendingReviews } from "@/components/account/pending-reviews";
import { AffiliateProgress } from "@/components/layout/AffiliateProgress";
import { Separator } from "@/components/ui/separator";
import WalletDisplay from "@/components/wallets/Wallet";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchWallets = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/wallets', {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch wallets: ${response.status}`);
        }

        const data = await response.json();
        setWallets(data.wallets || []);
      } catch (err) {
        console.error('Failed to fetch wallets:', err);
        setError(`${JSON.stringify(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchWallets();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-muted-foreground">
            Welcome back! Loading your account data...
          </p>
        </div>
        <div className="flex justify-center items-center h-64">
          <p>Loading wallets...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold">My Account</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's a summary of your account activity.
          </p>
        </div>
        
        <div className="p-4 text-red-500 bg-red-50 rounded-lg">
          <h2 className="font-bold">Error Loading Account Data</h2>
          <p>{error}</p>
          <p className="text-sm mt-2">
            Please try refreshing the page or contact support if the problem persists.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">My Account</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's a summary of your account activity.
        </p>
      </div>
      
      <DashboardSummary />

      
      <div className="my-5">
        <WalletDisplay wallets={wallets} />
      </div>
      
      <Separator />
      <PendingReviews />
      <Separator />
      <OrderHistory />
    </div>
  );
}