import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { Separator } from '../ui/separator';

const statusColorMap = {
    'processing': 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-700',
    'shipped': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-700',
    'delivered': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/50 dark:text-green-300 dark:border-green-700',
    'cancelled': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/50 dark:text-red-300 dark:border-red-700',
};

export function OrderCard({ order }) {
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Capitalize the first letter of status for display
    const displayStatus = order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1);

    return (
        <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-4 bg-muted/50">
                <div className="grid gap-1 text-sm">
                    <p className="font-semibold">Order ID: {order._id.toString().slice(-6).toUpperCase()}</p>
                    <p className="text-muted-foreground">Date: {orderDate}</p>
                </div>
                <Badge variant="outline" className={cn("text-xs font-semibold", statusColorMap[order.orderStatus])}>
                    {displayStatus}
                </Badge>
            </CardHeader>
            <CardContent className="p-4">
                <div className="flex items-center gap-4">
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border">
                        <Image 
                            src={order.items[0]?.imageUrl || '/placeholder-product.jpg'} 
                            alt={order.items[0]?.name || 'Product image'} 
                            fill 
                            className="object-cover" 
                            data-ai-hint="product image" 
                        />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold truncate">{order.items[0]?.name || 'Product'}</h3>
                        {order.items.length > 1 && (
                            <p className="text-sm text-muted-foreground">+ {order.items.length - 1} more item(s)</p>
                        )}
                    </div>
                </div>
            </CardContent>
            <Separator />
            <CardFooter className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 p-4">
                <div className="text-sm">
                    <span className="text-muted-foreground">Total: </span>
                    <span className="font-bold text-base">₦{formatPrice(order.total)}</span>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href={`/account/orders/${order._id}`}>View Order Details</Link>
                </Button>
            </CardFooter>
        </Card>
    );
}