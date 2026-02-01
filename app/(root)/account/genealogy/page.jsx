"use client";

import { useEffect, useState } from 'react';
import GenealogyTree from '@/components/account/GenealogyTree';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserPlus, Trophy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import Link from 'next/link';

export default function GenealogyPage() {
    const [data, setData] = useState(null);
    const [stats, setStats] = useState({ totalDownlines: 0, directReferrals: 0 });
    const [userInfo, setUserInfo] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/account/genealogy');
                const json = await res.json();
                
                if (json.success) {
                    setData(json.downlines);
                    setStats(json.stats);
                    setUserInfo(json.user);
                }
            } catch (error) {
                console.error("Failed to fetch genealogy", error);
                toast.error("Failed to load your team data");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div className="p-8 text-center">Loading your team...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My Genealogy</h1>
                    <p className="text-muted-foreground">Visualize your team structure and growth.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/account/affiliate">
                        <Button variant="outline" size="sm">
                            <Share2 className="mr-2 h-4 w-4" />
                            Invite Friends
                        </Button>
                    </Link>
                    
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Direct Referrals</CardTitle>
                        <UserPlus className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.directReferrals}</div>
                        <p className="text-xs text-muted-foreground">Personal recruits</p>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Team</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalDownlines}</div>
                        <p className="text-xs text-muted-foreground">Extended network (3 levels)</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Board</CardTitle>
                        <Trophy className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold capitalize">{userInfo.currentBoard || "Bronze"}</div>
                        <p className="text-xs text-muted-foreground">Your rank</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tree Visualization */}
            <Card className="overflow-hidden bg-slate-50/50 dark:bg-black/20">
                <CardHeader>
                    <CardTitle>Team Structure</CardTitle>
                    <CardDescription>
                        Interactive view of your referral network. Click nodes to collapse/expand. Scroll to pan.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="h-[600px] flex relative">
                        <GenealogyTree data={data} rootUser={userInfo} />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
