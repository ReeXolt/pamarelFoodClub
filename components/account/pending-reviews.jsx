"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '../ui/textarea';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';


function ReviewForm({ product, orderId, itemId, onReviewSubmit }) {
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (rating === 0) {
            toast.error('Please select a rating');
            return;
        }

        setIsSubmitting(true);
        
        try {
            const response = await fetch('/api/reviews/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderId,
                    itemId,
                    productId: product.id,
                    rating,
                    comment
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || "Failed to submit review");
            }

            if (result.success) {
                toast.success('Review submitted successfully');
                onReviewSubmit(itemId);
            }
        } catch (error) {
            toast.error('Error submitting review', {
                description: error.message
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <h3 className="text-lg font-semibold">{product.name}</h3>
                <p className="text-sm text-muted-foreground">How would you rate this product?</p>
            </div>
            <div className="flex justify-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={cn(
                            "h-8 w-8 cursor-pointer transition-colors",
                            i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-300'
                        )}
                        onClick={() => setRating(i + 1)}
                    />
                ))}
            </div>
            
            <Textarea 
                placeholder="Share your experience with this product..." 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
            />
            
            <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
        </div>
    );
}

export function PendingReviews({ showAll = false }) {
    const { data: session } = useSession();
    const [pendingReviews, setPendingReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPendingReviews = async () => {
            try {
                const response = await fetch('/api/reviews/pending');
                const data = await response.json();
                
                if (data.success) {
                    setPendingReviews(data.pendingReviews);
                } else {
                    throw new Error(data.message);
                }
            } catch (error) {
                toast.error('Error loading reviews', {
                    description: error.message
                });
            } finally {
                setLoading(false);
            }
        };

        if (session) {
            fetchPendingReviews();
        }
    }, [session]);

    const handleReviewSubmit = (itemId) => {
        setPendingReviews(prev => prev.filter(item => item.itemId !== itemId));
    };

    const displayedReviews = showAll ? pendingReviews : pendingReviews.slice(0, 3);

    if (loading) {
        return (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardContent className="flex items-center gap-4 p-4">
                            <div className="h-16 w-16 bg-gray-200 rounded-md animate-pulse"></div>
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-9 w-full bg-gray-200 rounded animate-pulse"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (pendingReviews.length === 0 && !showAll) {
        return null;
    }

    return (
        <div>
            {!showAll && (
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Pending Reviews</h2>
                    <Button asChild variant="link" className="pr-0">
                        <Link href="/account/reviews">View all</Link>
                    </Button>
                </div>
            )}
            {displayedReviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {displayedReviews.map(({ orderId, itemId, product }) => (
                        <Dialog key={itemId}>
                            <Card>
                                <CardContent className="flex items-center gap-4 p-4">
                                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border">
                                        {product.imageUrl && (
                                            <Image 
                                                src={product.imageUrl} 
                                                alt={product.name} 
                                                fill 
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" size="sm" className="mt-2 w-full">
                                                <Star className="mr-2 h-4 w-4" />
                                                Write a Review
                                            </Button>
                                        </DialogTrigger>
                                    </div>
                                </CardContent>
                            </Card>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Write a review</DialogTitle>
                                </DialogHeader>
                                <ReviewForm 
                                    product={product}
                                    orderId={orderId}
                                    itemId={itemId}
                                    onReviewSubmit={handleReviewSubmit}
                                />
                            </DialogContent>
                        </Dialog>
                    ))}
                </div>
            ) : (
                <div className="text-center py-10 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground">You have no pending reviews.</p>
                </div>
            )}
        </div>
    );
}