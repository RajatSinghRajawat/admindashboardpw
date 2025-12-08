import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Calendar, Users, Clock, X, Loader2 } from 'lucide-react'
import Modal from './Modal'
import { batchesAPI, coursesAPI, instructorsAPI } from '../services/api'
import StateMessage from './StateMessage'

const Batchs = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [batches, setBatches] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBatch, setEditingBatch] = useState(null)
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    examType: 'jee',
    batchType: 'regular',
    instructorId: '',
    startDate: '',
    endDate: '',
    duration: '',
    totalClasses: '',
    maxStudents: '',
    enrolledStudents: 0,
    price: '',
    originalPrice: '',
    features: [],
    mode: 'online',
    status: 'active',
    isFeatured: false,
    isPopular: false,
    priority: 0,
    image: '',
    thumbnail: '',
  })
  const [featureInput, setFeatureInput] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [thumbnailPreview, setThumbnailPreview] = useState('')

  const examTypes = ['jee', 'neet', 'gate', 'upsc', 'defence', 'ese', 'foundation', 'commerce', 'arts', 'other']
  const batchTypes = ['power', 'regular', 'crash', 'foundation', 'advanced', 'revision']
  const modes = ['online', 'offline', 'hybrid']
  const statuses = ['draft', 'active', 'inactive', 'completed', 'cancelled', 'upcoming']

  useEffect(() => {
    fetchBatches()
    fetchCoursesAndInstructors()
  }, [])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await batchesAPI.getAll()
      const batchesData = response.data?.data || response.data || []
      setBatches(Array.isArray(batchesData) ? batchesData : [])
    } catch (err) {
      setError(err.message || 'Failed to load batches')
      setBatches([])
    } finally {
      setLoading(false)
    }
  }

  const fetchCoursesAndInstructors = async () => {
    try {
      setError(null)
      // Fetch a reasonable number of items for dropdowns
      const [coursesRes, instructorsRes] = await Promise.all([
        coursesAPI.getAll({ limit: 100 }),
        instructorsAPI.getAll({ limit: 100 }),
      ])

      const courseData = coursesRes.data?.data || coursesRes.data || []
      const instructorData = instructorsRes.data?.data || instructorsRes.data || []

      setCourses(Array.isArray(courseData) ? courseData : [])
      setInstructors(Array.isArray(instructorData) ? instructorData : [])
    } catch (err) {
      // Don't block batch usage if these fail, just show message
      setError(err.message || 'Failed to load courses or instructors')
    }
  }

  const filteredBatches = batches.filter(
    (batch) =>
      batch.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      batch.examType?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'Full':
        return 'bg-blue-100 text-blue-800'
      case 'Completed':
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleOpenModal = (batch = null) => {
    if (batch) {
      setEditingBatch(batch)
      setFormData({
        title: batch.title || '',
        description: batch.description || '',
        courseId:
          (typeof batch.courseId === 'object' && batch.courseId !== null
            ? batch.courseId._id
            : batch.courseId) || '',
        examType: batch.examType || 'jee',
        batchType: batch.batchType || 'regular',
        instructorId:
          (typeof batch.instructorId === 'object' && batch.instructorId !== null
            ? batch.instructorId._id
            : batch.instructorId) || '',
        startDate: batch.startDate || '',
        endDate: batch.endDate || '',
        duration: batch.duration || '',
        totalClasses: batch.totalClasses || '',
        maxStudents: batch.capacity || batch.maxStudents || '',
        enrolledStudents: batch.students || batch.enrolledStudents || 0,
        price: batch.price || '',
        originalPrice: batch.originalPrice || '',
        features: batch.features || [],
        mode: batch.mode || 'online',
        status: batch.status?.toLowerCase() || 'active',
        isFeatured: batch.isFeatured || false,
        isPopular: batch.isPopular || false,
        priority: batch.priority || 0,
        image: batch.image || '',
        thumbnail: batch.thumbnail || '',
      })
      setImagePreview(batch.image || '')
      setThumbnailPreview(batch.thumbnail || '')
    } else {
      setEditingBatch(null)
      setFormData({
        title: '',
        description: '',
        courseId: '',
        examType: 'jee',
        batchType: 'regular',
        instructorId: '',
        startDate: '',
        endDate: '',
        duration: '',
        totalClasses: '',
        maxStudents: '',
        enrolledStudents: 0,
        price: '',
        originalPrice: '',
        features: [],
        mode: 'online',
        status: 'active',
        isFeatured: false,
        isPopular: false,
        priority: 0,
        image: '',
        thumbnail: '',
      })
      setImagePreview('')
      setThumbnailPreview('')
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingBatch(null)
    setFeatureInput('')
    setImagePreview('')
    setThumbnailPreview('')
  }

  const handleAddFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()],
      })
      setFeatureInput('')
    }
  }

  const handleRemoveFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index),
    })
  }

  const handleImageChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (type === 'image') {
          setFormData({ ...formData, image: reader.result })
          setImagePreview(reader.result)
        } else {
          setFormData({ ...formData, thumbnail: reader.result })
          setThumbnailPreview(reader.result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)

      if (editingBatch) {
        await batchesAPI.update(editingBatch._id || editingBatch.id, formData)
      } else {
        await batchesAPI.create(formData)
      }

      handleCloseModal()
      fetchBatches()
    } catch (err) {
      setError(err.message || 'Failed to save batch')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this batch?')) {
      return
    }

    try {
      setError(null)
      await batchesAPI.delete(id)
      fetchBatches()
    } catch (err) {
      setError(err.message || 'Failed to delete batch')
    }
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Batches</h1>
          <p className="text-gray-600 mt-1">Manage all your batches</p>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            handleOpenModal()
          }}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Create Batch</span>
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
      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search batches by name, instructor, or subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Total Batches</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{batches.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Active Batches</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {batches.filter((b) => b.status === 'Active' || b.status === 'active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Total Students</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {batches.reduce((sum, b) => sum + (b.students || 0), 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Average Capacity</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {batches.length > 0
              ? Math.round(
                  batches.reduce((sum, b) => sum + ((b.students || 0) / (b.capacity || 1)) * 100, 0) /
                    batches.length
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredBatches.map((batch) => (
          <div
            key={batch.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-800">{batch.title || batch.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{batch.subject}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(batch.status)}`}>
                {batch.status}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} className="text-gray-400" />
                <span>
                  {batch.students || 0} / {batch.capacity || 0} students
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 ml-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${((batch.students || 0) / (batch.capacity || 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} className="text-gray-400" />
                <span>Instructor: {batch.instructor}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} className="text-gray-400" />
                <span>
                  {batch.startDate
                    ? new Date(batch.startDate).toLocaleDateString()
                    : 'N/A'}{' '}
                  -{' '}
                  {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              {batch.schedule && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span>{batch.schedule}</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  handleOpenModal(batch)
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => handleDelete(batch._id || batch.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

          {filteredBatches.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-500 text-lg">No batches found</p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingBatch ? 'Edit Batch' : 'Create New Batch'}
        size="lg"
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
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
                {examTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Batch Type *</label>
              <select
                required
                value={formData.batchType}
                onChange={(e) => setFormData({ ...formData, batchType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {batchTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Course ID *</label>
              <select
                required
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select course</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor ID *</label>
              <select
                required
                value={formData.instructorId}
                onChange={(e) => setFormData({ ...formData, instructorId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="">Select instructor</option>
                {instructors.map((instructor) => (
                  <option key={instructor._id} value={instructor._id}>
                    {instructor.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
              <input
                type="text"
                required
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 12 months"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Classes *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.totalClasses}
                onChange={(e) => setFormData({ ...formData, totalClasses: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Students *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.maxStudents}
                onChange={(e) => setFormData({ ...formData, maxStudents: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹) *</label>
              <input
                type="number"
                required
                min="0"
                value={formData.originalPrice}
                onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mode *</label>
              <select
                required
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {modes.map((mode) => (
                  <option key={mode} value={mode}>
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
              <select
                required
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Features</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={featureInput}
                onChange={(e) => setFeatureInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                placeholder="Add a feature"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={handleAddFeature}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.features.map((feature, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'image')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {imagePreview && (
                <div className="mt-2">
                  <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                </div>
              )}
              {formData.image && !imagePreview && (
                <div className="mt-2 text-sm text-gray-500">Image URL: {formData.image}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageChange(e, 'thumbnail')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              {thumbnailPreview && (
                <div className="mt-2">
                  <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full h-32 object-cover rounded-lg" />
                </div>
              )}
              {formData.thumbnail && !thumbnailPreview && (
                <div className="mt-2 text-sm text-gray-500">Thumbnail URL: {formData.thumbnail}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <input
              type="number"
              min="0"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Featured</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isPopular}
                onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Popular</span>
            </label>
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
              {editingBatch ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Batchs
