import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { PageLoading } from './PageLoading'
import { useAuth } from '../contexts/AuthContext'

/** Customer-facing routes — logged-in admins are sent to the admin panel. */
export function BlockAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoading />
  }

  if (user?.isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return children
}

/** Admin panel only — requires an authenticated admin user. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

/** Customer account routes — regular users only. */
export function RequireUser({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <PageLoading />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return children
}
