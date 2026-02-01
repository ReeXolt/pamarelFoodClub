"use client";

import { useState, useEffect } from 'react';
import { OrderCard } from './order-card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Skeleton } from '@/components/ui/skeleton';

export function OrderHistory({ showAll = false }) {
    const [filter, setFilter] = useState('all');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { data: session } = useSession();
    
    useEffect(() => {
        if (session) {
            fetchOrders();
        }
    }, [filter, session]);
    
    const fetchOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/orders?status=${filter === 'all' ? 'all' : filter}`);
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();
            setOrders(data);
        } catch (error) {
            console.error("Error fetching orders:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const filteredOrders = orders
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const displayedOrders = showAll ? filteredOrders : filteredOrders.slice(0, 3); 

    if (loading) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-baseline mb-6">
                 <h2 className="text-xl font-bold">Order History</h2>
                 <div className="flex items-center gap-2 mt-4 sm:mt-0">
                    <Select value={filter} onValueChange={(value) => setFilter(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter orders" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Orders</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                 </div>
            </div>
            {displayedOrders.length > 0 ? (
                <div className="space-y-4">
                    {displayedOrders.map(order => (
                        <OrderCard key={order._id} order={order} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">You have no orders with this status.</p>
                </div>
            )}
             {!showAll && filteredOrders.length > 3 && (
                <div className="mt-8 text-center">
                    <Button asChild variant="outline">
                        <Link href="/account/orders">View All Orders</Link>
                    </Button>
                </div>
             )}
        </div>
    );
}