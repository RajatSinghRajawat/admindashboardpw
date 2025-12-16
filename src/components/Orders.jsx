import React, { useState, useEffect } from 'react'
import { Search, Filter, Calendar, DollarSign, Package, Eye, Loader2, User, Mail, Phone, MapPin, CreditCard } from 'lucide-react'
import { ordersAPI } from '../services/api'
import StateMessage from './StateMessage'
import Modal from './Modal'

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [orders, setOrders] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [loadingOrderDetails, setLoadingOrderDetails] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await ordersAPI.getAll()
      const ordersData = response.data?.data || response.data || []
      setOrders(Array.isArray(ordersData) ? ordersData : [])
    } catch (err) {
      setError(err.message || 'Failed to load orders')
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleViewOrder = async (order) => {
    try {
      setLoadingOrderDetails(true)
      setError(null)
      const response = await ordersAPI.getById(order._id || order.id)
      setSelectedOrder(response.data?.data || response.data || order)
      setIsModalOpen(true)
    } catch (err) {
      setError(err.message || 'Failed to load order details')
      // Still show modal with existing order data
      setSelectedOrder(order)
      setIsModalOpen(true)
    } finally {
      setLoadingOrderDetails(false)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedOrder(null)
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen animate-slide-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
        <p className="text-gray-600 mt-1">View and manage all orders</p>
      </div>

      {error && (
        <StateMessage
          title="Error"
          message={error}
          variant="error"
          onAction={() => setError(null)}
        />
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-indigo-600" size={48} />
        </div>
      ) : (
        <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Total Orders</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{orders.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            ₹{orders.filter((o) => o.paymentStatus === 'paid').reduce((sum, o) => sum + o.total, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Pending Orders</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">
            {orders.filter((o) => o.status === 'pending').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Completed Orders</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {orders.filter((o) => o.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by order number or customer name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{order.orderNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{order.customerName || order.user?.name || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {order.items[0].name || order.items[0].productName}
                        {order.items.length > 1 && ` +${order.items.length - 1} more`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm font-medium text-gray-900">
                      <DollarSign size={14} />
                      ₹{(order.total || order.totalAmount || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                      <div className="text-xs text-gray-500">{order.paymentMethod}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                        order.status
                      )}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleViewOrder(order)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                      title="View Order Details"
                    >
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

          {filteredOrders.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-500 text-lg">No orders found</p>
            </div>
          )}
        </>
      )}

      {/* Order Details Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Order Details" size="lg">
        {loadingOrderDetails ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
          </div>
        ) : selectedOrder ? (
          <div className="space-y-6">
            {/* Order Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order Number:</span>
                  <span className="text-sm font-medium text-gray-900">{selectedOrder.orderNumber || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Order Date:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {selectedOrder.createdAt ? new Date(selectedOrder.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {selectedOrder.customerName || selectedOrder.user?.name || 'N/A'}
                  </span>
                </div>
                {selectedOrder.user?.email && (
                  <div className="flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{selectedOrder.user.email}</span>
                  </div>
                )}
                {selectedOrder.user?.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">{selectedOrder.user.phone}</span>
                  </div>
                )}
                {selectedOrder.shippingAddress && (
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-gray-400 mt-1" />
                    <div className="text-sm text-gray-700">
                      {selectedOrder.shippingAddress.street && <div>{selectedOrder.shippingAddress.street}</div>}
                      {selectedOrder.shippingAddress.city && selectedOrder.shippingAddress.state && (
                        <div>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}</div>
                      )}
                      {selectedOrder.shippingAddress.pincode && (
                        <div>PIN: {selectedOrder.shippingAddress.pincode}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Items */}
            {selectedOrder.items && selectedOrder.items.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Items</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedOrder.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">
                              {item.name || item.productName || 'N/A'}
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-500 mt-1">{item.description}</div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{item.quantity || 1}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            ₹{(item.price || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Information</h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Status:</span>
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                    {selectedOrder.paymentStatus || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Payment Method:</span>
                  <div className="flex items-center gap-2">
                    <CreditCard size={14} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-900">{selectedOrder.paymentMethod || 'N/A'}</span>
                  </div>
                </div>
                {selectedOrder.paymentId && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Payment ID:</span>
                    <span className="text-sm font-medium text-gray-900">{selectedOrder.paymentId}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="text-base font-semibold text-gray-800">Total Amount:</span>
                  <span className="text-base font-bold text-indigo-600">
                    ₹{(selectedOrder.total || selectedOrder.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

export default Orders

