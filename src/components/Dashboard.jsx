import React, { useState, useEffect } from 'react'
import { Users, BookOpen, TrendingUp, DollarSign, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { instructorsAPI, batchesAPI, coursesAPI, ordersAPI, enrollmentsAPI } from '../services/api'
import StateMessage from './StateMessage'

const Dashboard = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState({
    instructors: 0,
    activeBatches: 0,
    totalCourses: 0,
    totalRevenue: 0,
    totalEnrollments: 0,
  })

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [instructorsRes, batchesRes, coursesRes, ordersRes, enrollmentsRes] = await Promise.all([
        instructorsAPI.getAll().catch(() => ({ data: { data: [] } })),
        batchesAPI.getActive().catch(() => ({ data: { data: [] } })),
        coursesAPI.getAll().catch(() => ({ data: { data: [] } })),
        ordersAPI.getAll().catch(() => ({ data: { data: [] } })),
        enrollmentsAPI.getAll().catch(() => ({ data: { data: [] } })),
      ])

      const instructors = instructorsRes.data?.data || instructorsRes.data || []
      const batches = batchesRes.data?.data || batchesRes.data || []
      const courses = coursesRes.data?.data || coursesRes.data || []
      const orders = ordersRes.data?.data || ordersRes.data || []
      const enrollments = enrollmentsRes.data?.data || enrollmentsRes.data || []

      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order.totalAmount || order.amount || 0)
      }, 0)

      setStats({
        instructors: Array.isArray(instructors) ? instructors.length : 0,
        activeBatches: Array.isArray(batches) ? batches.length : 0,
        totalCourses: Array.isArray(courses) ? courses.length : 0,
        totalRevenue,
        totalEnrollments: Array.isArray(enrollments) ? enrollments.length : 0,
      })
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const statsCards = [
    {
      title: 'Total Instructors',
      value: stats.instructors.toString(),
      change: '+12%',
      trend: 'up',
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Batches',
      value: stats.activeBatches.toString(),
      change: '+8%',
      trend: 'up',
      icon: BookOpen,
      color: 'bg-green-500',
    },
    {
      title: 'Total Courses',
      value: stats.totalCourses.toString(),
      change: '+15%',
      trend: 'up',
      icon: BookOpen,
      color: 'bg-purple-500',
    },
    {
      title: 'Total Revenue',
      value: `₹${stats.totalRevenue.toLocaleString()}`,
      change: '+23%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-orange-500',
    },
  ]

  const chartData = [
    { name: 'Jan', students: 400, revenue: 2400 },
    { name: 'Feb', students: 300, revenue: 1398 },
    { name: 'Mar', students: 500, revenue: 9800 },
    { name: 'Apr', students: 278, revenue: 3908 },
    { name: 'May', students: 189, revenue: 4800 },
    { name: 'Jun', students: 239, revenue: 3800 },
  ]

  const recentActivity = [
    { id: 1, action: 'New instructor added', user: 'John Doe', time: '2 minutes ago' },
    { id: 2, action: 'Batch created', user: 'Batch #2024-01', time: '15 minutes ago' },
    { id: 3, action: 'Payment received', user: `₹${stats.totalRevenue.toLocaleString()}`, time: '1 hour ago' },
    { id: 4, action: 'Student enrolled', user: `${stats.totalEnrollments} enrollments`, time: '2 hours ago' },
  ]

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="animate-spin mx-auto text-indigo-600" size={48} />
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <StateMessage
          title="Error Loading Dashboard"
          message={error}
          variant="error"
          actionLabel="Retry"
          onAction={fetchDashboardData}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="text-green-500" size={16} />
                    ) : (
                      <ArrowDownRight className="text-red-500" size={16} />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500">vs last month</span>
                  </div>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Student Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="students" stroke="#4f46e5" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Revenue Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="revenue" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-800">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.user}</p>
              </div>
              <span className="text-sm text-gray-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
