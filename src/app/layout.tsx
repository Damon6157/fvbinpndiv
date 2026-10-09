import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-gray-100 font-sans antialiased">
        <div className="flex h-screen">
          <aside className="w-64 border-r border-gray-800 bg-gray-950 p-4">
            <h1 className="text-2xl font-bold mb-8 text-indigo-400">SelfBot Pro</h1>
            <nav className="space-y-2">
              <NavItem href="/dashboard" icon="LayoutDashboard" label="Dashboard" />
              <NavItem href="/dashboard/tokens" icon="Key" label="Tokens" />
              <NavItem href="/dashboard/campaigns" icon="Send" label="Campaigns" />
              <NavItem href="/dashboard/leads" icon="Users" label="Leads" />
            </nav>
          </aside>
          <main className="flex-1 overflow-y-auto p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: string; label: string }) {
  // In a real app, use lucide-react components
  return (
    <a href={href} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors">
      <span>{label}</span>
    </a>
  );
}