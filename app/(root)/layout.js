import { Footer } from '@/components/layout/footer';
import { Navbar } from '@/components/layout/Navbar';
import { Toaster } from '@/components/ui/sonner';


export const dynamic = 'force-dynamic';


export default function HomeLayout({ children }) {
    return (
        <>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <Toaster />
        </>
    )
}