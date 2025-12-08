import React, { useState, useEffect } from 'react'
import { Search, Plus, Edit, Trash2, MapPin, Phone, Mail, Users, Loader2 } from 'lucide-react'
import { centresAPI } from '../services/api'
import StateMessage from './StateMessage'
import Modal from './Modal'

const Centres = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [centres, setCentres] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCentre, setEditingCentre] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
    email: '',
    alternatePhone: '',
    capacity: '',
    isActive: true,
  })

  useEffect(() => {
    fetchCentres()
  }, [])

  const fetchCentres = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await centresAPI.getAll()
      const centresData = response.data?.data || response.data || []
      setCentres(Array.isArray(centresData) ? centresData : [])
    } catch (err) {
      setError(err.message || 'Failed to load centres')
      setCentres([])
    } finally {
      setLoading(false)
    }
  }

  const filteredCentres = centres.filter(
    (centre) =>
      centre.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centre.address?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      centre.address?.state?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleOpenModal = (centre = null) => {
    if (centre) {
      setEditingCentre(centre)
      setFormData({
        name: centre.name || '',
        street: centre.address?.street || '',
        city: centre.address?.city || '',
        state: centre.address?.state || '',
        pincode: centre.address?.pincode || '',
        phone: centre.contact?.phone || '',
        email: centre.contact?.email || '',
        alternatePhone: centre.contact?.alternatePhone || '',
        capacity: centre.capacity ?? '',
        isActive: centre.isActive !== undefined ? centre.isActive : true,
      })
    } else {
      setEditingCentre(null)
      setFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: '',
        alternatePhone: '',
        capacity: '',
        isActive: true,
      })
    }
    setError(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingCentre(null)
    setFormData({
      name: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: '',
      alternatePhone: '',
      capacity: '',
      isActive: true,
    })
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      setError(null)

      const payload = {
        name: formData.name,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
        },
        contact: {
          phone: formData.phone,
          email: formData.email,
          alternatePhone: formData.alternatePhone || undefined,
        },
        capacity: formData.capacity ? Number(formData.capacity) : 0,
        isActive: formData.isActive,
      }

      if (editingCentre) {
        await centresAPI.update(editingCentre._id || editingCentre.id, payload)
      } else {
        await centresAPI.create(payload)
      }

      handleCloseModal()
      fetchCentres()
    } catch (err) {
      setError(err.message || 'Failed to save centre')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this centre?')) {
      return
    }

    try {
      setError(null)
      await centresAPI.delete(id)
      fetchCentres()
    } catch (err) {
      setError(err.message || 'Failed to delete centre')
    }
  }

  return (
    <div className="p-6 space-y-6 bg-white min-h-screen animate-slide-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Centres</h1>
          <p className="text-gray-600 mt-1">Manage all your centres</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
        >
          <Plus size={20} />
          <span>Add Centre</span>
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
          <p className="text-sm text-gray-600 font-medium">Total Centres</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{centres.length}</p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Active Centres</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {centres.filter((c) => c.isActive).length}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <p className="text-sm text-gray-600 font-medium">Total Capacity</p>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {centres.reduce((sum, c) => sum + (c.capacity || 0), 0)}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search centres by name, city, or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Centres Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCentres.map((centre) => (
          <div
            key={centre._id || centre.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{centre.name}</h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <MapPin size={16} className="text-gray-400" />
                  <span>
                    {centre.address?.street}, {centre.address?.city}, {centre.address?.state} -{' '}
                    {centre.address?.pincode}
                  </span>
                </div>
              </div>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  centre.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}
              >
                {centre.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone size={16} className="text-gray-400" />
                <span>{centre.contact?.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} className="text-gray-400" />
                <span>{centre.contact?.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
              <button
                onClick={() => handleOpenModal(centre)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <Edit size={16} />
                <span>Edit</span>
              </button>
              <button
                onClick={() => handleDelete(centre._id || centre.id)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={16} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

          {filteredCentres.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
              <p className="text-gray-500 text-lg">No centres found</p>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingCentre ? 'Edit Centre' : 'Add New Centre'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              required
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
            <input
              type="tel"
              value={formData.alternatePhone}
              onChange={(e) => setFormData({ ...formData, alternatePhone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              {editingCentre ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Centres

