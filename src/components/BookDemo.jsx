import React, { useState, useEffect } from 'react'
import { Search, Edit, Trash2, Calendar, Clock, User, Mail, Phone, MapPin, BookOpen, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { bookdemoAPI, coursesAPI, centresAPI } from '../services/api'
import StateMessage from './StateMessage'
import Modal from './Modal'

const BookDemo = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [bookDemos, setBookDemos] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBookDemo, setEditingBookDemo] = useState(null)
  const [courses, setCourses] = useState([])
  const [centres, setCentres] = useState([])
  const [formData, setFormData] = useState({
    status: 'pending',
    notes: '',
  })

  useEffect(() => {
    fetchBookDemos()
    fetchCourses()
    fetchCentres()
  }, [])

  const fetchBookDemos = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await bookdemoAPI.getAll({ page: 1, limit: 100 })
      const bookDemosData = response.data?.data || response.data || []
      setBookDemos(Array.isArray(bookDemosData) ? bookDemosData : [])
    } catch (err) {
      setError(err.message || 'Failed to load demo bookings')
      setBookDemos([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll({ limit: 100 })
      const coursesData = response.data?.data || response.data || []
      setCourses(Array.isArray(coursesData) ? coursesData : [])
    } catch (err) {
      console.error('Failed to load courses', err)
    }
  }

  const fetchCentres = async () => {
    try {
      const response = await centresAPI.getAll({ limit: 100 })
      const centresData = response.data?.data || response.data || []
      setCentres(Array.isArray(centresData) ? centresData : [])
    } catch (err) {
      console.error('Failed to load centres', err)
    }
  }

  const filteredBookDemos = bookDemos.filter(
    (demo) =>
      demo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demo.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demo.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demo.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      demo.centre?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (demo = null) => {
    if (demo) {
      setEditingBookDemo(demo)
      setFormData({
        status: demo.status || 'pending',
        notes: demo.notes || '',
      })
    } else {
      setEditingBookDemo(null)
      setFormData({
        status: 'pending',
        notes: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBookDemo(null)
    setFormData({
      status: 'pending',
      notes: '',
    })
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!editingBookDemo) return

    try {
      setSubmitting(true)
      setError(null)
      await bookdemoAPI.update(editingBookDemo._id || editingBookDemo.id, formData)
      handleCloseModal()
      fetchBookDemos()
    } catch (err) {
      setError(err.message || 'Failed to update demo booking')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this demo booking?')) {
      return
    }

    try {
      setError(null)
      await bookdemoAPI.delete(id)
      fetchBookDemos()
    } catch (err) {
      setError(err.message || 'Failed to delete demo booking')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
      completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Book Demo</h1>
          <p className="text-gray-600 mt-1">Manage all demo class bookings</p>
        </div>
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
              <p className="text-sm text-gray-600 font-medium">Total Bookings</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{bookDemos.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {bookDemos.filter((d) => d.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-medium">Confirmed</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {bookDemos.filter((d) => d.status === 'confirmed').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {bookDemos.filter((d) => d.status === 'completed').length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone, course, or centre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Book Demo Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Centre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Preferred Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredBookDemos.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <AlertCircle className="text-gray-400 mb-4" size={48} />
                          <p className="text-gray-500 text-lg">No demo bookings found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredBookDemos.map((demo) => (
                      <tr key={demo._id || demo.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                              <User size={16} className="text-gray-400" />
                              {demo.name}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Mail size={14} className="text-gray-400" />
                              {demo.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Phone size={14} className="text-gray-400" />
                              {demo.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-indigo-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {typeof demo.course === 'object' ? demo.course?.title || 'N/A' : 'N/A'}
                              </div>
                              {typeof demo.course === 'object' && demo.course?.category && (
                                <div className="text-xs text-gray-500">{demo.course.category}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-red-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {typeof demo.centre === 'object' ? demo.centre?.name || 'N/A' : 'N/A'}
                              </div>
                              {typeof demo.centre === 'object' && demo.centre?.address?.city && (
                                <div className="text-xs text-gray-500">{demo.centre.address.city}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {demo.preferredDate && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={14} className="text-gray-400" />
                              <span>{new Date(demo.preferredDate).toLocaleDateString()}</span>
                            </div>
                          )}
                          {demo.preferredTime && (
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Clock size={14} className="text-gray-400" />
                              <span>{demo.preferredTime}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(demo.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleOpenModal(demo)}
                              className="text-indigo-600 hover:text-indigo-900 transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(demo._id || demo.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal for Edit */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Update Demo Booking">
        {editingBookDemo && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer Information</label>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{editingBookDemo.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{editingBookDemo.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{editingBookDemo.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm text-gray-700">
                  {typeof editingBookDemo.course === 'object' 
                    ? editingBookDemo.course?.title || 'N/A' 
                    : 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Centre</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm text-gray-700">
                  {typeof editingBookDemo.centre === 'object' 
                    ? editingBookDemo.centre?.name || 'N/A' 
                    : 'N/A'}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Date & Time</label>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">
                    {editingBookDemo.preferredDate 
                      ? new Date(editingBookDemo.preferredDate).toLocaleDateString() 
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{editingBookDemo.preferredTime || 'N/A'}</span>
                </div>
              </div>
            </div>

            {editingBookDemo.message && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{editingBookDemo.message}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Add any notes about this booking..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {submitting && <Loader2 className="animate-spin" size={16} />}
                Update Booking
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default BookDemo

