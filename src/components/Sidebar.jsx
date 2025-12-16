import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Menu,
  X,
  LogOut,
  GraduationCap,
  MapPin,
  School,
  UserCheck,
  ShoppingCart,
  Package,
  FileText,
  Shield,
  ClipboardList,
  User,
  Calendar,
  Rocket,
} from 'lucide-react'
import { authAPI } from '../services/api'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [user, setUser] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem('pw_admin_user')
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (err) {
        console.error('Error parsing user data:', err)
      }
    }
  }, [])

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Courses',
      path: '/courses',
      icon: GraduationCap,
    },
    {
      name: 'Batches',
      path: '/batches',
      icon: BookOpen,
    },
    {
      name: 'Instructors',
      path: '/instructors',
      icon: Users,
    },
    {
      name: 'Centres',
      path: '/centres',
      icon: MapPin,
    },
    {
      name: 'Classes',
      path: '/classes',
      icon: School,
    },
    {
      name: 'Students',
      path: '/students',
      icon: UserCheck,
    },
    {
      name: 'Enrollments',
      path: '/enrollments',
      icon: ClipboardList,
    },
    {
      name: 'Orders',
      path: '/orders',
      icon: ShoppingCart,
    },
    {
      name: 'Store',
      path: '/store',
      icon: Package,
    },
    {
      name: 'Tests',
      path: '/tests',
      icon: FileText,
    },
    {
      name: 'Admins',
      path: '/admins',
      icon: Shield,
    },
    {
      name: 'Book Demo',
      path: '/bookdemo',
      icon: Calendar,
    },
    {
      name: 'Get Started',
      path: '/get-started',
      icon: Rocket,
    },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      // Clear auth data
      authAPI.logout()
      localStorage.removeItem('pw_admin_user')
      setUser(null)
      navigate('/', { replace: true })
    }
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-indigo-600 text-white shadow-lg"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-indigo-900 to-indigo-800 text-white shadow-2xl transition-all duration-300 z-40 ${
          isOpen ? 'w-64' : 'w-0 lg:w-20'
        } overflow-hidden`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-indigo-700">
            <div className={`flex items-center gap-3 ${!isOpen && 'lg:justify-center'}`}>
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <LayoutDashboard className="text-indigo-600" size={24} />
              </div>
              {isOpen && (
                <div>
                  <h1 className="text-xl font-bold">Admin Panel</h1>
                  <p className="text-xs text-indigo-300">Management System</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const Icon = item.icon
              const active = isActive(item.path)
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    active
                      ? 'bg-white text-indigo-600 shadow-lg'
                      : 'text-indigo-100 hover:bg-indigo-700 hover:text-white'
                  }`}
                  title={!isOpen ? item.name : ''}
                >
                  <Icon size={20} />
                  {isOpen && <span className="font-medium">{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* User Profile */}
          {user && (
            <div className="p-4 border-t border-indigo-700">
              <div className={`flex items-center gap-3 px-4 py-3 ${!isOpen && 'lg:justify-center'}`}>
                <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={20} className="text-white" />
                </div>
                {isOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-xs text-indigo-300 truncate">{user.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Logout */}
          <div className="p-4 border-t border-indigo-700">
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full text-indigo-100 hover:bg-red-600 hover:text-white transition-all duration-200 ${
                !isOpen && 'lg:justify-center'
              }`}
              title={!isOpen ? 'Logout' : ''}
            >
              <LogOut size={20} />
              {isOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

export default Sidebar

