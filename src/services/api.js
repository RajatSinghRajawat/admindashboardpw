import { apiRequest, getStoredToken, persistToken, clearToken } from './apiClient'

// Authentication
export const authAPI = {
  login: async (email, password) => {
    const response = await apiRequest({
      endpoint: '/admin/login',
      method: 'post',
      data: { email, password },
    })
    if (response.data?.token) {
      persistToken('admin', response.data.token)
    }
    return response
  },

  getMe: async () => {
    return apiRequest({
      endpoint: '/admin/me',
      method: 'get',
      authType: 'admin',
    })
  },

  logout: () => {
    clearToken('admin')
  },
}

// Admin Management
export const adminAPI = {
  getAll: async (params = {}) => {
    return apiRequest({
      endpoint: '/admin/list',
      method: 'get',
      params,
      authType: 'admin',
    })
  },

  getById: async (id) => {
    return apiRequest({
      endpoint: `/admin/${id}`,
      method: 'get',
      authType: 'admin',
    })
  },

  create: async (data) => {
    return apiRequest({
      endpoint: '/admin/register',
      method: 'post',
      data,
      authType: 'admin',
    })
  },

  update: async (id, data) => {
    return apiRequest({
      endpoint: `/admin/${id}`,
      method: 'put',
      data,
      authType: 'admin',
    })
  },

  delete: async (id) => {
    return apiRequest({
      endpoint: `/admin/${id}`,
      method: 'delete',
      authType: 'admin',
    })
  },

  updateStatus: async (id, isActive) => {
    return apiRequest({
      endpoint: `/admin/${id}/status`,
      method: 'put',
      data: { isActive },
      authType: 'admin',
    })
  },
}

// Courses
export const coursesAPI = {
  getAll: async (params = {}) => {
    return apiRequest({
      endpoint: '/courses',
      method: 'get',
      params,
    })
  },

  getFeatured: async () => {
    return apiRequest({
      endpoint: '/courses/featured',
      method: 'get',
    })
  },

  getPopular: async () => {
    return apiRequest({
      endpoint: '/courses/popular',
      method: 'get',
    })
  },

  getByCategory: async (category) => {
    return apiRequest({
      endpoint: `/courses/category/${category}`,
      method: 'get',
    })
  },

  getById: async (id) => {
    return apiRequest({
      endpoint: `/courses/${id}`,
      method: 'get',
    })
  },

  create: async (formData) => {
    return apiRequest({
      endpoint: '/courses/createCourse',
      method: 'post',
      data: formData,
      authType: 'admin',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  update: async (id, formData) => {
    return apiRequest({
      endpoint: `/courses/update/${id}`,
      method: 'put',
      data: formData,
      authType: 'admin',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  delete: async (id) => {
    return apiRequest({
      endpoint: `/courses/${id}`,
      method: 'delete',
      authType: 'admin',
    })
  },

  updateRating: async (id, rating, ratingCount) => {
    return apiRequest({
      endpoint: `/courses/${id}/rating`,
      method: 'put',
      data: { rating, ratingCount },
      authType: 'admin',
    })
  },

  updateStudents: async (id, count = 1) => {
    return apiRequest({
      endpoint: `/courses/${id}/students`,
      method: 'put',
      data: { count },
      authType: 'admin',
    })
  },
}

// Batches
export const batchesAPI = {
  getAll: async (params = {}) => {
    return apiRequest({
      endpoint: '/batches',
      method: 'get',
      params,
    })
  },

  getFeatured: async () => {
    return apiRequest({
      endpoint: '/batches/featured',
      method: 'get',
    })
  },

  getPopular: async () => {
    return apiRequest({
      endpoint: '/batches/popular',
      method: 'get',
    })
  },

  getActive: async () => {
    return apiRequest({
      endpoint: '/batches/active',
      method: 'get',
    })
  },

  getByExamType: async (examType) => {
    return apiRequest({
      endpoint: `/batches/exam/${examType}`,
      method: 'get',
    })
  },

  getById: async (id) => {
    return apiRequest({
      endpoint: `/batches/${id}`,
      method: 'get',
    })
  },

  create: async (data) => {
    return apiRequest({
      endpoint: '/batches',
      method: 'post',
      data,
      authType: 'admin',
    })
  },

  update: async (id, data) => {
    return apiRequest({
      endpoint: `/batches/${id}`,
      method: 'put',
      data,
      authType: 'admin',
    })
  },

  delete: async (id) => {
    return apiRequest({
      endpoint: `/batches/${id}`,
      method: 'delete',
      authType: 'admin',
    })
  },

  enroll: async (id, data) => {
    return apiRequest({
      endpoint: `/batches/${id}/enroll`,
      method: 'post',
      data,
      authType: 'admin',
    })
  },

  updateRating: async (id, rating) => {
    return apiRequest({
      endpoint: `/batches/${id}/rating`,
      method: 'put',
      data: { rating },
      authType: 'admin',
    })
  },

  getStatistics: async (id) => {
    return apiRequest({
      endpoint: `/batches/${id}/statistics`,
      method: 'get',
      authType: 'admin',
    })
  },
}

// Instructors
export const instructorsAPI = {
  getAll: async (params = {}) => {
    return apiRequest({
      endpoint: '/instructors',
      method: 'get',
      params,
    })
  },

  getById: async (id) => {
    return apiRequest({
      endpoint: `/instructors/${id}`,
      method: 'get',
    })
  },

  login: async (email, password) => {
    return apiRequest({
      endpoint: '/instructors/login',
      method: 'post',
      data: { email, password },
    })
  },

  create: async (data) => {
    return apiRequest({
      endpoint: '/instructors',
      method: 'post',
      data,
      authType: 'admin',
    })
  },

  update: async (id, data) => {
    return apiRequest({
      endpoint: `/instructors/${id}`,
      method: 'put',
      data,
      authType: 'admin',
    })
  },

  delete: async (id) => {
    return apiRequest({
      endpoint: `/instructors/${id}`,
      method: 'delete',
      authType: 'admin',
    })
  },
}

// Centres
export const centresAPI = {
  getAll: async (params = {}) => {
    return apiRequest({
      endpoint: '/centres',
      method: 'get',
      params,
    })
  },

  getNearby: async (params) => {
    return apiRequest({
      endpoint: '/centres/nearby',
      method: 'get',
      params,
    })
  },

  getById: async (id) => {
    return apiRequest({
      endpoint: `/centres/${id}`,
      method: 'get',
    })
  },

  create: async (data) => {
    return apiRequest({
      endpoint: '/centres',
      method: 'post',
      data,
      authType: 'admin',
    })
  },

  update: async (id, data) => {
    return apiRequest({
      endpoint: `/centres/${id}`,
      method: 'put',
      data,
      authType: 'admin',
    })
  },

  delete: async (id) => {
    return apiRequest({
      endpoint: `/centres/${id}`,
      method: 'delete',
      authType: 'admin',
    })
  },
}

// Classes
export const classesAPI = {
  getLive: async () => {
    return apiRequest({
      endpoint: '/classes/live',
      method: 'get',
    })
  },

  getAll: async (params = {}) => {
    return apiRequest({
      endpoint: '/classes',
      method: 'get',
      params,
      // authType optional - route is now public but will use admin token if available
      authType: 'admin',
    })
  },

  getById: async (id) => {
    return apiRequest({
      endpoint: `/classes/${id}`,
      method: 'get',
      // authType optional - route is now public but will use admin token if available
      authType: 'admin',
    })
  },

  create: async (data) => {
    return apiRequest({
      endpoint: '/classes',
      method: 'post',
      data,
      authType: 'admin',
    })
  },

  update: async (id, data) => {
    return apiRequest({
      endpoint: `/classes/${id}`,
      method: 'put',
      data,
      authType: 'admin',
    })
  },

  delete: async (id) => {
    return apiRequest({
      endpoint: `/classes/${id}`,
      method: 'delete',
      authType: 'admin',
    })
  },

  join: async (id) => {
    return apiRequest({
      endpoint: `/classes/${id}/join`,
      method: 'post',
      authType: 'admin',
    })
  },
}

// Enrollments
export const enrollmentsAPI = {
  getAll: async (params = {}) => {
    return apiRequest({
      endpoint: '/enrollments',
      method: 'get',
      params,
      authType: 'admin',
    })
  },

  getMyEnrollments: async () => {
    return apiRequest({
      endpoint: '/enrollments/my-enrollments',
      method: 'get',
      authType: 'admin',
    })
  },

  getById: async (id) => {
    return apiRequest({
      endpoint: `/enrollments/${id}`,
      method: 'get',
      authType: 'admin',
    })
  },

  create: async (data) => {
    return apiRequest({
      endpoint: '/enrollments',
      method: 'post',
      data,
      authType: 'admin',
    })
  },

  update: async (id, data) => {
    return apiRequest({
      endpoint: `/enrollments/${id}`,
      method: 'put',
      data,
      authType: 'admin',
    })
  },

  delete: async (id) => {
    return apiRequest({
      endpoint: `/enrollments/${id}`,
      method: 'delete',
      authType: 'admin',
    })
  },

  updateProgress: async (id, progress) => {
    return apiRequest({
      endpoint: `/enrollments/${id}/progress`,
      method: 'put',
      data: { progress },
      authType: 'admin',
    })
  },
}

// Orders
export const ordersAPI = {
  getAll: async (params = {}) => {
    return apiRequest({
      endpoint: '/orders',
      method: 'get',
      params,
      authType: 'admin',
    })
  },

  getMyOrders: async () => {
    return apiRequest({
      endpoint: '/orders/my-orders',
      method: 'get',
      authType: 'admin',
    })
  },

  getById: async (id) => {
    return apiRequest({
      endpoint: `/orders/${id}`,
      method: 'get',
      authType: 'admin',
    })
  },

  create: async (data) => {
    return apiRequest({
      endpoint: '/orders',
      method: 'post',
      data,
      authType: 'admin',
    })
  },

  update: async (id, data) => {
    return apiRequest({
      endpoint: `/orders/${id}`,
      method: 'put',
      data,
      authType: 'admin',
    })
  },

  cancel: async (id) => {
    return apiRequest({
      endpoint: `/orders/${id}/cancel`,
      method: 'put',
      authType: 'admin',
    })
  },
}

// Store
export const storeAPI = {
  getAll: async (params = {}) => {
    return apiRequest({
      endpoint: '/store',
      method: 'get',
      params,
    })
  },

  getByCategory: async (category) => {
    return apiRequest({
      endpoint: `/store/category/${category}`,
      method: 'get',
    })
  },

  getById: async (id) => {
    return apiRequest({
      endpoint: `/store/products/${id}`,
      method: 'get',
    })
  },

  create: async (data) => {
    return apiRequest({
      endpoint: '/store/products',
      method: 'post',
      data,
      authType: 'admin',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  update: async (id, data) => {
    return apiRequest({
      endpoint: `/store/products/${id}`,
      method: 'put',
      data,
      authType: 'admin',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  delete: async (id) => {
    return apiRequest({
      endpoint: `/store/products/${id}`,
      method: 'delete',
      authType: 'admin',
    })
  },

  updateStock: async (id, stock) => {
    return apiRequest({
      endpoint: `/store/products/${id}/stock`,
      method: 'put',
      data: { stock },
      authType: 'admin',
    })
  },
}

// Students
export const studentsAPI = {
  getAll: async (params = {}) => {
    return apiRequest({
      endpoint: '/students',
      method: 'get',
      params,
      authType: 'admin',
    })
  },

  getById: async (id) => {
    return apiRequest({
      endpoint: `/students/${id}`,
      method: 'get',
      authType: 'admin',
    })
  },

  create: async (data) => {
    return apiRequest({
      endpoint: '/students',
      method: 'post',
      data,
      authType: 'admin',
    })
  },

  update: async (id, data) => {
    return apiRequest({
      endpoint: `/students/${id}`,
      method: 'put',
      data,
      authType: 'admin',
    })
  },

  delete: async (id) => {
    return apiRequest({
      endpoint: `/students/${id}`,
      method: 'delete',
      authType: 'admin',
    })
  },
}

// Tests
export const testsAPI = {
  getAll: async (params = {}) => {
    return apiRequest({
      endpoint: '/tests',
      method: 'get',
      params,
      authType: 'admin',
    })
  },

  getById: async (id) => {
    return apiRequest({
      endpoint: `/tests/${id}`,
      method: 'get',
      authType: 'admin',
    })
  },

  create: async (data) => {
    return apiRequest({
      endpoint: '/tests',
      method: 'post',
      data,
      authType: 'admin',
    })
  },

  update: async (id, data) => {
    return apiRequest({
      endpoint: `/tests/${id}`,
      method: 'put',
      data,
      authType: 'admin',
    })
  },

  delete: async (id) => {
    return apiRequest({
      endpoint: `/tests/${id}`,
      method: 'delete',
      authType: 'admin',
    })
  },

  publish: async (id) => {
    return apiRequest({
      endpoint: `/tests/${id}/publish`,
      method: 'put',
      authType: 'admin',
    })
  },
}

// Book Demo
export const bookdemoAPI = {
  getAll: async (params = {}) => {
    return apiRequest({
      endpoint: '/bookdemo',
      method: 'get',
      params,
      authType: 'admin',
    })
  },

  getById: async (id) => {
    return apiRequest({
      endpoint: `/bookdemo/${id}`,
      method: 'get',
      authType: 'admin',
    })
  },

  update: async (id, data) => {
    return apiRequest({
      endpoint: `/bookdemo/${id}`,
      method: 'put',
      data,
      authType: 'admin',
    })
  },

  delete: async (id) => {
    return apiRequest({
      endpoint: `/bookdemo/${id}`,
      method: 'delete',
      authType: 'admin',
    })
  },
}

