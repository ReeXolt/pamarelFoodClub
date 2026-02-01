"use client";

import { notFound, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { formatPrice } from '@/lib/utils';
import { Truck, Package, PackageCheck, FileText, ArrowLeft, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { jsPDF } from 'jspdf';

const statusMap = {
    'processing': { icon: <Package className="h-5 w-5" />, text: 'Order Placed', color: 'text-gray-500', step: 0 },
    'shipped': { icon: <Truck className="h-5 w-5" />, text: 'Order Shipped', color: 'text-blue-500', step: 1 },
    'delivered': { icon: <PackageCheck className="h-5 w-5" />, text: 'Order Delivered', color: 'text-green-500', step: 2 },
    'cancelled': { icon: <XCircle className="h-5 w-5" />, text: 'Order Cancelled', color: 'text-red-500', step: -1 },
};

const fetcher = (url) => fetch(url).then((res) => res.json());

export default function OrderDetailsPage() {
    const router = useRouter();
    const params = useParams();
    const { id } = params;
    
    const { data: order, error, isLoading } = useSWR(`/api/orders/${id}`, fetcher);
    
    if (error) return <div className="text-center py-10 text-red-500">Failed to load order details</div>;
    if (isLoading) return <div className="text-center py-10">Loading order details...</div>;
    if (!order) return notFound();

    const timelineStatuses = ['processing', 'shipped', 'delivered'];
    const currentStatusIndex = statusMap[order.orderStatus]?.step;

    const generatePDFInvoice = () => {
        const doc = new jsPDF();
        
        // Add logo or header
        doc.setFontSize(20);
        doc.setTextColor(40, 40, 40);
        doc.text('Spriie', 105, 20, { align: 'center' });
        doc.setFontSize(12);
        
        // Invoice title and info
        doc.setFontSize(16);
        doc.text(`INVOICE #${order._id.toString().slice(-6).toUpperCase()}`, 14, 40);
        doc.setFontSize(10);
        doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 46);
        doc.text(`Status: ${order.orderStatus.toUpperCase()}`, 14, 52);
        
        // Customer information
        doc.setFontSize(12);
        doc.text('BILL TO:', 14, 65);
        doc.setFontSize(10);
        doc.text(order.shippingInfo.name, 14, 71);
        doc.text(order.shippingInfo.address, 14, 77);
        doc.text(`${order.shippingInfo.city}, ${order.shippingInfo.zip}`, 14, 83);
        doc.text(order.shippingInfo.email, 14, 89);
        
        // Items table header
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(59, 130, 246);
        doc.rect(14, 100, 182, 8, 'F');
        doc.text('Item', 16, 105);
        doc.text('Price', 100, 105);
        doc.text('Qty', 140, 105);
        doc.text('Total', 170, 105);
        
        // Items list - with Naira symbol
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        let y = 115;
        order.items.forEach((item, index) => {
            doc.text(item.name, 16, y);
            doc.text(`₦${formatPrice(item.price)}`, 100, y);
            doc.text(item.quantity.toString(), 140, y);
            doc.text(`₦${formatPrice(item.price * item.quantity)}`, 170, y);
            y += 7;
            if (y > 250 && index < order.items.length - 1) {
                doc.addPage();
                y = 20;
            }
        });
        
        // Summary - with Naira symbol
        doc.setFontSize(12);
        y = Math.max(y + 10, 150);
        doc.text('Subtotal:', 140, y);
        doc.text(`₦${formatPrice(order.subtotal)}`, 170, y);
        y += 7;
        doc.text('Shipping:', 140, y);
        doc.text(`₦${formatPrice(order.deliveryPrice)}`, 170, y);
        y += 7;
        if (order.walletBalanceUsed > 0) {
            doc.text('Wallet Used:', 140, y);
            doc.text(`-₦${formatPrice(order.walletBalanceUsed)}`, 170, y);
            y += 7;
        }
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text('TOTAL:', 140, y);
        doc.text(`₦${formatPrice(order.total)}`, 170, y);
        
        // Footer
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text('Thank you for your purchase!', 105, 280, { align: 'center' });
        doc.text('Questions? contact@spriie.com', 105, 285, { align: 'center' });
        
        // Save the PDF
        doc.save(`invoice-${order._id.toString().slice(-6).toUpperCase()}.pdf`);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => router.back()}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back to orders</span>
                </Button>
                <div>
                    <h1 className="text-2xl font-bold">Order Details</h1>
                    <p className="text-muted-foreground">Order ID: {order._id.toString().slice(-6).toUpperCase()}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Status</CardTitle>
                </CardHeader>
                <CardContent>
                    {order.orderStatus === 'cancelled' ? (
                        <div className="flex items-center gap-3 text-red-500">
                            {statusMap['cancelled'].icon}
                            <p className="text-lg font-semibold">{statusMap['cancelled'].text}</p>
                        </div>
                    ) : (
                        <div className="relative pt-4">
                            <div className="absolute left-4 top-6 h-[calc(100%-3rem)] w-0.5 bg-gray-200 dark:bg-gray-700" />
                            {timelineStatuses.map((status, index) => (
                                <div key={status} className="relative z-10 flex items-start gap-4 mb-8 last:mb-0">
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full shrink-0",
                                        index <= currentStatusIndex ? 'bg-primary text-primary-foreground' : 'bg-gray-200 text-gray-500 dark:bg-gray-700'
                                    )}>
                                        {statusMap[status].icon}
                                    </div>
                                    <div>
                                        <p className={cn(
                                            "font-medium",
                                            index <= currentStatusIndex ? 'text-foreground' : 'text-muted-foreground'
                                        )}>{statusMap[status].text}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {index === 0 && `Your order was placed on ${new Date(order.createdAt).toLocaleDateString()}`}
                                            {index === 1 && order.shippedDate && `Your order was shipped on ${new Date(order.shippedDate).toLocaleDateString()}`}
                                            {index === 2 && order.deliveredDate && `Your order was delivered on ${new Date(order.deliveredDate).toLocaleDateString()}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="md:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Items Ordered ({order.items.length})</CardTitle>
                        </CardHeader>
                        <CardContent className="divide-y">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex items-center gap-4 py-4">
                                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-md">
                                        <Image 
                                            src={item.imageUrl || '/placeholder-product.jpg'} 
                                            alt={item.name} 
                                            fill 
                                            className="object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-semibold">₦{formatPrice(item.price * item.quantity)}</p>
                                        <p className="text-sm text-muted-foreground">₦{formatPrice(item.price)} each</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Shipping Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <p className="font-medium">{order.shippingInfo.name}</p>
                            <p className="text-muted-foreground">{order.shippingInfo.address}</p>
                            <p className="text-muted-foreground">{order.shippingInfo.city}, {order.shippingInfo.zip}</p>
                            <p className="text-muted-foreground">{order.shippingInfo.email}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <p>Subtotal</p>
                                <p>₦{formatPrice(order.subtotal)}</p>
                            </div>
                            <div className="flex justify-between">
                                <p>Shipping</p>
                                <p>₦{formatPrice(order.deliveryPrice)}</p>
                            </div>
                            {order.walletBalanceUsed > 0 && (
                                <div className="flex justify-between">
                                    <p>Wallet Credit Used</p>
                                    <p>-₦{formatPrice(order.walletBalanceUsed)}</p>
                                </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-bold text-base">
                                <p>Total</p>
                                <p>₦{formatPrice(order.total)}</p>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button 
                                variant="outline" 
                                className="w-full"
                                onClick={generatePDFInvoice}
                            >
                                <FileText className="mr-2 h-4 w-4" />
                                Download Invoice (PDF)
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}