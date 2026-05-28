import Link from 'next/link';

export function Footer() {
	const socialLinks = [
		{
			icon: '',
			href: 'https://www.facebook.com/profile.php?id=61573028302471&mibextid=ZbWKwL',
			label: 'Facebook',
		},
		{
			icon: '',
			href: 'https://www.instagram.com/pamarelfoodmarket?utm_source=qr&igsh=NWtkOWMxYzFra2Zh',
			label: 'Instagram',
		},
	];

	const paymentMethods = ['Flutterwave', 'Wallet Transfer'];

	return (
		<footer className="bg-foreground text-background/80 mt-auto">
			<div className="mx-auto grid gap-y-4 max-w-7xl px-4 py-12 lg:px-8">
				<div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{/* Brand */}
					<div>
						<Link href="/" className="flex items-center gap-1 mb-3">
							<span className="text-xl font-black text-background font-display">
								<span className="text-primary">P</span>
								<span className="text-accent">a</span>
								<span>marel</span>
							</span>
							<span className="text-[9px] font-semibold uppercase tracking-wider text-primary">
								Foods
							</span>
						</Link>
						<p className="text-sm text-background/50 leading-relaxed">
							Your one-stop shop for everything, delivering quality and
							convenience.
						</p>
					</div>

					{/* Help */}
					<div>
						<h4 className="font-display text-xs font-bold uppercase tracking-wider text-background/60 mb-4">
							Let Us Help You
						</h4>
						<ul className="space-y-2.5">
							<li>
								<Link
									href="/contact"
									className="text-sm text-background/50 hover:text-background transition-colors"
								>
									Contact Us
								</Link>
							</li>
							<li>
								<a
									href="#"
									className="text-sm text-background/50 hover:text-background transition-colors"
								>
									Terms and Conditions
								</a>
							</li>
						</ul>
					</div>

					{/* Earn */}
					<div>
						<h4 className="font-display text-xs font-bold uppercase tracking-wider text-background/60 mb-4">
							Make Money With Pamarel
						</h4>
						<ul className="space-y-2.5">
							<li>
								<Link
									href="/benefits"
									className="text-sm text-background/50 hover:text-background transition-colors"
								>
									Become a community member
								</Link>
							</li>
							<li>
								<Link
									href="/#stockist"
									className="text-sm text-background/50 hover:text-background transition-colors"
								>
									Become a stockist
								</Link>
							</li>
						</ul>
					</div>

					{/* New to Pamarel */}
					<div>
						<h4 className="font-display text-xs font-bold uppercase tracking-wider text-background/60 mb-4">
							New to Pamarel?
						</h4>
						<ul className="space-y-2.5">
							<li>
								<Link
									href="/benefits"
									className="text-sm text-background/50 hover:text-background transition-colors"
								>
									Create account
								</Link>
							</li>
							{/* Social Links */}
							<div className="space-y-4">
								<div className="flex space-x-4">
									{socialLinks.map((social) => (
										<Link
											key={social.label}
											href={social.href}
											aria-label={social.label}
											target="_blank"
											rel="noopener noreferrer"
											className="transition-colors duration-200"
										>
											{/* <social.icon className="h-5 w-5 hover:text-primary" /> */}
											<span className='text-xs italic'>{social.label}</span>
										</Link>
									))}
								</div>
							</div>
						</ul>
					</div>
				</div>
				{/* Bottom Bar */}
				<div className="border-t border-gray-700 pt-8">
					<div className="flex flex-col lg:flex-row justify-between items-center gap-6">
						{/* Copyright */}
						<p className="text-sm text-gray-400 order-2 lg:order-1">
							&copy; {new Date().getFullYear()} pamarel. All rights reserved.
						</p>

						{/* Payment Methods */}
						<div className="flex flex-col sm:flex-row items-center gap-4 order-1 lg:order-2">
							<span className="font-semibold text-sm text-white">
								Payment Methods:
							</span>
							<div className="flex flex-wrap gap-3 justify-center">
								{paymentMethods.map((method) => (
									<span
										key={method}
										className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-md"
									>
										{method}
									</span>
								))}
							</div>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
