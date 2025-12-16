import React, { useState, useEffect } from 'react'
import { Search, Edit, Trash2, Calendar, User, Mail, Phone, MapPin, BookOpen, Loader2, CheckCircle, XCircle, AlertCircle, Eye, GraduationCap, Target, DollarSign, Clock, MessageSquare, Rocket } from 'lucide-react'
import { getStartedAPI, coursesAPI, centresAPI } from '../services/api'
import StateMessage from './StateMessage'
import Modal from './Modal'

const GetStarted = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [submissions, setSubmissions] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editingSubmission, setEditingSubmission] = useState(null)
  const [viewingSubmission, setViewingSubmission] = useState(null)
  const [courses, setCourses] = useState([])
  const [centres, setCentres] = useState([])
  const [formData, setFormData] = useState({
    status: 'pending',
    notes: '',
  })

  useEffect(() => {
    fetchSubmissions()
    fetchCourses()
    fetchCentres()
  }, [])

  const fetchSubmissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getStartedAPI.getAll({ page: 1, limit: 100 })
      const submissionsData = response.data?.data || response.data || []
      setSubmissions(Array.isArray(submissionsData) ? submissionsData : [])
    } catch (err) {
      setError(err.message || 'Failed to load submissions')
      setSubmissions([])
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

  const filteredSubmissions = submissions.filter(
    (submission) =>
      submission.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.course?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.centre?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      submission.grade?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (submission = null) => {
    if (submission) {
      setEditingSubmission(submission)
      setFormData({
        status: submission.status || 'pending',
        notes: submission.notes || '',
      })
    } else {
      setEditingSubmission(null)
      setFormData({
        status: 'pending',
        notes: '',
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSubmission(null)
    setFormData({
      status: 'pending',
      notes: '',
    })
  }

  const handleViewSubmission = async (submission) => {
    try {
      setError(null)
      const response = await getStartedAPI.getById(submission._id || submission.id)
      setViewingSubmission(response.data?.data || response.data || submission)
      setIsViewModalOpen(true)
    } catch (err) {
      setError(err.message || 'Failed to load submission details')
      setViewingSubmission(submission)
      setIsViewModalOpen(true)
    }
  }

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false)
    setViewingSubmission(null)
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
    if (!editingSubmission) return

    try {
      setSubmitting(true)
      setError(null)
      await getStartedAPI.update(editingSubmission._id || editingSubmission.id, formData)
      handleCloseModal()
      fetchSubmissions()
    } catch (err) {
      setError(err.message || 'Failed to update submission')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return
    }

    try {
      setError(null)
      await getStartedAPI.delete(id)
      fetchSubmissions()
    } catch (err) {
      setError(err.message || 'Failed to delete submission')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      contacted: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Contacted' },
      enrolled: { bg: 'bg-green-100', text: 'text-green-800', label: 'Enrolled' },
      'not-interested': { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Not Interested' },
      'follow-up': { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Follow Up' },
    }
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  const getGradeLabel = (grade) => {
    const gradeMap = {
      '6th': 'Class 6',
      '7th': 'Class 7',
      '8th': 'Class 8',
      '9th': 'Class 9',
      '10th': 'Class 10',
      '11th': 'Class 11',
      '12th': 'Class 12',
      'graduation': 'Graduation',
      'post-graduation': 'Post Graduation',
    }
    return gradeMap[grade] || grade
  }

  const getBudgetLabel = (budget) => {
    const budgetMap = {
      'under-5k': 'Under ₹5,000',
      '5k-10k': '₹5,000 - ₹10,000',
      '10k-20k': '₹10,000 - ₹20,000',
      '20k-50k': '₹20,000 - ₹50,000',
      'above-50k': 'Above ₹50,000',
      'flexible': 'Flexible',
    }
    return budgetMap[budget] || budget || 'Not specified'
  }

  const getTimeLabel = (time) => {
    const timeMap = {
      'morning': 'Morning (6 AM - 12 PM)',
      'afternoon': 'Afternoon (12 PM - 6 PM)',
      'evening': 'Evening (6 PM - 10 PM)',
      'flexible': 'Flexible',
    }
    return timeMap[time] || time || 'Not specified'
  }

  const getExperienceLabel = (exp) => {
    const expMap = {
      'beginner': 'Beginner - No previous coaching',
      'some': 'Some experience with other institutes',
      'experienced': 'Experienced with competitive exam preparation',
    }
    return expMap[exp] || exp || 'Not specified'
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Rocket className="text-indigo-600" size={32} />
            Get Started Submissions
          </h1>
          <p className="text-gray-600 mt-1">Manage all get started form submissions</p>
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
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-medium">Total Submissions</p>
              <p className="text-3xl font-bold text-gray-800 mt-2">{submissions.length}</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {submissions.filter((s) => s.status === 'pending').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-medium">Contacted</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {submissions.filter((s) => s.status === 'contacted').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-medium">Enrolled</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {submissions.filter((s) => s.status === 'enrolled').length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <p className="text-sm text-gray-600 font-medium">Not Interested</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">
                {submissions.filter((s) => s.status === 'not-interested').length}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name, email, phone, course, centre, or grade..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Centre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <AlertCircle className="text-gray-400 mb-4" size={48} />
                          <p className="text-gray-500 text-lg">No submissions found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((submission) => (
                      <tr key={submission._id || submission.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div>
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                              <User size={16} className="text-gray-400" />
                              {submission.name}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Mail size={14} className="text-gray-400" />
                              {submission.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                              <Phone size={14} className="text-gray-400" />
                              {submission.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <GraduationCap size={16} className="text-indigo-400" />
                            <span className="text-sm font-medium text-gray-900">
                              {getGradeLabel(submission.grade)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <BookOpen size={16} className="text-indigo-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {typeof submission.course === 'object' ? submission.course?.title || 'N/A' : 'N/A'}
                              </div>
                              {typeof submission.course === 'object' && submission.course?.category && (
                                <div className="text-xs text-gray-500">{submission.course.category}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <MapPin size={16} className="text-red-400" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {typeof submission.centre === 'object' ? submission.centre?.name || 'Not specified' : 'Not specified'}
                              </div>
                              {typeof submission.centre === 'object' && submission.centre?.address?.city && (
                                <div className="text-xs text-gray-500">{submission.centre.address.city}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(submission.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {submission.createdAt && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar size={14} className="text-gray-400" />
                              <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewSubmission(submission)}
                              className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50 transition-colors"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </button>
                            <button
                              onClick={() => handleOpenModal(submission)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(submission._id || submission.id)}
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

      {/* Modal for View Details */}
      <Modal isOpen={isViewModalOpen} onClose={handleCloseViewModal} title="Submission Details" size="lg">
        {viewingSubmission ? (
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-indigo-600" size={20} />
                Personal Information
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-900">{viewingSubmission.name || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{viewingSubmission.email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{viewingSubmission.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Academic Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <GraduationCap className="text-indigo-600" size={20} />
                Academic Details
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Grade:</span>
                  <span className="text-sm text-gray-900">{getGradeLabel(viewingSubmission.grade)}</span>
                </div>
                <div className="flex items-start gap-2">
                  <BookOpen size={16} className="text-indigo-400 mt-1" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {typeof viewingSubmission.course === 'object' 
                        ? viewingSubmission.course?.title || 'N/A' 
                        : 'N/A'}
                    </div>
                    {typeof viewingSubmission.course === 'object' && viewingSubmission.course?.category && (
                      <div className="text-xs text-gray-500 mt-1">{viewingSubmission.course.category}</div>
                    )}
                  </div>
                </div>
                {viewingSubmission.centre && (
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-red-400 mt-1" />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {typeof viewingSubmission.centre === 'object' 
                          ? viewingSubmission.centre?.name || 'Not specified' 
                          : 'Not specified'}
                      </div>
                      {typeof viewingSubmission.centre === 'object' && viewingSubmission.centre?.address && (
                        <div className="text-xs text-gray-500 mt-1">
                          {viewingSubmission.centre.address.street && (
                            <div>{viewingSubmission.centre.address.street}</div>
                          )}
                          {viewingSubmission.centre.address.city && (
                            <div>{viewingSubmission.centre.address.city}
                              {viewingSubmission.centre.address.state && `, ${viewingSubmission.centre.address.state}`}
                            </div>
                          )}
                          {viewingSubmission.centre.address.pincode && (
                            <div>PIN: {viewingSubmission.centre.address.pincode}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Goals & Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="text-indigo-600" size={20} />
                Goals & Preferences
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                {viewingSubmission.goals && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1">Academic Goals:</div>
                    <p className="text-sm text-gray-900">{viewingSubmission.goals}</p>
                  </div>
                )}
                {viewingSubmission.experience && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Experience:</span>
                    <span className="text-sm text-gray-900">{getExperienceLabel(viewingSubmission.experience)}</span>
                  </div>
                )}
                {viewingSubmission.budget && (
                  <div className="flex items-center gap-2">
                    <DollarSign size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Budget:</span>
                    <span className="text-sm text-gray-900">{getBudgetLabel(viewingSubmission.budget)}</span>
                  </div>
                )}
                {viewingSubmission.preferredTime && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span className="text-sm font-medium text-gray-700">Preferred Time:</span>
                    <span className="text-sm text-gray-900">{getTimeLabel(viewingSubmission.preferredTime)}</span>
                  </div>
                )}
                {viewingSubmission.message && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <MessageSquare size={14} className="text-gray-400" />
                      Additional Message:
                    </div>
                    <p className="text-sm text-gray-900">{viewingSubmission.message}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Status</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                {getStatusBadge(viewingSubmission.status)}
              </div>
            </div>

            {/* Admin Notes */}
            {viewingSubmission.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700">{viewingSubmission.notes}</p>
                </div>
              </div>
            )}

            {/* Submission Date */}
            {viewingSubmission.createdAt && (
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Submission Date</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span className="text-sm text-gray-700">
                      {new Date(viewingSubmission.createdAt).toLocaleString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Modal for Edit */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Update Submission">
        {editingSubmission && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student Information</label>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{editingSubmission.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{editingSubmission.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{editingSubmission.phone}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Course</label>
              <div className="bg-gray-50 p-4 rounded-lg">
                <span className="text-sm text-gray-700">
                  {typeof editingSubmission.course === 'object' 
                    ? editingSubmission.course?.title || 'N/A' 
                    : 'N/A'}
                </span>
              </div>
            </div>

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
                <option value="contacted">Contacted</option>
                <option value="enrolled">Enrolled</option>
                <option value="not-interested">Not Interested</option>
                <option value="follow-up">Follow Up</option>
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
                placeholder="Add any notes about this submission..."
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
                Update Submission
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default GetStarted

