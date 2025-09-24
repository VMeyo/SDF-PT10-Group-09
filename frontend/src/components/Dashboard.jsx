"use client"

import { useAuth } from "../contexts/AuthContext"
import { UserDashboard } from "./user/UserDashboard"
import { AdminDashboard } from "./admin/AdminDashboard"

export const Dashboard = () => {
  const { isAdmin } = useAuth()

  return isAdmin ? <AdminDashboard /> : <UserDashboard />
}