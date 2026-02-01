"use client"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Home, 
  User, 
  BarChart2, 
  DollarSign, 
  Users, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Shield // Added Shield icon for admin
} from 'lucide-react'
import { useSession } from 'next-auth/react'

export default function Sidebar({ sidebarOpen, setSidebarOpen, isAdmin }) {
  const router = useRouter()
  const { data: session } = useSession()

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const navigateToUserDashboard = () => {
    router.push('/account')
  }

  const navigateToHome = () => {
    router.push('/')
  }

  const navigateToAdmin = () => {
    router.push('/admin')
  }


  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-md transition-all duration-300 flex flex-col h-full`}>
      <div className="p-4 flex items-center justify-between border-b">
        {sidebarOpen ? (
          <h1 className="text-xl font-bold text-gray-800">Affiliate Dashboard</h1>
        ) : (
          <div className="w-8 h-8 bg-yellow-500 rounded-full"></div>
        )}
        <button 
          onClick={toggleSidebar}
          className="p-1 rounded-lg hover:bg-gray-100"
        >
          {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>
      </div>

      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          <li>
            <Link href="/affiliate" className="flex items-center p-3 rounded-lg hover:bg-gray-100 w-full">
              <BarChart2 size={20} />
              {sidebarOpen && <span className="ml-3">Dashboard</span>}
            </Link>
          </li>
          <li>
            <Link href="/affiliate/earnings" className="flex items-center p-3 rounded-lg hover:bg-gray-100 w-full">
              <DollarSign size={20} />
              {sidebarOpen && <span className="ml-3">Earnings</span>}
            </Link>
          </li>
          <li>
            <Link href="/affiliate/referrals" className="flex items-center p-3 rounded-lg hover:bg-gray-100 w-full">
              <Users size={20} />
              {sidebarOpen && <span className="ml-3">Referrals</span>}
            </Link>
          </li>
          <li>
            <Link href="/affiliate/settings" className="flex items-center p-3 rounded-lg hover:bg-gray-100 w-full">
              <Settings size={20} />
              {sidebarOpen && <span className="ml-3">Settings</span>}
            </Link>
          </li>
          
          {/* Admin Link - Only shown if user is admin */}
          {isAdmin && (
            <li>
              <button 
                onClick={navigateToAdmin}
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 w-full text-left"
              >
                <Shield size={20} />
                {sidebarOpen && <span className="ml-3">Admin Panel</span>}
              </button>
            </li>
          )}
        </ul>
      </nav>

      <div className="p-4 border-t">
        <button 
          onClick={navigateToUserDashboard}
          className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100"
        >
          <User size={20} />
          {sidebarOpen && <span className="ml-3">User Dashboard</span>}
        </button>
        <button 
          onClick={navigateToHome}
          className="w-full flex items-center p-3 rounded-lg hover:bg-gray-100 mt-2"
        >
          <Home size={20} />
          {sidebarOpen && <span className="ml-3">Go Home</span>}
        </button>
      </div>
    </div>
  )
}