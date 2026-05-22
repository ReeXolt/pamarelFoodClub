'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import emailjs from '@emailjs/browser';
import {
	MapPin,
	Phone,
	Mail,
	Clock,
	Send,
	AlertCircle,
	CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { contactFormSchema } from './contact-schema';

// Initialize EmailJS (make sure to do this once when component mounts)
const initializeEmailJS = () => {
	try {
		emailjs.init(process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY);
	} catch (err) {
		console.error('EmailJS initialization error:', err);
	}
};

const Contact = () => {
	const [apiError, setApiError] = useState('');
	const [successMessage, setSuccessMessage] = useState('');

	const form = useForm({
		resolver: zodResolver(contactFormSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			subject: '',
			message: '',
		},
	});

	const contactInfo = [
		{
			icon: MapPin,
			title: 'Address',
			detail: '4 Uroye Street, Ubeji, Warri, Delta state',
		},
		{ icon: Phone, title: 'Phone', detail: '09040498445' },
		{ icon: Mail, title: 'Email', detail: 'pamarelfoods@gmail.com' },
		{
			icon: Clock,
			title: 'Business Hours',
			detail: 'Monday - Saturday: 9am - 6pm',
		},
	];

	async function onSubmit(values) {
		setApiError('');
		setSuccessMessage('');

		try {
			// Initialize EmailJS on first submit
			initializeEmailJS();

			// Send email using EmailJS
			const response = await emailjs.send(
				process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID,
				process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID,
				{
					to_email: 'pamarelfoods@gmail.com',
					from_name: `${values.firstName} ${values.lastName}`,
					from_email: values.email,
					subject: values.subject,
					message: values.message,
					reply_to: values.email,
				},
			);

			if (response.status === 200) {
				setSuccessMessage(
					'✅ Message sent successfully! We will get back to you soon.',
				);
				form.reset();

				// Clear success message after 5 seconds
				setTimeout(() => setSuccessMessage(''), 5000);
			}
		} catch (error) {
			console.error('Error sending email:', error);
			setApiError(
				error.text || 'Failed to send message. Please try again later.',
			);
		}
	}

	return (
		<div className="bg-background flex flex-col">
			<main className="flex-1 max-w-7xl mx-auto px-4 lg:px-8 w-full py-6 lg:py-8">
				{/* Two-column layout: info left, form right */}
				<div className="grid lg:grid-cols-[2fr_3fr] gap-6 lg:gap-10 items-start">
					{/* Left: Contact Info */}
					<motion.div
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4 }}
						className="space-y-6"
					>
						<div>
							<h1 className="text-2xl lg:text-3xl font-bold text-foreground">
								Get In <span className="text-primary">Touch</span>
							</h1>
							<p className="text-sm text-muted-foreground mt-2 leading-relaxed">
								Have questions about our products or services? Reach out to our
								team and we&apos;ll get back to you as soon as possible.
							</p>
						</div>

						<div className="space-y-4">
							{contactInfo.map((item, i) => (
								<motion.div
									key={item.title}
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: i * 0.1, duration: 0.3 }}
									className="flex items-start gap-3"
								>
									<div className="rounded-full bg-accent/10 p-2.5 shrink-0">
										<item.icon className="h-4 w-4 text-accent" />
									</div>
									<div>
										<p className="text-sm font-semibold text-foreground">
											{item.title}
										</p>
										<p className="text-sm text-muted-foreground">
											{item.detail}
										</p>
									</div>
								</motion.div>
							))}
						</div>

						<div>
							<p className="text-sm font-semibold text-foreground mb-2">
								Follow Us
							</p>
							<div className="flex gap-3">
								{[
									{ text: 'Facebook', link: '#' },
									{ text: 'Instagram', link: '#' },
									{ text: 'Twitter', link: '#' },
								].map((s) => (
									<a
										key={s.text}
										href={s.link}
										target="_blank"
										rel="noopener noreferrer"
										className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground hover:bg-primary hover:text-primary-foreground cursor-pointer transition-colors"
									>
										{s.text}
									</a>
								))}
							</div>
						</div>
					</motion.div>

					{/* Right: Form */}
					<motion.div
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.1 }}
						className="rounded-2xl border border-border bg-card p-5 lg:p-6 shadow-sm"
					>
						<h2 className="text-lg font-bold text-foreground mb-4">
							Send Us a Message
						</h2>

						{/* Success Message */}
						{successMessage && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 flex gap-3"
							>
								<CheckCircle className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
								<div>
									<p className="text-sm font-semibold text-green-800">
										{successMessage}
									</p>
								</div>
							</motion.div>
						)}

						{/* Error Message */}
						{apiError && (
							<motion.div
								initial={{ opacity: 0, y: -10 }}
								animate={{ opacity: 1, y: 0 }}
								className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 flex gap-3"
							>
								<AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
								<div>
									<p className="text-sm font-semibold text-red-800">Error</p>
									<p className="text-sm text-red-700">{apiError}</p>
								</div>
							</motion.div>
						)}

						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className="space-y-3"
							>
								<div className="grid sm:grid-cols-2 gap-3">
									<FormField
										control={form.control}
										name="firstName"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs font-medium text-foreground">
													First Name
												</FormLabel>
												<FormControl>
													<Input
														type="text"
														placeholder="Your first name"
														className="h-9 text-sm"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="lastName"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs font-medium text-foreground">
													Last Name
												</FormLabel>
												<FormControl>
													<Input
														type="text"
														placeholder="Your last name"
														className="h-9 text-sm"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<div className="grid sm:grid-cols-2 gap-3">
									<FormField
										control={form.control}
										name="email"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs font-medium text-foreground">
													Email Address
												</FormLabel>
												<FormControl>
													<Input
														type="email"
														placeholder="your.email@example.com"
														className="h-9 text-sm"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="subject"
										render={({ field }) => (
											<FormItem>
												<FormLabel className="text-xs font-medium text-foreground">
													Subject
												</FormLabel>
												<FormControl>
													<Input
														type="text"
														placeholder="What is this regarding?"
														className="h-9 text-sm"
														{...field}
													/>
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>

								<FormField
									control={form.control}
									name="message"
									render={({ field }) => (
										<FormItem>
											<FormLabel className="text-xs font-medium text-foreground">
												Message
											</FormLabel>
											<FormControl>
												<Textarea
													placeholder="Type your message here..."
													className="min-h-30 text-sm resize-none"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									variant="default"
									type="submit"
									disabled={form.formState.isSubmitting}
									className={cn(
										'w-full gap-2 h-10',
										form.formState.isSubmitting &&
											'opacity-50 cursor-not-allowed',
									)}
								>
									<Send className="h-4 w-4" />
									{form.formState.isSubmitting ? 'Sending...' : 'Send Message'}
								</Button>
							</form>
						</Form>
					</motion.div>
				</div>
			</main>
		</div>
	);
};

export default Contact;
