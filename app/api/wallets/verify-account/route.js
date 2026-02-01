import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';
import { NextResponse } from 'next/server';

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { accountNumber, bankCode } = await req.json();

        if (!accountNumber || !bankCode) {
            return NextResponse.json({ success: false, error: 'Account number and bank code are required' }, { status: 400 });
        }

        const response = await fetch('https://api.flutterwave.com/v3/accounts/resolve', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account_number: accountNumber,
                account_bank: bankCode
            })
        });

        const data = await response.json();

        if (data.status === 'success') {
            return NextResponse.json({
                success: true,
                data: data.data
            });
        } else {
            return NextResponse.json({
                success: false,
                error: data.message || 'Account verification failed'
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error verifying account:', error);
        return NextResponse.json({
            success: false,
            error: 'Account verification failed'
        }, { status: 500 });
    }
}