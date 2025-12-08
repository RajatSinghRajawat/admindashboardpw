import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Calendar, Clock, Users, BookOpen, Loader2 } from 'lucide-react'
import { classesAPI, instructorsAPI, coursesAPI, batchesAPI } from '../services/api'
import StateMessage from './StateMessage'
import Modal from './Modal'

const Classes = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [classes, setClasses] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClass, setEditingClass] = useState(null)
  const [instructors, setInstructors] = useState([])
  const [courses, setCourses] = useState([])
  const [batches, setBatches] = useState([])
  const [loadingInstructors, setLoadingInstructors] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    courseId: '',
    batchId: '',
    instructorId: '',
    scheduledDate: '',
    startTime: '',
    endTime: '',
    duration: 60,
    status: 'scheduled',
    classType: 'live',
  })

  useEffect(() => {
    fetchClasses()
    fetchInstructors()
    fetchCourses()
    fetchBatches()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await classesAPI.getAll()
      const classesData = response.data?.data || response.data || []
      setClasses(Array.isArray(classesData) ? classesData : [])
    } catch (err) {
      setError(err.message || 'Failed to load classes')
      setClasses([])
    } finally {
      setLoading(false)
    }
  }

  const fetchInstructors = async () => {
    try {
      setLoadingInstructors(true)
      setError(null)
      const response = await instructorsAPI.getAll()
      const instructorsData = response.data?.data || response.data || []
      setInstructors(Array.isArray(instructorsData) ? instructorsData : [])
    } catch (err) {
      console.error('Failed to load instructors', err)
    } finally {
      setLoadingInstructors(false)
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

  const fetchBatches = async () => {
    try {
      const response = await batchesAPI.getAll({ limit: 100 })
      const batchesData = response.data?.data || response.data || []
      setBatches(Array.isArray(batchesData) ? batchesData : [])
    } catch (err) {
      console.error('Failed to load batches', err)
    }
  }

  const filteredClasses = classes.filter(
    (cls) =>
      cls.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cls.instructorName?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (cls = null) => {
    if (cls) {
      setEditingClass(cls)
      // Format dates for input fields
      const scheduledDate = cls.scheduledDate ? new Date(cls.scheduledDate).toISOString().split('T')[0] : ''
      const startTime = cls.startTime ? new Date(cls.startTime).toISOString().slice(0, 16) : ''
      const endTime = cls.endTime ? new Date(cls.endTime).toISOString().slice(0, 16) : ''
      
      setFormData({
        title: cls.title || '',
        subject: cls.subject || '',
        courseId: cls.courseId?._id || cls.courseId || '',
        batchId: cls.batchId?._id || cls.batchId || '',
        instructorId: cls.instructorId?._id || cls.instructorId || '',
        scheduledDate: scheduledDate,
        startTime: startTime,
        endTime: endTime,
        duration: cls.duration || 60,
        status: cls.status || 'scheduled',
        classType: cls.classType || 'live',
        videoFile: null,
      })
    } else {
      setEditingClass(null)
      setFormData({
        title: '',
        subject: '',
        courseId: '',
        batchId: '',
        instructorId: '',
        scheduledDate: '',
        startTime: '',
        endTime: '',
        duration: 60,
        status: 'scheduled',
        classType: 'live',
      })
    }
    setError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingClass(null)
    setFormData({
      title: '',
      subject: '',
      courseId: '',
      batchId: '',
      instructorId: '',
      scheduledDate: '',
      startTime: '',
      endTime: '',
      duration: 60,
      status: 'scheduled',
      classType: 'live',
    })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)

      // Prepare data for API - convert dates and handle optional fields
      const submitData = {
        title: formData.title,
        subject: formData.subject,
        courseId: formData.courseId,
        instructorId: formData.instructorId,
        status: formData.status,
        classType: formData.classType,
        duration: parseInt(formData.duration) || 60,
      }

      // Add optional fields only if they have values
      if (formData.batchId) submitData.batchId = formData.batchId
      if (formData.scheduledDate) submitData.scheduledDate = new Date(formData.scheduledDate)
      if (formData.startTime) submitData.startTime = new Date(formData.startTime)
      if (formData.endTime) submitData.endTime = new Date(formData.endTime)

      if (editingClass) {
        await classesAPI.update(editingClass._id || editingClass.id, submitData)
      } else {
        await classesAPI.create(submitData)
      }

      handleCloseModal()
      fetchClasses()
    } catch (err) {
      setError(err.message || 'Failed to save class')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return
    }

    try {
      setError(null)
      await classesAPI.delete(id)
      fetchClasses()
    } catch (err) {
      setError(err.message || 'Failed to delete class')
    }
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Classes</h1>
          <p className="text-gray-600 mt-1">Manage all your classes</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Add Class</span>
        </button>
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
          <p className="text-sm text-gray-600 font-medium">Total Classes</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{classes.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Live Classes</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {classes.filter((c) => c.status === 'live').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Total Attendees</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {classes.reduce((sum, c) => sum + (c.attendees?.length || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Scheduled Classes</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {classes.filter((c) => c.status === 'scheduled').length}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search classes by title, subject, or instructor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Class
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Instructor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
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
              {filteredClasses.map((cls) => (
                <tr key={cls.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{cls.title}</div>
                      <div className="text-sm text-gray-500">{cls.subject}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{cls.instructor || cls.instructorName || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {cls.scheduledDate && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span>{new Date(cls.scheduledDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {cls.startTime && (
                      <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                        <Clock size={14} className="text-gray-400" />
                        <span>{new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                    {!cls.scheduledDate && !cls.startTime && (
                      <span className="text-sm text-gray-400">Not scheduled</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {cls.attendees?.length || 0} {cls.duration ? `(${cls.duration} min)` : ''}
                    </div>
                    {cls.classType && (
                      <div className="text-xs text-gray-500 mt-1 capitalize">{cls.classType}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        cls.status === 'live'
                          ? 'bg-green-100 text-green-800'
                          : cls.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : cls.status === 'completed'
                          ? 'bg-gray-100 text-gray-800'
                          : cls.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {cls.status ? cls.status.charAt(0).toUpperCase() + cls.status.slice(1) : 'N/A'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenModal(cls)}
                        className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(cls._id || cls.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

          {filteredClasses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-500 text-lg">No classes found</p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingClass ? 'Edit Class' : 'Add New Class'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
              <select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id || course.id} value={course._id || course.id}>
                    {course.title || course.name} {course.category ? `- ${course.category}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch (Optional)</label>
              <select
                value={formData.batchId}
                onChange={(e) => setFormData({ ...formData, batchId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select batch (optional)</option>
                {batches.map((batch) => (
                  <option key={batch._id || batch.id} value={batch._id || batch.id}>
                    {batch.title || batch.name} {batch.examType ? `- ${batch.examType}` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructor *</label>
            {loadingInstructors ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="animate-spin text-indigo-600" size={18} />
              </div>
            ) : (
              <select
                required
                value={formData.instructorId}
                onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select instructor</option>
                {instructors.map((inst) => (
                  <option key={inst._id || inst.id} value={inst._id || inst.id}>
                    {inst.name || inst.fullName || 'Unnamed'} {inst.email ? `- ${inst.email}` : ''}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Type *</label>
              <select
                required
                value={formData.classType}
                onChange={(e) => setFormData({ ...formData, classType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="live">Live</option>
                <option value="recorded">Recorded</option>
                <option value="doubt">Doubt</option>
                <option value="revision">Revision</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes) *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
            <input
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="postponed">Postponed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Video File (Optional)</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files[0]
                if (file) {
                  setFormData({ ...formData, videoFile: file })
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <p className="text-xs text-gray-500 mt-1">Accepted formats: mp4, mpeg, mov, avi, webm, mkv (Max 500MB)</p>
          </div>

          {error && (
            <StateMessage
              title="Error"
              message={error}
              variant="error"
              compact
            />
          )}

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCloseModal}
              disabled={submitting}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {submitting && <Loader2 className="animate-spin" size={16} />}
              {editingClass ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Classes

