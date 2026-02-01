import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/options';
import connectToDatabase from '@/lib/dbConnect';
import Order from '@/models/order';
import User from '@/models/user';
import { formatPrice } from '@/lib/utils';
import Link from 'next/link';


export default async function OrderConfirmation({ params }) {
  await connectToDatabase();
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return notFound();
  }

  const order = await Order.findById((await params).id)
    .populate('user', 'name email')
    .lean();

  if (!order || order.user._id.toString() !== session.user.id) {
    return notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Order Confirmation</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Order #{order._id.toString().slice(-6).toUpperCase()}</h2>
          <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
            <div className="space-y-2">
              <p><span className="font-medium">Name:</span> {order.shippingInfo.name}</p>
              <p><span className="font-medium">Email:</span> {order.shippingInfo.email}</p>
              <p><span className="font-medium">Address:</span> {order.shippingInfo.address}</p>
              <p><span className="font-medium">City:</span> {order.shippingInfo.city}</p>
              <p><span className="font-medium">ZIP Code:</span> {order.shippingInfo.zip}</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item._id} className="flex justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-medium">₦{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between">
                  <p>Subtotal:</p>
                  <p>₦{formatPrice(order.subtotal)}</p>
                </div>
                <div className="flex justify-between">
                  <p>Shipping:</p>
                  <p>{order.deliveryPrice > 0 ? `₦${formatPrice(order.deliveryPrice)}` : 'Free'}</p>
                </div>
                <div className="flex justify-between font-bold text-lg">
                  <p>Total:</p>
                  <p>₦{formatPrice(order.total)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border-l-4 border-green-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">
                Your order has been placed successfully!
              </p>
            </div>
          </div>
        </div>
        <Link href="/category" className="mt-6 inline-block bg-primary text-white px-6 py-3 rounded-md hover:bg-primary/90">
          Continue Shopping
        </Link>
      </div>

    </div>
  );
}