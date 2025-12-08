import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  Users, 
  Loader2,
  Save,
  X
} from 'lucide-react'
import { studentsAPI, coursesAPI, batchesAPI } from '../services/api' 
import StateMessage from './StateMessage'
import Modal from './Modal'

const StudentProfile = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [student, setStudent] = useState(null)
  const [courses, setCourses] = useState([])
  const [batches, setBatches] = useState([])
  const [studentCourse, setStudentCourse] = useState(null)
  const [studentBatch, setStudentBatch] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [enrollmentType, setEnrollmentType] = useState('course') // 'course' or 'batch'
  const [selectedCourse, setSelectedCourse] = useState('')
  const [selectedBatch, setSelectedBatch] = useState('')

  useEffect(() => {
    fetchStudent()
    fetchCourses()
    fetchBatches()
  }, [id])

  const fetchStudent = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await studentsAPI.getById(id)
      const studentData = response.data?.data || response.data
      setStudent(studentData)
      
      // Fetch course and batch details if IDs exist
      if (studentData.courses) {
        try {
          const courseRes = await coursesAPI.getById(studentData.courses)
          setStudentCourse(courseRes.data?.data || courseRes.data)
        } catch (err) {
          console.error('Failed to fetch course:', err)
        }
      }
      
      if (studentData.batches) {
        try {
          const batchRes = await batchesAPI.getById(studentData.batches)
          setStudentBatch(batchRes.data?.data || batchRes.data)
        } catch (err) {
          console.error('Failed to fetch batch:', err)
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load student')
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await coursesAPI.getAll({ limit: 100 })
      setCourses(response.data?.data || response.data || [])
    } catch (err) {
      console.error('Failed to fetch courses:', err)
    }
  }

  const fetchBatches = async () => {
    try {
      const response = await batchesAPI.getAll({ limit: 100 })
      setBatches(response.data?.data || response.data || [])
    } catch (err) {
      console.error('Failed to fetch batches:', err)
    }
  }

  const handleOpenModal = (type) => {
    setEnrollmentType(type)
    setSelectedCourse('')
    setSelectedBatch('')
    setError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedCourse('')
    setSelectedBatch('')
  }

  const handleEnroll = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setError(null)

      if (enrollmentType === 'course') {
        if (!selectedCourse) {
          setError('Please select a course')
          return
        }
        // Update student with course
        await studentsAPI.update(id, {
          courses: selectedCourse
        })
        // Fetch and set course details
        const courseRes = await coursesAPI.getById(selectedCourse)
        setStudentCourse(courseRes.data?.data || courseRes.data)
      } else {
        if (!selectedBatch) {
          setError('Please select a batch')
          return
        }
        // Update student with batch
        await studentsAPI.update(id, {
          batches: selectedBatch
        })
        // Fetch and set batch details
        const batchRes = await batchesAPI.getById(selectedBatch)
        setStudentBatch(batchRes.data?.data || batchRes.data)
      }

      setSuccess(`${enrollmentType === 'course' ? 'Course' : 'Batch'} assigned successfully`)
      setIsModalOpen(false)
      fetchStudent() // Refresh student data
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err.message || `Failed to assign ${enrollmentType}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin text-indigo-600" size={48} />
      </div>
    )
  }

  if (!student) {
    return (
      <div className="p-6">
        <StateMessage
          title="Student Not Found"
          message="The student you're looking for doesn't exist."
          variant="error"
          onAction={() => navigate('/students')}
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen animate-slide-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/students')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {student.name} {student.lastName}
            </h1>
            <p className="text-gray-600 mt-1">Student Profile</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => handleOpenModal('course')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-md flex items-center gap-2"
          >
            <BookOpen size={18} />
            Assign Course
          </button>
          <button
            onClick={() => handleOpenModal('batch')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 shadow-md flex items-center gap-2"
          >
            <Users size={18} />
            Assign Batch
          </button>
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

      {success && (
        <StateMessage
          title="Success"
          message={success}
          variant="success"
          onAction={() => setSuccess(null)}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Student Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">First Name</label>
                <p className="text-lg font-medium text-gray-900">{student.name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Last Name</label>
                <p className="text-lg font-medium text-gray-900">{student.lastName || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <Mail size={14} className="text-gray-400" />
                  Email
                </label>
                <p className="text-lg font-medium text-gray-900">{student.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  Phone
                </label>
                <p className="text-lg font-medium text-gray-900">{student.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600 flex items-center gap-2">
                  <Calendar size={14} className="text-gray-400" />
                  Joined Date
                </label>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(student.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          {student.address && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <MapPin size={20} className="text-indigo-600" />
                Address
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {student.address.street && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">Street</label>
                    <p className="text-lg font-medium text-gray-900">{student.address.street}</p>
                  </div>
                )}
                {student.address.city && (
                  <div>
                    <label className="text-sm text-gray-600">City</label>
                    <p className="text-lg font-medium text-gray-900">{student.address.city}</p>
                  </div>
                )}
                {student.address.state && (
                  <div>
                    <label className="text-sm text-gray-600">State</label>
                    <p className="text-lg font-medium text-gray-900">{student.address.state}</p>
                  </div>
                )}
                {student.address.zip && (
                  <div>
                    <label className="text-sm text-gray-600">ZIP Code</label>
                    <p className="text-lg font-medium text-gray-900">{student.address.zip}</p>
                  </div>
                )}
                {student.address.country && (
                  <div>
                    <label className="text-sm text-gray-600">Country</label>
                    <p className="text-lg font-medium text-gray-900">{student.address.country}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Courses & Batches */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Enrollments</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <BookOpen size={18} className="text-indigo-600" />
                  Course
                </h3>
                {studentCourse ? (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600">Course Name</p>
                    <p className="text-lg font-medium text-gray-900">
                      {studentCourse.title || studentCourse.name}
                    </p>
                    {studentCourse.category && (
                      <p className="text-sm text-gray-500 mt-1">Category: {studentCourse.category}</p>
                    )}
                  </div>
                ) : student.courses ? (
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <p className="text-sm text-gray-600">Course ID</p>
                    <p className="text-lg font-medium text-gray-900">{student.courses}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No course assigned</p>
                )}
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Users size={18} className="text-purple-600" />
                  Batch
                </h3>
                {studentBatch ? (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Batch Name</p>
                    <p className="text-lg font-medium text-gray-900">
                      {studentBatch.title || studentBatch.name}
                    </p>
                    {studentBatch.examType && (
                      <p className="text-sm text-gray-500 mt-1">Exam Type: {studentBatch.examType}</p>
                    )}
                  </div>
                ) : student.batches ? (
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-gray-600">Batch ID</p>
                    <p className="text-lg font-medium text-gray-900">{student.batches}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No batch assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Quick Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Stats</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-1">
                  Active
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Student ID</p>
                <p className="text-sm font-mono text-gray-900 mt-1">{student._id}</p>
              </div>
            </div>
          </div>

          {student.profilePicture && (
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Profile Picture</h2>
              <img
                src={student.profilePicture}
                alt={`${student.name} ${student.lastName}`}
                className="w-full rounded-lg"
              />
            </div>
          )}
        </div>
      </div>

      {/* Enrollment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Assign ${enrollmentType === 'course' ? 'Course' : 'Batch'}`}
        size="md"
      >
        <form onSubmit={handleEnroll} className="space-y-4">
          {enrollmentType === 'course' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course *
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Choose a course...</option>
                {courses.map((course) => (
                  <option key={course._id} value={course._id}>
                    {course.title || course.name} - {course.category || ''}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Batch *
              </label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose a batch...</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.title || batch.name} - {batch.examType || ''}
                  </option>
                ))}
              </select>
            </div>
          )}

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
              disabled={saving}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <Loader2 className="animate-spin" size={16} />}
              <Save size={16} />
              Assign
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default StudentProfile

