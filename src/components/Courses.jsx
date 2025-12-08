import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, Star, Users, DollarSign, Filter, Eye, X, Loader2 } from 'lucide-react'
import Modal from './Modal'
import { coursesAPI } from '../services/api'
import StateMessage from './StateMessage'

const Courses = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [courses, setCourses] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'jee',
    price: '',
    originalPrice: '',
    duration: '',
    instructor: '',
    level: 'intermediate',
    features: [],
    image: null,
    thumbnail: null,
    isActive: true,
    isFeatured: false,
    isPopular: false,
  })
  const [featureInput, setFeatureInput] = useState('')
  const [imagePreview, setImagePreview] = useState('')
  const [thumbnailPreview, setThumbnailPreview] = useState('')

  const categories = [
    'jee',
    'neet',
    'gate',
    'upsc',
    'defence',
    'ese',
    'foundation',
    'commerce',
    'arts',
    'tech',
    'business',
    'design',
    'marketing',
    'data',
    'other',
  ]

  const levels = ['beginner', 'intermediate', 'advanced', 'expert']

  useEffect(() => {
    fetchCourses()
  }, [selectedCategory, searchTerm])

  const fetchCourses = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = {}
      if (selectedCategory !== 'all') {
        params.category = selectedCategory
      }
      if (searchTerm) {
        params.search = searchTerm
      }
      const response = await coursesAPI.getAll(params)
      const coursesData = response.data?.data || response.data || []
      setCourses(Array.isArray(coursesData) ? coursesData : [])
    } catch (err) {
      setError(err.message || 'Failed to load courses')
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.category.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory
    return matchesSearch && matchesCategory
  })

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
      tech: 'Tech',
      business: 'Business',
      design: 'Design',
      marketing: 'Marketing',
      data: 'Data Science',
      other: 'Other',
    }
    return labels[cat] || cat
  }

  const handleOpenModal = (course = null) => {
    if (course) {
      setEditingCourse(course)
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || 'jee',
        price: course.price || '',
        originalPrice: course.originalPrice || '',
        duration: course.duration || '',
        instructor: course.instructor || '',
        level: course.level || 'intermediate',
        features: Array.isArray(course.features) ? course.features : [],
        image: course.image || null,
        thumbnail: course.thumbnail || null,
        isActive: course.isActive !== undefined ? course.isActive : true,
        isFeatured: course.isFeatured || false,
        isPopular: course.isPopular || false,
      })
      setImagePreview(course.image || '')
      setThumbnailPreview(course.thumbnail || '')
    } else {
      setEditingCourse(null)
      setFormData({
        title: '',
        description: '',
        category: 'jee',
        price: '',
        originalPrice: '',
        duration: '',
        instructor: '',
        level: 'intermediate',
        features: [],
        image: null,
        thumbnail: null,
        isActive: true,
        isFeatured: false,
        isPopular: false,
      })
      setImagePreview('')
      setThumbnailPreview('')
    }
    setError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCourse(null)
    setFeatureInput('')
    setImagePreview('')
    setThumbnailPreview('')
  }

  const handleImageChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      if (type === 'image') {
        setFormData({ ...formData, image: file })
        const reader = new FileReader()
        reader.onloadend = () => setImagePreview(reader.result)
        reader.readAsDataURL(file)
      } else {
        setFormData({ ...formData, thumbnail: file })
        const reader = new FileReader()
        reader.onloadend = () => setThumbnailPreview(reader.result)
        reader.readAsDataURL(file)
      }
    }
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)

      const submitFormData = new FormData()
      submitFormData.append('title', formData.title)
      submitFormData.append('description', formData.description)
      submitFormData.append('category', formData.category)
      submitFormData.append('price', formData.price)
      submitFormData.append('originalPrice', formData.originalPrice)
      submitFormData.append('duration', formData.duration || '')
      submitFormData.append('instructor', formData.instructor || '')
      submitFormData.append('level', formData.level)
      submitFormData.append('isActive', formData.isActive)
      submitFormData.append('isFeatured', formData.isFeatured)
      submitFormData.append('isPopular', formData.isPopular)

      if (formData.features.length > 0) {
        submitFormData.append('features', formData.features.join(','))
      }

      if (formData.image instanceof File) {
        submitFormData.append('image', formData.image)
      } else if (formData.image) {
        submitFormData.append('image', formData.image)
      }

      if (formData.thumbnail instanceof File) {
        submitFormData.append('thumbnail', formData.thumbnail)
      } else if (formData.thumbnail) {
        submitFormData.append('thumbnail', formData.thumbnail)
      }

      if (editingCourse) {
        await coursesAPI.update(editingCourse._id || editingCourse.id, submitFormData)
      } else {
        await coursesAPI.create(submitFormData)
      }

      handleCloseModal()
      fetchCourses()
    } catch (err) {
      setError(err.message || 'Failed to save course')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this course?')) {
      return
    }

    try {
      setError(null)
      await coursesAPI.delete(id)
      fetchCourses()
    } catch (err) {
      setError(err.message || 'Failed to delete course')
    }
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Courses</h1>
          <p className="text-gray-600 mt-1">Manage all your courses</p>
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
          <span>Add Course</span>
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
          <p className="text-sm text-gray-600 font-medium">Total Courses</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{courses.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Active Courses</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {courses.filter((c) => c.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Total Students</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {courses.reduce((sum, c) => sum + c.students, 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Total Revenue</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            ₹{courses.reduce((sum, c) => sum + c.price * c.students, 0).toLocaleString()}
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
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <div
            key={course.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      {getCategoryLabel(course.category)}
                    </span>
                    {course.isFeatured && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        Featured
                      </span>
                    )}
                    {course.isPopular && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Popular
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">{course.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <span className="font-medium">{course.rating}</span>
                      <span className="text-gray-400">({course.ratingCount})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users size={16} />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-2xl font-bold text-gray-800">₹{course.price.toLocaleString()}</p>
                    <p className="text-sm text-gray-500 line-through">₹{course.originalPrice.toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="font-medium text-gray-800">{course.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      handleOpenModal(course)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(course._id || course.id)}
                    className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-500 text-lg">No courses found</p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCourse ? 'Edit Course' : 'Add New Course'}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {getCategoryLabel(cat)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                placeholder="e.g., 12 months"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instructor</label>
              <input
                type="text"
                value={formData.instructor}
                onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
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

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm text-gray-700">Active</span>
            </label>
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
              {editingCourse ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Courses
