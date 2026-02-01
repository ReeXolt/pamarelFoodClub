import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/dbConnect';
import User from '@/models/user';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectToDatabase();
    
    const { username, email, phone, password, referralCode, planType } = await request.json();

    // Check if user already exists
    const existingUser = await User.findOne({ username });


    if (existingUser) {
      if (existingUser.status === "pending") {
        existingUser.currentPlan = planType; // Use currentPlan instead of plan

        const hashedPassword = await bcrypt.hash(password, 12);

        existingUser.password = hashedPassword;

        await existingUser.save();
        
        return NextResponse.json({
          success: true,
          userId: existingUser._id,
          message: 'User registered successfully. Awaiting payment.'
        });
      }
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate referral code
    const userReferralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // Check if referredBy user exists if referral code is provided
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        referredBy = referrer._id;
      }
    }

    // Use the NEW array structure for boardProgress
    const user = new User({
      username: username.trim(),
      email,
      phone,
      password: hashedPassword,
      referralCode: userReferralCode,
      referredBy,
      currentPlan: planType, // Use currentPlan instead of plan
      status: 'pending',
      currentBoard: "bronze", // lowercase
      createdAt: new Date(),
      wallets: { // Use wallets instead of earnings
        food: 0,
        gadget: 0,
        cash: 0
      },
      boardProgress: [ // NEW array structure
        {
          boardType: 'bronze',
          directReferrals: [],
          indirectReferrals: [],
          completed: false,
          rewardsClaimed: false
        },
        {
          boardType: 'silver', 
          directReferrals: [],
          indirectReferrals: [],
          completed: false,
          rewardsClaimed: false
        },
        {
          boardType: 'gold',
          directReferrals: [],
          indirectReferrals: [],
          completed: false,
          rewardsClaimed: false
        }
      ],
    });

    await user.save();

    await user.save();

    // Referrer update logic moved to payment verification to ensure payment before activation

    return NextResponse.json({
      success: true,
      userId: user._id,
      message: 'User registered successfully. Awaiting payment.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}