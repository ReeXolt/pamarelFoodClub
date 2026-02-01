import { AccountNav } from "@/components/account/account-nav";

export default function AccountLayout({
  children,
}) {
  return (
    <div className="container mx-auto px-4 py-8 md:px-6 md:py-12">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <AccountNav />
        </aside>
        <main className="lg:col-span-3">
          {children}
        </main>
      </div>
    </div>
  );
}
