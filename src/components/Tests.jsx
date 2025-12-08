import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Clock, Users, CheckCircle, XCircle, Filter, Loader2 } from 'lucide-react'
import { testsAPI, coursesAPI, batchesAPI } from '../services/api'
import StateMessage from './StateMessage'
import Modal from './Modal'

const Tests = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [tests, setTests] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTest, setEditingTest] = useState(null)
  const [courses, setCourses] = useState([])
  const [batches, setBatches] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    examType: 'jee',
    testType: 'mock',
    duration: '',
    totalQuestions: '',
    totalMarks: '',
    date: '',
    courseId: '',
    batchId: '',
    startDate: '',
    endDate: '',
    instructions: '',
    isPublished: false,
    isActive: true,
  })

  useEffect(() => {
    fetchTests()
    fetchCourses()
    fetchBatches()
  }, [])

  const fetchTests = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await testsAPI.getAll()
      const testsData = response.data?.data || response.data || []
      setTests(Array.isArray(testsData) ? testsData : [])
    } catch (err) {
      setError(err.message || 'Failed to load tests')
      setTests([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll({ page: 1, limit: 100 })
      // Backend returns: { success: true, data: [...], pagination: {...} }
      // apiRequest returns response.data, so we get: { success: true, data: [...] }
      let coursesData = []
      if (response?.success && Array.isArray(response.data)) {
        coursesData = response.data
      } else if (Array.isArray(response)) {
        coursesData = response
      } else if (response?.data && Array.isArray(response.data)) {
        coursesData = response.data
      }
      setCourses(coursesData)
      console.log('Courses loaded:', coursesData.length)
    } catch (err) {
      console.error('Failed to load courses:', err)
      setCourses([])
    }
  }

  const fetchBatches = async () => {
    try {
      const response = await batchesAPI.getAll({ page: 1, limit: 100 })
      // Backend returns: { success: true, data: [...], pagination: {...} }
      // apiRequest returns response.data, so we get: { success: true, data: [...] }
      let batchesData = []
      if (response?.success && Array.isArray(response.data)) {
        batchesData = response.data
      } else if (Array.isArray(response)) {
        batchesData = response
      } else if (response?.data && Array.isArray(response.data)) {
        batchesData = response.data
      }
      setBatches(batchesData)
      console.log('Batches loaded:', batchesData.length)
    } catch (err) {
      console.error('Failed to load batches:', err)
      setBatches([])
    }
  }

  const filteredTests = tests.filter((test) => {
    const matchesSearch =
      test.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      test.examType?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' && test.isPublished && test.isActive) ||
      (statusFilter === 'draft' && !test.isPublished)
    return matchesSearch && matchesStatus
  })

  const handleOpenModal = (test = null) => {
    if (test) {
      setEditingTest(test)
      setFormData({
        title: test.title || '',
        description: test.description || '',
        examType: test.examType || 'jee',
        testType: test.testType || 'mock',
        duration: test.duration || '',
        totalQuestions: test.totalQuestions || '',
        totalMarks: test.totalMarks || '',
        date: test.date ? new Date(test.date).toISOString().split('T')[0] : '',
        courseId: test.courseId?._id || test.courseId || '',
        batchId: test.batchId?._id || test.batchId || '',
        startDate: test.startDate ? new Date(test.startDate).toISOString().split('T')[0] : '',
        endDate: test.endDate ? new Date(test.endDate).toISOString().split('T')[0] : '',
        instructions: test.instructions || '',
        isPublished: test.isPublished || false,
        isActive: test.isActive !== undefined ? test.isActive : true,
      })
    } else {
      setEditingTest(null)
      setFormData({
        title: '',
        description: '',
        examType: 'jee',
        testType: 'mock',
        duration: '',
        totalQuestions: '',
        totalMarks: '',
        date: '',
        courseId: '',
        batchId: '',
        startDate: '',
        endDate: '',
        instructions: '',
        isPublished: false,
        isActive: true,
      })
    }
    setError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingTest(null)
    setFormData({
      title: '',
      description: '',
      examType: 'jee',
      testType: 'mock',
      duration: '',
      totalQuestions: '',
      totalMarks: '',
      date: '',
      courseId: '',
      batchId: '',
      startDate: '',
      endDate: '',
      instructions: '',
      isPublished: false,
      isActive: true,
    })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)

      // Prepare data for submission
      const submitData = {
        ...formData,
        duration: parseInt(formData.duration),
        totalQuestions: parseInt(formData.totalQuestions),
        totalMarks: parseInt(formData.totalMarks),
        date: formData.date ? new Date(formData.date) : new Date(),
        startDate: formData.startDate ? new Date(formData.startDate) : undefined,
        endDate: formData.endDate ? new Date(formData.endDate) : undefined,
        courseId: formData.courseId || undefined,
        batchId: formData.batchId || undefined,
      }

      // Remove empty strings
      Object.keys(submitData).forEach(key => {
        if (submitData[key] === '') {
          delete submitData[key]
        }
      })

      if (editingTest) {
        await testsAPI.update(editingTest._id || editingTest.id, submitData)
      } else {
        await testsAPI.create(submitData)
      }

      handleCloseModal()
      fetchTests()
    } catch (err) {
      setError(err.message || 'Failed to save test')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this test?')) {
      return
    }

    try {
      setError(null)
      await testsAPI.delete(id)
      fetchTests()
    } catch (err) {
      setError(err.message || 'Failed to delete test')
    }
  }

  const handlePublish = async (id) => {
    try {
      setError(null)
      await testsAPI.publish(id)
      fetchTests()
    } catch (err) {
      setError(err.message || 'Failed to publish test')
    }
  }

  const getCategoryLabel = (cat) => {
    const labels = {
      jee: 'IIT JEE',
      neet: 'NEET',
      gate: 'GATE',
      upsc: 'UPSC',
      defence: 'Defence',
      ese: 'ESE',
      foundation: 'Foundation',
      commerce: 'Commerce',
      arts: 'Arts',
      other: 'Other',
    }
    return labels[cat] || cat
  }

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Tests</h1>
          <p className="text-gray-600 mt-1">Manage all tests and mock exams</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Create Test</span>
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
          <p className="text-sm text-gray-600 font-medium">Total Tests</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{tests.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Published Tests</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {tests.filter((t) => t.isPublished).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Total Attempts</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {tests.reduce((sum, t) => sum + (t.attempts || 0), 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Avg. Attempts</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {tests.length > 0 ? Math.round(tests.reduce((sum, t) => sum + (t.attempts || 0), 0) / tests.length).toLocaleString() : '0'}
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
              placeholder="Search tests..."
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
              <option value="active">Active</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredTests.map((test) => (
          <div
            key={test.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    {getCategoryLabel(test.examType)}
                  </span>
                  {test.isPublished ? (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle size={12} />
                      Published
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800 flex items-center gap-1">
                      <XCircle size={12} />
                      Draft
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{test.title}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Clock size={16} className="text-gray-400" />
                <span>{formatDuration(test.duration)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} className="text-gray-400" />
                <span>{(test.attempts || 0).toLocaleString()} attempts</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Questions:</span> {test.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Marks:</span> {test.totalMarks}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleOpenModal(test)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              {!test.isPublished && (
                <button
                  onClick={() => handlePublish(test._id || test.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-green-600 border border-green-600 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <CheckCircle size={16} />
                  <span>Publish</span>
                </button>
              )}
              <button
                onClick={() => handleDelete(test._id || test.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

          {filteredTests.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-500 text-lg">No tests found</p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTest ? 'Edit Test' : 'Create New Test'}
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type *</label>
              <select
                required
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="jee">IIT JEE</option>
                <option value="neet">NEET</option>
                <option value="gate">GATE</option>
                <option value="upsc">UPSC</option>
                <option value="defence">Defence</option>
                <option value="ese">ESE</option>
                <option value="foundation">Foundation</option>
                <option value="commerce">Commerce</option>
                <option value="arts">Arts</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Test Type *</label>
              <select
                required
                value={formData.testType}
                onChange={(e) => setFormData({ ...formData, testType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="mock">Mock Test</option>
                <option value="practice">Practice</option>
                <option value="quiz">Quiz</option>
                <option value="assignment">Assignment</option>
                <option value="final">Final</option>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Questions *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.totalQuestions}
                onChange={(e) => setFormData({ ...formData, totalQuestions: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.totalMarks}
                onChange={(e) => setFormData({ ...formData, totalMarks: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course (Optional)</label>
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course._id || course.id} value={course._id || course.id}>
                    {course.title}
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
                <option value="">Select Batch</option>
                {batches.map((batch) => (
                  <option key={batch._id || batch.id} value={batch._id || batch.id}>
                    {batch.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Optional)</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
            <textarea
              rows={4}
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Enter test instructions for students..."
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="text-sm text-gray-700">Published</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <label className="text-sm text-gray-700">Active</label>
            </div>
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
              {editingTest ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Tests

