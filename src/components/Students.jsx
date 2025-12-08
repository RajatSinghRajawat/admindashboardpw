import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Mail, Phone, Calendar, BookOpen, Filter, Loader2, Eye, Users } from 'lucide-react'
import { apiRequest } from '../services/apiClient'
import { studentsAPI, coursesAPI, batchesAPI } from '../services/api'
import StateMessage from './StateMessage'
import Modal from './Modal'

const Students = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [students, setStudents] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [courses, setCourses] = useState([])
  const [batches, setBatches] = useState([])
  const [loadingCourses, setLoadingCourses] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    courses: '',
    batches: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: '',
    },
  })

  useEffect(() => {
    fetchStudents()
  }, [])

  useEffect(() => {
    if (isModalOpen) {
      fetchCoursesAndBatches()
    }
  }, [isModalOpen])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Fetch all students by paginating through pages (max limit is 100 per validation)
      let allStudents = []
      let page = 1
      const limit = 100
      let hasMore = true
      
      while (hasMore) {
        const response = await studentsAPI.getAll({ 
          limit,
          page 
        })
        
        const studentsData = response.data?.data || response.data || []
        allStudents = [...allStudents, ...studentsData]
        
        // Check if there are more pages
        const pagination = response.data?.pagination
        if (pagination) {
          hasMore = page < pagination.pages
          page++
        } else {
          // If no pagination info, stop if we got less than limit
          hasMore = studentsData.length === limit
          page++
        }
      }
      
      // Map student data to match UI expectations
      const mappedStudents = allStudents.map((student) => ({
        _id: student._id,
        id: student._id,
        name: `${student.name || ''} ${student.lastName || ''}`.trim() || 'Unknown',
        email: student.email || '',
        phone: student.phone || '',
        enrollments: 0, // Will be calculated from enrollments if needed
        courses: student.courses ? ['Enrolled'] : [], // Placeholder - can be enhanced with actual course names
        status: 'Active', // Default status since Student model doesn't have isActive
        joinedDate: student.createdAt || new Date(),
        lastName: student.lastName || '',
        address: student.address || {},
      }))
      
      setStudents(mappedStudents)
    } catch (err) {
      setError(err.message || 'Failed to load students')
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter((student) => {
    const searchLower = searchTerm.toLowerCase()
    const matchesSearch =
      student.name?.toLowerCase().includes(searchLower) ||
      student.lastName?.toLowerCase().includes(searchLower) ||
      student.email?.toLowerCase().includes(searchLower) ||
      student.phone?.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const fetchCoursesAndBatches = async () => {
    try {
      setLoadingCourses(true)
      const [coursesRes, batchesRes] = await Promise.all([
        coursesAPI.getAll({ limit: 100 }),
        batchesAPI.getAll({ limit: 100 })
      ])
      setCourses(coursesRes.data?.data || coursesRes.data || [])
      setBatches(batchesRes.data?.data || batchesRes.data || [])
    } catch (err) {
      console.error('Failed to fetch courses/batches:', err)
    } finally {
      setLoadingCourses(false)
    }
  }

  const handleOpenModal = () => {
    setFormData({
      name: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      courses: '',
      batches: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: '',
      },
    })
    setError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)

      // Prepare data - only include courses/batches if they have values
      const submitData = {
        ...formData,
        courses: formData.courses || undefined,
        batches: formData.batches || undefined,
      }

      // Create student via admin Students API
      await studentsAPI.create(submitData)

      setIsModalOpen(false)
      fetchStudents()
    } catch (err) {
      setError(err.message || 'Failed to create student')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Students</h1>
          <p className="text-gray-600 mt-1">Manage all registered students</p>
        </div>
        <button
          type="button"
          onClick={handleOpenModal}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md"
        >
          Add Student
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
          <p className="text-sm text-gray-600 font-medium">Total Students</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{students.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Active Students</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {students.filter((s) => s.status === 'Active').length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Total Enrollments</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {students.reduce((sum, s) => sum + s.enrollments, 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Avg. Enrollments</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {students.length > 0 
              ? (students.reduce((sum, s) => sum + s.enrollments, 0) / students.length).toFixed(1)
              : '0.0'}
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
              placeholder="Search students by name, email, or phone..."
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Enrollments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Courses
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-600 font-semibold">{student.name.charAt(0)}</span>
                      </div>
                      <div className="ml-4">
                        <button
                          onClick={() => navigate(`/students/${student._id}`)}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                        >
                          {student.name}
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-2">
                      <Mail size={14} className="text-gray-400" />
                      {student.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                      <Phone size={14} className="text-gray-400" />
                      {student.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <BookOpen size={16} className="text-indigo-600" />
                      <span className="text-sm font-medium text-gray-900">{student.enrollments}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {student.courses.slice(0, 2).map((course, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800"
                        >
                          {course}
                        </span>
                      ))}
                      {student.courses.length > 2 && (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-800">
                          +{student.courses.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.status === 'Active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(student.joinedDate).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/students/${student._id}`)}
                      className="px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                      <Eye size={14} />
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

          {filteredStudents.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-500 text-lg">No students found</p>
            </div>
          )}
        </>
      )}
      {/* Add Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add New Student"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={formData.address.street}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, street: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, city: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, state: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
              <input
                type="text"
                value={formData.address.zip}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    address: { ...formData.address, zip: e.target.value },
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            <input
              type="text"
              value={formData.address.country}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address, country: e.target.value },
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Course and Batch Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <BookOpen size={14} className="text-indigo-600" />
                Course
              </label>
              {loadingCourses ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="animate-spin text-indigo-600" size={16} />
                </div>
              ) : (
                <select
                  value={formData.courses}
                  onChange={(e) => setFormData({ ...formData, courses: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select a course (optional)</option>
                  {courses.map((course) => (
                    <option key={course._id} value={course._id}>
                      {course.title || course.name} {course.category ? `- ${course.category}` : ''}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <Users size={14} className="text-purple-600" />
                Batch
              </label>
              {loadingCourses ? (
                <div className="flex items-center justify-center py-2">
                  <Loader2 className="animate-spin text-purple-600" size={16} />
                </div>
              ) : (
                <select
                  value={formData.batches}
                  onChange={(e) => setFormData({ ...formData, batches: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Select a batch (optional)</option>
                  {batches.map((batch) => (
                    <option key={batch._id} value={batch._id}>
                      {batch.title || batch.name} {batch.examType ? `- ${batch.examType}` : ''}
                    </option>
                  ))}
                </select>
              )}
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
              Create
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Students

