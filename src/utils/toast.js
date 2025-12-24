import toast from 'react-hot-toast'

// Success toast
export const showSuccess = (message) => {
  toast.success(message)
}

// Error toast
export const showError = (message) => {
  toast.error(message)
}

// Info toast
export const showInfo = (message) => {
  toast(message, {
    icon: 'ℹ️',
  })
}

// Warning toast
export const showWarning = (message) => {
  toast(message, {
    icon: '⚠️',
  })
}

// Loading toast
export const showLoading = (message) => {
  return toast.loading(message)
}

// Dismiss toast
export const dismissToast = (toastId) => {
  toast.dismiss(toastId)
}

// Promise toast (for async operations)
export const showPromise = (promise, messages) => {
  return toast.promise(promise, messages)
}

// Default export for convenience
export default {
  success: showSuccess,
  error: showError,
  info: showInfo,
  warning: showWarning,
  loading: showLoading,
  dismiss: dismissToast,
  promise: showPromise,
}



