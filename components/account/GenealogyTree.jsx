"use client";

import React, { useState } from 'react';
import { User, ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Recursive Node Component
const TreeNode = ({ node, level = 0, isLast = false, isFirst = false, parentCount = 0 }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = node.downlines && node.downlines.length > 0;
    
    // For the root node (level 0), we treat it differently (no lines above)
    // If this node is inside a list of children but is the only child, we handle lines differently

    const getStatusColor = (status) => {
        if (!status) return 'bg-card text-foreground border-border'; // User fallback
        switch(status) {
            case 'active': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50';
            case 'suspended': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50';
            default: return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-900/50';
        }
    };

    const getBoardBadge = (board) => {
        switch(board?.toLowerCase()) {
            case 'platinum': return '💎';
            case 'gold': return '🥇';
            case 'silver': return '🥈';
            case 'bronze': return '🥉';
            default: return '👤';
        }
    };

    return (
        <div className="flex flex-col items-center relative">
            {/* Vertical Line Above Node (Connecting to Parent) */}
            {level > 0 && (
                <div className="h-8 w-px bg-foreground/30"></div>
            )}
            
            {/* Horizontal Connector Lines for Siblings */}
            {level > 0 && parentCount > 1 && (
                <div className="absolute top-0 w-full h-px bg-transparent">
                     {/* Left Line: Show only if NOT first child */}
                     {!isFirst && (
                        <div className="absolute top-[-1px] left-0 w-[50%] h-[2px] bg-foreground/30 -translate-y-full"></div>
                     )}
                     {/* Right Line: Show only if NOT last child */}
                     {!isLast && (
                        <div className="absolute top-[-1px] right-0 w-[50%] h-[2px] bg-foreground/30 -translate-y-full"></div>
                     )}
                </div>
            )}


            {/* Node Card */}
            <div 
                className={cn(
                    "relative z-10 flex flex-col items-center p-3 rounded-xl border shadow-sm transition-all hover:shadow-md cursor-pointer w-[140px] bg-card",
                    getStatusColor(node.status),
                    !isExpanded && hasChildren && "ring-2 ring-primary/20",
                    level === 0 && "w-[180px] border-primary/50 shadow-md ring-4 ring-primary/5" // Root node styling
                )}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex flex-col items-center gap-1 mb-1">
                    <div className="bg-background rounded-full p-2 border shadow-sm text-2xl">
                        {getBoardBadge(node.currentBoard)}
                    </div>
                    <span className="font-bold text-sm truncate w-full text-center" title={node.username}>
                        {node.username}
                    </span>
                </div>
                
                <div className="text-[10px] uppercase font-semibold opacity-70 mb-1">
                    {node.currentPlan || "Basic"}
                </div>
                
                {hasChildren && (
                    <div className={cn(
                        "transition-transform duration-200 mt-1",
                        isExpanded ? "rotate-180" : ""
                    )}>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                    </div>
                )}
            </div>

            {/* Children Container */}
            {hasChildren && isExpanded && (
                <div className="flex flex-col items-center">
                    {/* Vertical Line below Parent */}
                    <div className="h-8 w-px bg-foreground/30"></div>
                    
                    {/* Children Wrapper */}
                    <div className="flex gap-4 pt-0 px-4 relative">
                        {/* Horizontal Bus Line spanning all children -- handled by individual nodes top lines now for better precision */}
                        
                        {node.downlines.map((child, idx) => (
                            <TreeNode 
                                key={child._id || idx} 
                                node={child} 
                                level={level + 1} 
                                isFirst={idx === 0}
                                isLast={idx === node.downlines.length - 1}
                                parentCount={node.downlines.length}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default function GenealogyTree({ rootUser, data }) {
    // If we have a root user, we restructure the data to treat it as one tree
    const treeData = rootUser ? {
        ...rootUser,
        status: 'active', // Root is always assumed active or we check
        downlines: data || []
    } : null;

    if (!treeData && (!data || data.length === 0)) {
        return (
            <div className="text-center p-10 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No referrals found yet.</p>
                <p className="text-sm">Share your code to start building your team!</p>
            </div>
        );
    }

    // Wrap in a container that allows panning but starts centered-ish
    return (
        <div className="w-full h-full overflow-auto cursor-grab active:cursor-grabbing p-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="min-w-fit flex justify-center mx-auto">
                 {treeData ? (
                     <TreeNode node={treeData} level={0} />
                 ) : (
                     // Fallback if no root user provided (rendering direct children)
                     // Pseudo-root to hold them together? Or just map layout
                     <div className="flex gap-8">
                        {data.map((node, idx) => (
                             <TreeNode 
                                key={node._id || idx} 
                                node={node} 
                                level={1} // Treat as level 1
                                isFirst={idx === 0}
                                isLast={idx === data.length - 1}
                                parentCount={data.length}
                            />
                        ))}
                     </div>
                 )}
            </div>
        </div>
    );
}
