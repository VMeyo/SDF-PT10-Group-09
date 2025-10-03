"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"
import { Input } from "../ui/Input"

export const UserManagement = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [promoting, setPromoting] = useState(null)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [showUserModal, setShowUserModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    points: 0,
    location: "",
    latitude: null,
    longitude: null,
  })
  const [saving, setSaving] = useState(false)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState("")

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchTerm || roleFilter !== "all" || statusFilter !== "all") {
      const filtered = users.filter((user) => {
        const matchesSearch =
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = roleFilter === "all" || user.role === roleFilter
        const matchesStatus = statusFilter === "all" || user.status === statusFilter
        return matchesSearch && matchesRole && matchesStatus
      })
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [users, searchTerm, roleFilter, statusFilter])

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      const responseText = await response.text()

      if (response.ok) {
        let data
        try {
          data = JSON.parse(responseText)
        } catch (e) {
          console.error("Failed to parse JSON:", e)
          setUsers([])
          setLoading(false)
          return
        }

        let usersArray = []
        if (Array.isArray(data)) {
          usersArray = data
        } else if (data.users && Array.isArray(data.users)) {
          usersArray = data.users
        } else if (data.data && Array.isArray(data.data)) {
          usersArray = data.data
        }

        setUsers(usersArray)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const promoteUser = async (userId) => {
    setPromoting(userId)

    try {
      const response = await fetch(`${API_BASE}/auth/users/${userId}/promote`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        setUsers(users.map((user) => (user.id === userId ? { ...user, role: "admin" } : user)))
        alert("User promoted to admin successfully!")
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.msg || errorData.message || "Failed to promote user")
      }
    } catch (error) {
      console.error("Error promoting user:", error)
      alert("Error promoting user. Please check your connection.")
    } finally {
      setPromoting(null)
    }
  }

  const updateUserRole = async (userId, newRole) => {
    setPromoting(userId)
    try {
      if (newRole === "admin") {
        await promoteUser(userId)
      }
    } catch (error) {
      console.error("Error updating user role:", error)
    } finally {
      setPromoting(null)
    }
  }

  const getCurrentLocation = () => {
    setLocationLoading(true)
    setLocationError("")

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser")
      setLocationLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        setEditForm((prev) => ({
          ...prev,
          latitude,
          longitude,
        }))
        setLocationLoading(false)
        reverseGeocode(latitude, longitude)
      },
      (error) => {
        setLocationError("Unable to get your location. Please enter manually.")
        setLocationLoading(false)
        console.error("Geolocation error:", error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`,
      )
      const data = await response.json()

      if (data.locality || data.city) {
        const address = [data.locality || data.city, data.countryName].filter(Boolean).join(", ")
        setEditForm((prev) => ({
          ...prev,
          location: prev.location || address,
        }))
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error)
    }
  }

  const editUser = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email,
        phone: editForm.phone,
        role: editForm.role,
        points: editForm.points,
      }

      const response = await fetch(`${API_BASE}/users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        await fetchUsers()
        alert("User updated successfully!")
        setShowUserModal(false)
        setSelectedUser(null)
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.msg || errorData.message || "Failed to update user")
      }
    } catch (error) {
      console.error("Error updating user:", error)
      alert("Error updating user")
    } finally {
      setSaving(false)
    }
  }

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return

    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId))
        alert("User deleted successfully!")
      } else {
        alert("Failed to delete user")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error deleting user")
    }
  }

  const getUserStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200"
      case "suspended":
        return "bg-red-100 text-red-800 border-red-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200"
      case "moderator":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "user":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">User Management</h2>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => setShowUserModal(true)}>+ Add User</Button>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search and Filter Users</CardTitle>
          <CardDescription>Find and filter users by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Input
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="moderator">Moderator</option>
              <option value="user">User</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* User Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{users.filter((u) => u.status === "active").length}</div>
            <div className="text-sm text-gray-600">Active Users</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{users.filter((u) => u.role === "admin").length}</div>
            <div className="text-sm text-gray-600">Admins</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">
              {users.filter((u) => u.status === "pending").length}
            </div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced User List */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Manage individual users and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-lg font-medium">
                    {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <h3 className="font-semibold">{user.name || "Unknown User"}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 text-xs rounded-full border ${getRoleColor(user.role)}`}>
                        {user.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right text-sm">
                    <div className="font-medium">{user.points || 0} points</div>
                    {user.created_at && (
                      <div className="text-muted-foreground">
                        Joined {new Date(user.created_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedUser(user)
                        setEditForm({
                          name: user.name || "",
                          email: user.email || "",
                          phone: user.phone || "",
                          role: user.role || "user",
                          points: user.points || 0,
                          location: user.location || "",
                          latitude: user.latitude || null,
                          longitude: user.longitude || null,
                        })
                        setShowUserModal(true)
                      }}
                    >
                      Edit
                    </Button>

                    {user.role !== "admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => promoteUser(user.id)}
                        disabled={promoting === user.id}
                        className="text-blue-600 hover:bg-blue-50"
                      >
                        {promoting === user.id ? "Promoting..." : "Promote to Admin"}
                      </Button>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteUser(user.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[85vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Edit User</CardTitle>
              <CardDescription>Update user information and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={editUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <Input
                    placeholder="Full Name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <Input
                    placeholder="Email Address"
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <Input
                    placeholder="Phone Number"
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="User location"
                        value={editForm.location}
                        onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={getCurrentLocation}
                        disabled={locationLoading}
                        className="shrink-0 bg-transparent"
                      >
                        {locationLoading ? "📍..." : "📍 GPS"}
                      </Button>
                    </div>

                    {locationError && <p className="text-sm text-destructive">{locationError}</p>}

                    {editForm.latitude && editForm.longitude && (
                      <p className="text-sm text-muted-foreground">
                        📍 Coordinates: {editForm.latitude.toFixed(6)}, {editForm.longitude.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="user">User</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Community Points</label>
                  <Input
                    placeholder="Points"
                    type="number"
                    value={editForm.points}
                    onChange={(e) => setEditForm({ ...editForm, points: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex justify-end space-x-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowUserModal(false)
                      setSelectedUser(null)
                    }}
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Updating..." : "Update User"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">Try adjusting your search or filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
