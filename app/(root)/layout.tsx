import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/sonner';
import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

export default function HomeLayout({ children }: { children: ReactNode }) {
	return (
		<>
			<div className="relative flex min-h-screen flex-col">
				<Navbar />
				<main className="flex-1">{children}</main>
				<Footer />
			</div>
			<Toaster />
		</>
	);
}
