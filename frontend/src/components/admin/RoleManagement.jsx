"use client"

import { useState, useEffect } from "react"
import { Button } from "../ui/Button"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui/Card"
import { Input } from "../ui/Input"

export const RoleManagement = () => {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [users, setUsers] = useState([])
  const [selectedRole, setSelectedRole] = useState(null)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showPermissionModal, setShowPermissionModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newRoleName, setNewRoleName] = useState("")
  const [newRoleDescription, setNewRoleDescription] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState([])

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const token = localStorage.getItem("token")

  const defaultRoles = [
    {
      id: 1,
      name: "Super Admin",
      description: "Full system access with all permissions",
      permissions: ["all"],
      userCount: 1,
      isSystem: true,
      color: "bg-red-500",
    },
    {
      id: 2,
      name: "Admin",
      description: "Administrative access to manage reports and users",
      permissions: ["manage_reports", "manage_users", "view_analytics", "manage_status"],
      userCount: 3,
      isSystem: true,
      color: "bg-blue-500",
    },
    {
      id: 3,
      name: "Moderator",
      description: "Can review and moderate reports",
      permissions: ["view_reports", "update_status", "view_analytics"],
      userCount: 5,
      isSystem: false,
      color: "bg-green-500",
    },
    {
      id: 4,
      name: "Responder",
      description: "Emergency responder with field access",
      permissions: ["view_reports", "update_status", "add_notes"],
      userCount: 12,
      isSystem: false,
      color: "bg-orange-500",
    },
    {
      id: 5,
      name: "User",
      description: "Standard user who can submit reports",
      permissions: ["submit_reports", "view_own_reports"],
      userCount: 156,
      isSystem: true,
      color: "bg-gray-500",
    },
  ]

  const availablePermissions = [
    {
      id: "all",
      name: "All Permissions",
      description: "Complete system access",
      category: "System",
    },
    {
      id: "manage_users",
      name: "Manage Users",
      description: "Create, edit, and delete user accounts",
      category: "User Management",
    },
    {
      id: "manage_roles",
      name: "Manage Roles",
      description: "Create and modify user roles and permissions",
      category: "User Management",
    },
    {
      id: "manage_reports",
      name: "Manage Reports",
      description: "Full access to all incident reports",
      category: "Report Management",
    },
    {
      id: "view_reports",
      name: "View Reports",
      description: "View incident reports",
      category: "Report Management",
    },
    {
      id: "update_status",
      name: "Update Status",
      description: "Change report status and workflow",
      category: "Report Management",
    },
    {
      id: "manage_status",
      name: "Manage Status Workflows",
      description: "Configure status workflows and automation",
      category: "Report Management",
    },
    {
      id: "submit_reports",
      name: "Submit Reports",
      description: "Create new incident reports",
      category: "Reporting",
    },
    {
      id: "view_own_reports",
      name: "View Own Reports",
      description: "View reports submitted by the user",
      category: "Reporting",
    },
    {
      id: "add_notes",
      name: "Add Notes",
      description: "Add notes and comments to reports",
      category: "Reporting",
    },
    {
      id: "view_analytics",
      name: "View Analytics",
      description: "Access system analytics and reports",
      category: "Analytics",
    },
    {
      id: "manage_system",
      name: "System Administration",
      description: "Configure system settings and preferences",
      category: "System",
    },
  ]

  useEffect(() => {
    fetchRoles()
    fetchUsers()
    setPermissions(availablePermissions)
  }, [])

  const fetchRoles = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/roles`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setRoles(data)
      } else {
        // Use default roles for development
        setRoles(defaultRoles)
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
      setRoles(defaultRoles)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    }
  }

  const createRole = async () => {
    try {
      const response = await fetch(`${API_BASE}/admin/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newRoleName,
          description: newRoleDescription,
          permissions: selectedPermissions,
        }),
      })

      if (response.ok) {
        const newRole = await response.json()
        setRoles([...roles, newRole])
        setShowRoleModal(false)
        setNewRoleName("")
        setNewRoleDescription("")
        setSelectedPermissions([])
      }
    } catch (error) {
      console.error("Error creating role:", error)
    }
  }

  const updateRole = async (roleId, updates) => {
    try {
      const response = await fetch(`${API_BASE}/admin/roles/${roleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        const updatedRole = await response.json()
        setRoles(roles.map((role) => (role.id === roleId ? updatedRole : role)))
      }
    } catch (error) {
      console.error("Error updating role:", error)
    }
  }

  const deleteRole = async (roleId) => {
    if (
      !confirm(
        "Are you sure you want to delete this role? Users with this role will be assigned the default User role.",
      )
    ) {
      return
    }

    try {
      const response = await fetch(`${API_BASE}/admin/roles/${roleId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        setRoles(roles.filter((role) => role.id !== roleId))
      }
    } catch (error) {
      console.error("Error deleting role:", error)
    }
  }

  const assignRoleToUser = async (userId, roleId) => {
    try {
      const response = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roleId }),
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error("Error assigning role:", error)
    }
  }

  const getPermissionsByCategory = () => {
    const categories = {}
    availablePermissions.forEach((permission) => {
      if (!categories[permission.category]) {
        categories[permission.category] = []
      }
      categories[permission.category].push(permission)
    })
    return categories
  }

  const hasPermission = (role, permissionId) => {
    return role.permissions.includes("all") || role.permissions.includes(permissionId)
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading role management...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold mb-2">Role Management</h2>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowPermissionModal(true)}>
            View Permissions
          </Button>
          <Button onClick={() => setShowRoleModal(true)}>+ Create Role</Button>
        </div>
      </div>

      {/* Role Statistics */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{roles.length}</div>
            <div className="text-sm text-gray-600">Total Roles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{roles.filter((r) => !r.isSystem).length}</div>
            <div className="text-sm text-gray-600">Custom Roles</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{availablePermissions.length}</div>
            <div className="text-sm text-gray-600">Permissions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">{users.length}</div>
            <div className="text-sm text-gray-600">Total Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Roles List */}
      <Card>
        <CardHeader>
          <CardTitle>System Roles</CardTitle>
          <CardDescription>Manage roles and their permissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${role.color}`}></div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold">{role.name}</h3>
                      {role.isSystem && (
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">System Role</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{role.description}</p>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                      <span>{role.userCount} users</span>
                      <span>{role.permissions.length} permissions</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRole(role)
                      setSelectedPermissions(role.permissions)
                      setNewRoleName(role.name)
                      setNewRoleDescription(role.description)
                      setShowRoleModal(true)
                    }}
                  >
                    Edit
                  </Button>

                  {!role.isSystem && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteRole(role.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Role Assignments */}
      <Card>
        <CardHeader>
          <CardTitle>User Role Assignments</CardTitle>
          <CardDescription>Assign roles to users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {users.slice(0, 10).map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 border border-gray-200 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {user.name?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </div>

                <select
                  value={user.roleId || 5}
                  onChange={(e) => assignRoleToUser(user.id, Number.parseInt(e.target.value))}
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Role Creation/Edit Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{selectedRole ? "Edit Role" : "Create New Role"}</h3>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false)
                  setSelectedRole(null)
                  setNewRoleName("")
                  setNewRoleDescription("")
                  setSelectedPermissions([])
                }}
              >
                Close
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Role Name</label>
                <Input
                  placeholder="Enter role name"
                  value={newRoleName}
                  onChange={(e) => setNewRoleName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  placeholder="Describe this role's purpose"
                  value={newRoleDescription}
                  onChange={(e) => setNewRoleDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-3">Permissions</label>
                <div className="space-y-4">
                  {Object.entries(getPermissionsByCategory()).map(([category, perms]) => (
                    <div key={category}>
                      <h4 className="font-medium text-sm text-gray-700 mb-2">{category}</h4>
                      <div className="space-y-2 pl-4">
                        {perms.map((permission) => (
                          <label key={permission.id} className="flex items-start space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedPermissions.includes(permission.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPermissions([...selectedPermissions, permission.id])
                                } else {
                                  setSelectedPermissions(selectedPermissions.filter((p) => p !== permission.id))
                                }
                              }}
                              className="mt-1"
                            />
                            <div>
                              <div className="font-medium text-sm">{permission.name}</div>
                              <div className="text-xs text-gray-600">{permission.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRoleModal(false)
                  setSelectedRole(null)
                  setNewRoleName("")
                  setNewRoleDescription("")
                  setSelectedPermissions([])
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedRole) {
                    updateRole(selectedRole.id, {
                      name: newRoleName,
                      description: newRoleDescription,
                      permissions: selectedPermissions,
                    })
                  } else {
                    createRole()
                  }
                }}
                disabled={!newRoleName || selectedPermissions.length === 0}
              >
                {selectedRole ? "Update Role" : "Create Role"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Reference Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Available Permissions</h3>
              <Button variant="outline" onClick={() => setShowPermissionModal(false)}>
                Close
              </Button>
            </div>

            <div className="space-y-6">
              {Object.entries(getPermissionsByCategory()).map(([category, perms]) => (
                <div key={category}>
                  <h4 className="font-semibold text-lg text-gray-800 mb-3">{category}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {perms.map((permission) => (
                      <div key={permission.id} className="p-3 border border-gray-200 rounded-lg">
                        <div className="font-medium">{permission.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{permission.description}</div>
                        <div className="text-xs text-gray-500 mt-2">ID: {permission.id}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
