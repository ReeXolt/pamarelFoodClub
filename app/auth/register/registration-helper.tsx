'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { planConfig } from '@/lib/plans';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { ArrowLeft } from 'lucide-react';
import { Footer } from '@/components/layout/footer';
import { registrationSchema, type RegistrationFormValues } from './registration-schema';
import {
	ApiErrorAlert,
	PlanSummaryCard,
	PlanSelector,
	RegistrationForm,
} from './components';

export default function RegistrationPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const planId = searchParams.get('planType') || 'basic';
	const plan = planConfig[planId] || planConfig.basic;
	const [apiError, setApiError] = useState('');

	const form = useForm<RegistrationFormValues>({
		resolver: zodResolver(registrationSchema),
		defaultValues: {
			username: '',
			email: '',
			phone: '',
			password: '',
			confirmPassword: '',
			referralCode: '',
		},
	});

	async function onSubmit(values: RegistrationFormValues) {
		setApiError('');

		try {
			// First create the user with pending status
			const userResponse = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					username: values.username,
					email: values.email,
					phone: values.phone,
					password: values.password,
					referralCode: values.referralCode || null,
					planType: planId,
					status: 'pending'
				})
			});

			const userData = await userResponse.json();

			if (!userResponse.ok) {
				// Handle field-specific errors from API
				if (userData.fieldErrors) {
					Object.entries(userData.fieldErrors).forEach(([field, message]) => {
						form.setError(field as keyof RegistrationFormValues, {
							message: message as string,
						});
					});
				}
				// Handle general API error
				throw new Error(userData.error || 'User registration failed');
			}

			// Then initialize Flutterwave payment
			const paymentResponse = await fetch('/api/payment/initialize', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: values.email,
					amount: plan.priceNum,
					planType: planId,
					userId: userData.userId,
					planName: plan.name,
					phone: values.phone,
					name: values.username
				})
			});

			const paymentData = await paymentResponse.json();

			if (!paymentResponse.ok) {
				throw new Error(paymentData.error || 'Payment initialization failed');
			}

			// Redirect to Flutterwave checkout page
			window.location.href = paymentData.checkoutLink;

		} catch (error) {
			// console.error('Registration/Payment error:', error);
			setApiError(error instanceof Error ? error.message : 'An error occurred');
		}
	}

	return (
		<div className="min-h-screen bg-background flex flex-col">
			<main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-6 lg:py-8">
				{/* Back link */}
				<motion.button
					initial={{ opacity: 0, x: -10 }}
					animate={{ opacity: 1, x: 0 }}
					onClick={() => router.push('/join-member')}
					className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
				>
					<ArrowLeft className="h-4 w-4" />
					Back to Plans
				</motion.button>

				<div className="grid lg:grid-cols-[1fr_1.4fr] gap-6 items-start">
					{/* ── Left: Plan Summary Card ── */}
					<div>
						<PlanSummaryCard plan={plan} planId={planId} />
						<PlanSelector planConfig={planConfig} planId={planId} />
					</div>

					{/* ── Center: Error Alert ── */}
					<ApiErrorAlert error={apiError} />

					{/* ── Right: Registration Form ── */}
					<RegistrationForm
						form={form}
						onSubmit={onSubmit}
						plan={plan}
						planId={planId}
					/>
				</div>
			</main>

			<Footer />
		</div>
	);
};
