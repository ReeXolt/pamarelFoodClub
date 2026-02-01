import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const response = await fetch('https://api.flutterwave.com/v3/banks/NG', {
            headers: {
                'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
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
                error: data.message || 'Failed to fetch banks'
            }, { status: 400 });
        }
    } catch (error) {
        console.error('Error fetching banks:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch banks'
        }, { status: 500 });
    }
}