import { NextResponse } from 'next/server';
import Order from '@/models/order';
import { getServerSession } from 'next-auth';
import connectToDatabase from '@/lib/dbConnect';
import { authOptions } from '@/app/api/auth/options';


export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    // Aggregate order data by day
    const orderStats = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          orderStatus: { $in: ['processing', 'shipped', 'delivered'] }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          orders: { $sum: 1 },
          totalRevenue: { $sum: "$total" },
          returns: {
            $sum: {
              $cond: [{ $eq: ["$orderStatus", "cancelled"] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: "$_id",
          orders: 1,
          returns: 1,
          totalRevenue: 1,
          _id: 0
        }
      }
    ]);

    // Fill in missing days with zero values
    const filledStats = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const foundStat = orderStats.find(stat => stat.date === dateStr);
      
      filledStats.push({
        date: dateStr,
        orders: foundStat?.orders || 0,
        returns: foundStat?.returns || 0,
        totalRevenue: foundStat?.totalRevenue || 0
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    return NextResponse.json(filledStats);
  } catch (error) {
    console.error('Order Stats Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch order statistics' },
      { status: 500 }
    );
  }
}