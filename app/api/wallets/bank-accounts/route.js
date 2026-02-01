import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import BankAccount from '@/models/BankAccount';

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectToDatabase();
        
        const accounts = await BankAccount.find({ userId: session.user.id }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            accounts
        });
    } catch (error) {
        console.error('Error fetching bank accounts:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch bank accounts'
        }, { status: 500 });
    }
}