"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, Banknote, Star, Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSummary() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    deliveredOrders: 0,
    totalSpent: 0,
    pendingReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/orders/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = await response.json();
        if (data.success) {
          setStats({
            totalOrders: data.stats.totalOrders,
            deliveredOrders: data.stats.deliveredOrders,
            totalSpent: data.stats.totalSpent,
            pendingReviews: 0 // You'll need to add this to your API if needed
          });
        }
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const summaryData = [
    {
      icon: <Package className="h-6 w-6 text-muted-foreground" />,
      title: "Total Orders",
      value: stats.totalOrders,
    },
    {
      icon: <Banknote className="h-6 w-6 text-muted-foreground" />,
      title: "Total Spent",
      value: `₦${formatPrice(stats.totalSpent)}`,
    },
    {
      icon: <Truck className="h-6 w-6 text-muted-foreground" />,
      title: "Delivered",
      value: stats.deliveredOrders,
    },
    {
      icon: <Star className="h-6 w-6 text-muted-foreground" />,
      title: "Pending Reviews",
      value: stats.pendingReviews,
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {summaryData.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-4">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-red-600">
            <p>Error loading statistics: {error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-700 underline"
            >
              Try again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {summaryData.map(item => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            {item.icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}