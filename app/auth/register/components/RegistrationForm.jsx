'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';

export function RegistrationForm({ form, onSubmit, plan, planId }) {
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.35, delay: 0.1 }}
			className="rounded-2xl border border-border bg-card p-6"
		>
			<h3 className="text-lg font-bold text-foreground mb-1">
				Create Your Account
			</h3>
			<p className="text-sm text-muted-foreground mb-5">
				Fill in your details to get started
			</p>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					{/* Row 1: Username + Email */}
					<div className="grid sm:grid-cols-2 gap-3">
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-semibold text-foreground">
										Username
									</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="johndoe"
											className="h-10 text-sm rounded-lg"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-semibold text-foreground">
										Email Address
									</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="john@email.com"
											className="h-10 text-sm rounded-lg"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Row 2: Phone + Password */}
					<div className="grid sm:grid-cols-2 gap-3">
						<FormField
							control={form.control}
							name="phone"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-semibold text-foreground">
										Phone Number
									</FormLabel>
									<FormControl>
										<Input
											type="tel"
											placeholder="+234 800 000 0000"
											className="h-10 text-sm rounded-lg"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-semibold text-foreground">
										Password
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showPassword ? 'text' : 'password'}
												placeholder="Create password"
												className="h-10 text-sm rounded-lg pr-10"
												{...field}
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Row 3: Confirm Password + Referral */}
					<div className="grid sm:grid-cols-2 gap-3">
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-semibold text-foreground">
										Confirm Password
									</FormLabel>
									<FormControl>
										<div className="relative">
											<Input
												type={showConfirmPassword ? 'text' : 'password'}
												placeholder="Confirm password"
												className="h-10 text-sm rounded-lg pr-10"
												{...field}
											/>
											<button
												type="button"
												onClick={() =>
													setShowConfirmPassword(!showConfirmPassword)
												}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
											>
												{showConfirmPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="referralCode"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-xs font-semibold text-foreground">
										Referral Code{' '}
										<span className="text-muted-foreground font-normal">
											(optional)
										</span>
									</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="Enter referral code"
											className="h-10 text-sm rounded-lg"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>

					{/* Selected Plan badge */}
					<div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 px-4 py-3">
						<div>
							<span className="text-xs text-muted-foreground">
								Selected Plan:{' '}
							</span>
							<span className={cn('text-sm font-bold', plan.accent)}>
								{plan.name}
							</span>
							<p className="text-xs text-yellow-600">
								You&apos;ll be redirected to Flutterwave payment after
								registration
							</p>
						</div>
						<span className={cn('text-lg font-black', plan.accent)}>
							{plan.price}
						</span>
					</div>

					{/* Submit */}
					<motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
						<Button
							variant={'default'}
							type="submit"
							disabled={form.formState.isSubmitting}
							className={cn(
								'w-full h-11 rounded-xl font-bold text-sm text-primary-foreground bg-linear-to-r',
								plan.gradient,
								planId === 'deluxe' && 'text-card',
								form.formState.isSubmitting && 'opacity-50 cursor-not-allowed',
							)}
						>
							{form.formState.isSubmitting
								? 'Processing...'
								: `Register & Pay ${plan.price}`}
						</Button>
					</motion.div>

					<p className="text-xs text-center text-muted-foreground">
						Already have an account?{' '}
						<Link
							href="/auth/login"
							className="text-primary font-medium hover:underline"
						>
							Sign in
						</Link>
					</p>
				</form>
			</Form>
		</motion.div>
	);
}
