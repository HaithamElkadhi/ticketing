import { useState } from 'react'
import { useApp } from '../App.jsx'
import { C, ROLE_COLORS } from '../constants.js'
import { Badge, PageHeader, Card, Btn, Modal, Input, Select } from '../components/ui.jsx'

const ROLES = ["admin", "front", "back"]

export default function UserManagement() {
  const { user, users, createUserRecord, updateUserRecord } = useApp()

  const [addModal, setAddModal] = useState(false)
  const [editModal, setEditModal] = useState(null) // { userId, field, value }

  const [form, setForm] = useState({ name: "", email: "", role: "", password: "" })
  const [formError, setFormError] = useState("")

  if (user.role !== "admin") {
    return (
      <div style={{ textAlign: "center", padding: 64, color: C.muted }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>🔒</div>
        <div style={{ fontSize: 14 }}>Admin access required</div>
      </div>
    )
  }

  const handleAdd = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.role || !form.password.trim()) {
      setFormError("All fields are required."); return
    }
    if (users.find(u => u.email === form.email.trim())) {
      setFormError("Email already exists."); return
    }
    setFormError("")
    const newUser = {
      userId: "u" + Date.now(),
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      status: "Active",
      password: form.password.trim(),
      createdAt: "2026-04-22",
      addedBy: user.name,
    }
    try {
      await createUserRecord(newUser)
      setForm({ name: "", email: "", role: "", password: "" })
      setAddModal(false)
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create user.")
    }
  }

  const toggleStatus = async (userId, status) => {
    await updateUserRecord(userId, { status: status === "Active" ? "Inactive" : "Active" })
  }

  const changeRole = async (userId, newRole) => {
    await updateUserRecord(userId, { role: newRole })
    setEditModal(null)
  }

  const roleLabel = { admin: "Admin", front: "Front Office", back: "Back Office" }

  return (
    <div>
      <PageHeader
        title="User Management"
        subtitle={`${users.filter(u => u.status === "Active").length} active · ${users.filter(u => u.status === "Inactive").length} inactive`}
        actions={<Btn onClick={() => setAddModal(true)}>+ Add User</Btn>}
      />

      {/* Stats */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {ROLES.map(r => {
          const n = users.filter(u => u.role === r && u.status === "Active").length
          return (
            <div key={r} style={{
              background: C.card, border: `1px solid ${ROLE_COLORS[r]}30`, borderRadius: 8,
              padding: "12px 16px", flex: 1, textAlign: "center",
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: ROLE_COLORS[r] }}>{n}</div>
              <div style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{roleLabel[r]}</div>
            </div>
          )
        })}
      </div>

      {/* Table */}
      <Card style={{ padding: 0 }}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["User", "Email", "Role", "Status", "Created At", "Added By", "Actions"].map(h => (
                  <th key={h} style={{
                    padding: "10px 16px", textAlign: "left",
                    fontSize: 10, fontWeight: 700, color: C.muted,
                    textTransform: "uppercase", letterSpacing: "0.05em",
                    background: C.subtle, whiteSpace: "nowrap",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: ROLE_COLORS[u.role] + "20", border: `1.5px solid ${ROLE_COLORS[u.role]}40`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 12, fontWeight: 700, color: ROLE_COLORS[u.role], flexShrink: 0,
                      }}>{u.name.charAt(0)}</div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{u.name}</div>
                        {u.id === user.id && <div style={{ fontSize: 10, color: C.muted }}>You</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>{u.email}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge color={ROLE_COLORS[u.role]} small>{roleLabel[u.role]}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <Badge color={u.status === "Active" ? "#10B981" : C.muted} small>{u.status}</Badge>
                  </td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted, whiteSpace: "nowrap" }}>{u.createdAt}</td>
                  <td style={{ padding: "12px 16px", fontSize: 12, color: C.muted }}>{u.addedBy}</td>
                  <td style={{ padding: "12px 16px" }}>
                    {u.id !== user.id ? (
                      <div style={{ display: "flex", gap: 6 }}>
                        <Btn small variant="secondary" onClick={() => setEditModal({ userId: u.id, role: u.role })}>
                          Edit Role
                        </Btn>
                        <Btn
                          small
                          variant={u.status === "Active" ? "danger" : "success"}
                          onClick={async () => toggleStatus(u.id, u.status)}
                        >
                          {u.status === "Active" ? "Deactivate" : "Activate"}
                        </Btn>
                      </div>
                    ) : (
                      <span style={{ fontSize: 11, color: C.muted }}>—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add User Modal */}
      <Modal open={addModal} onClose={() => { setAddModal(false); setFormError("") }} title="Add New User">
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input label="Full Name" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} placeholder="e.g. Amal Bensouda" required />
          <Input label="Email" type="email" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} placeholder="email@jeexpert.com" required />
          <Select label="Role" value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} options={[
            { value: "admin", label: "Admin" },
            { value: "front", label: "Front Office" },
            { value: "back",  label: "Back Office" },
          ]} placeholder="Select role" required />
          <Input label="Password" type="password" value={form.password} onChange={v => setForm(f => ({ ...f, password: v }))} placeholder="Temporary password" required />
          {formError && (
            <div style={{ background: "#EF444410", border: "1px solid #EF444430", borderRadius: 7, padding: "9px 12px", color: "#EF4444", fontSize: 13 }}>{formError}</div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="secondary" onClick={() => { setAddModal(false); setFormError("") }}>Cancel</Btn>
            <Btn onClick={handleAdd}>Create User</Btn>
          </div>
        </div>
      </Modal>

      {/* Edit Role Modal */}
      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Change Role" width={360}>
        {editModal && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>Select a new role for this user. This takes effect immediately.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={async () => changeRole(editModal.userId, r)}
                  style={{
                    background: editModal.role === r ? ROLE_COLORS[r] + "15" : C.subtle,
                    border: `1px solid ${editModal.role === r ? ROLE_COLORS[r] + "50" : C.border}`,
                    borderRadius: 8, padding: "11px 14px", cursor: "pointer",
                    color: editModal.role === r ? ROLE_COLORS[r] : C.text,
                    fontSize: 13, fontWeight: 600, textAlign: "left",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  <span>{roleLabel[r]}</span>
                  {editModal.role === r && <span style={{ fontSize: 12 }}>✓ current</span>}
                </button>
              ))}
            </div>
            <Btn variant="secondary" onClick={() => setEditModal(null)} style={{ width: "100%", display: "flex", justifyContent: "center" }}>Cancel</Btn>
          </div>
        )}
      </Modal>
    </div>
  )
}
