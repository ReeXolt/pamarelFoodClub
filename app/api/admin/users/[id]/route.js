import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/options';
import User from '@/models/user';
import Transaction from '@/models/Transaction';
import connectToDatabase from '@/lib/dbConnect';

// GET user by ID
export async function GET(request, { params }) {
  try {

    const {id} = await params;

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = await User.findById(id)
      .populate('referredBy', 'username referralCode')
      .select('-password');
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    
    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// UPDATE user by ID
export async function PUT(request, { params }) {
  try {
    const {id} = await params;

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const { plan, currentBoard, status, role } = await request.json();
    
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if status is being changed to 'active'
    const wasPending = user.status === 'pending';
    const isBeingActivated = status === 'active' && wasPending;
    
    // Update fields if they are provided
    if (plan) user.plan = plan;
    if (currentBoard) user.currentBoard = currentBoard;
    if (status) user.status = status;
    if (role) user.role = role;
    
    await user.save();
    
    // If user status is being changed to active, update all pending transactions to successful
    if (isBeingActivated) {
      try {
        const updatedTransactions = await Transaction.updateMany(
          { 
            userId: user._id,
            status: 'pending'
          },
          {
            $set: {
              status: 'successful',
              paymentStatus: 'successful',
              paidAt: new Date(),
              updatedAt: new Date()
            }
          }
        );
        
        console.log(`Updated ${updatedTransactions.modifiedCount} pending transactions to successful for user ${user._id}`);
      } catch (transactionError) {
        console.error('Error updating transactions:', transactionError);
        // Don't fail the user update if transaction update fails, but log it
      }
    }
    
    return NextResponse.json({ 
      message: 'User updated successfully', 
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        plan: user.plan,
        currentBoard: user.currentBoard,
        status: user.status,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE user by ID
export async function DELETE(request, { params }) {
  try {
    const {id} = await params;

    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    // Check if user has referrals and handle accordingly
    // You might want to add additional logic here to handle referrals
    // when a user is deleted
    
    await User.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}