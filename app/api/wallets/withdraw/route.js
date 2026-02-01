export const runtime = 'nodejs';

import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/options';
import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';
import BankAccount from '@/models/BankAccount';
import Transaction from '@/models/Transaction';

export async function POST(req) {
    const session = await getServerSession(authOptions);

    if (!session) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { walletType, amount, bankCode, accountNumber, accountName, saveAccount } = await req.json();

        await connectToDatabase();

        // Get user with current balance
        const user = await User.findById(session.user.id);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        // Check sufficient balance
        const currentBalance = user.earnings[`${walletType}Wallet`] || 0;
        if (amount > currentBalance) {
            return NextResponse.json({ success: false, error: 'Insufficient balance' }, { status: 400 });
        }

        // Get bank name
        const banksResponse = await fetch('https://api.flutterwave.com/v3/banks/NG', {
            headers: {
                'Authorization': `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });


        const banksData = await banksResponse.json();

        const bank = banksData.data.find(b => b.code === bankCode);
        const bankName = bank ? bank.name : 'Unknown Bank';

        // Save bank account if requested
        if (saveAccount) {
            const existingAccount = await BankAccount.findOne({
                userId: session.user.id,
                accountNumber,
                bankCode
            });

            if (!existingAccount) {
                await BankAccount.create({
                    userId: session.user.id,
                    accountNumber,
                    accountName,
                    bankCode,
                    bankName
                });
            }
        }

        // Initiate transfer with new service
        const transferResponse = await fetch('https://api.neondentalprosthetic.com/api/withdrawals', { // TODO: CHANGED THIS TO USE PAMAREL WHEN IT HAS PROPERGATE
            method: 'POST',
            headers: {
                'X-API-Key': process.env.FLUTTERWAVE_WITHDRAWAL_API_KEY,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                account_bank: bankCode,
                account_number: accountNumber,
                amount: amount,
                currency: 'NGN',
                narration: `Withdrawal from ${walletType} wallet`
            })
        });

        const transferData = await transferResponse.json();


        if (transferData.status !== 'success') {
            return NextResponse.json({
                success: false,
                error: transferData.message || 'Withdrawal failed'
            }, { status: 400 });
        }

        const reference = transferData.data.reference;

        // Check the actual transfer status from the response
        // If the transfer was successfully initiated, mark as successful
        const transferStatus = transferData.data?.status?.toLowerCase() || '';
        const isSuccessful = transferData.status === 'success' && 
                            (transferStatus === 'successful' || transferStatus === 'new' || transferStatus === 'pending');

        // Create withdrawal transaction record
        const transaction = new Transaction({
            transactionId: reference,
            flutterwaveTxRef: reference,
            userId: user._id,
            userEmail: user.email,
            userName: user.name,
            userPhone: user.phone,
            amount: amount,
            currency: 'NGN',
            planType: 'wallet_withdraw',
            planName: `${walletType.toUpperCase()} Wallet Withdrawal`,
            status: isSuccessful ? 'successful' : 'pending',
            paymentStatus: isSuccessful ? 'successful' : 'pending',
            paymentMethod: 'bank_transfer',
            paidAt: isSuccessful ? new Date() : undefined,
            meta: {
                walletType,
                bankCode,
                bankName,
                accountNumber,
                accountName,
                transferId: reference,
                responseStatus: transferData.data.status,
                completeMessage: transferData.data.complete_message
            }
        });

        await transaction.save();

        // Deduct from user's wallet
        // Note: Logic assumes successful initiation means we deduct.
        // Webhook might still be needed for final confirmation if specific status updates happen later,
        // but for now we follow the existing pattern: deduct on success.
        user.earnings[`${walletType}Wallet`] = currentBalance - amount;
        await user.save();

        return NextResponse.json({
            success: true,
            message: transferData.message,
            data: transferData.data
        });

    } catch (error) {
        console.error('Withdrawal error:', error);
        return NextResponse.json({
            success: false,
            error: 'Withdrawal failed. Please try again.'
        }, { status: 500 });
    }
}
