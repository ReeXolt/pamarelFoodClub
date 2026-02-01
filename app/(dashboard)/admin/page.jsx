'use client';

import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { SectionCards } from "@/components/section-cards";
import Transactions from "@/components/transaction";
import WalletDisplay from '@/components/wallets/Wallet';
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchAdminWallets = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/wallets', {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setWallets(data.wallets || []);
      } catch (err) {
        console.error('Failed to fetch admin wallets:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminWallets();
  }, [status]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500 bg-red-50 rounded-lg">
        <h2 className="font-bold">Error Loading Dashboard Data</h2>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionCards />
      
      <div className="my-5">
        <WalletDisplay wallets={wallets} />
      </div>
      
      <div className="px-4 lg:px-6 py-5">
        <ChartAreaInteractive />
      </div>
      
      {/* <Transactions /> */}
    </div>
  );
}