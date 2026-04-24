"use client";

import { useState, useTransition } from "react";
import { UserPlus, ShieldCheck, CheckCircle2, XCircle, Trash2, Lock, Save, X } from "lucide-react";
import {
  createAdminUser,
  updateAdminUser,
  changeAdminUserPassword,
  deleteAdminUser,
} from "../../actions/adminUsers";

type AdminUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

export default function UsersManager({
  users,
  currentUserId,
}: {
  users: AdminUser[];
  currentUserId: string;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [pwModalUserId, setPwModalUserId] = useState<string | null>(null);

  function showMsg(text: string, durationMs = 3000) {
    setMsg(text);
    setTimeout(() => setMsg(""), durationMs);
  }

  function handleAdd(formData: FormData) {
    start(async () => {
      const res = await createAdminUser(formData);
      if (res.ok) {
        showMsg("User created");
        setShowAdd(false);
      } else {
        showMsg("Error: " + (res.error || "unknown"), 5000);
      }
    });
  }

  function handleToggleRole(u: AdminUser) {
    const newRole = u.role === "admin" ? "editor" : "admin";
    start(async () => {
      const res = await updateAdminUser(u.id, { role: newRole });
      showMsg(res.ok ? `Role: ${newRole}` : "Error: " + res.error, 3000);
    });
  }

  function handleToggleActive(u: AdminUser) {
    start(async () => {
      const res = await updateAdminUser(u.id, { active: !u.active });
      showMsg(res.ok ? (u.active ? "Deactivated" : "Activated") : "Error: " + res.error, 3000);
    });
  }

  function handleRename(u: AdminUser, newName: string) {
    if (newName === u.name) return;
    start(async () => {
      const res = await updateAdminUser(u.id, { name: newName });
      showMsg(res.ok ? "Name updated" : "Error: " + res.error, 3000);
    });
  }

  function handleDelete(u: AdminUser) {
    if (!confirm(`Delete ${u.email}? This cannot be undone.`)) return;
    start(async () => {
      const res = await deleteAdminUser(u.id);
      showMsg(res.ok ? "User deleted" : "Error: " + res.error, 5000);
    });
  }

  function handleChangePassword(userId: string, newPw: string) {
    start(async () => {
      const res = await changeAdminUserPassword(userId, newPw);
      if (res.ok) {
        showMsg("Password updated");
        setPwModalUserId(null);
      } else {
        showMsg("Error: " + res.error, 5000);
      }
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex items-center gap-1.5 bg-[#E8705A] hover:bg-[#C95540] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors"
        >
          <UserPlus size={14} /> {showAdd ? "Cancel" : "Add User"}
        </button>
        {msg && <span className="text-xs text-[#6B6B6B]">{msg}</span>}
      </div>

      {/* Add form */}
      {showAdd && (
        <form
          action={handleAdd}
          className="bg-white border-2 border-dashed border-[#E8705A]/30 rounded-2xl p-5 mb-5 grid md:grid-cols-4 gap-3"
        >
          <div>
            <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Email</label>
            <input
              name="email"
              type="email"
              required
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E8705A] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Name</label>
            <input
              name="name"
              type="text"
              placeholder="Jane Doe"
              className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E8705A] outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Password (min 8)</label>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              placeholder="strong password"
              className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E8705A] outline-none font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#6B6B6B] mb-1">Role</label>
            <select
              name="role"
              defaultValue="editor"
              className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E8705A] outline-none"
            >
              <option value="editor">Editor (limited)</option>
              <option value="admin">Admin (full access)</option>
            </select>
          </div>
          <div className="md:col-span-4 flex items-center gap-2">
            <button
              type="submit"
              disabled={pending}
              className="inline-flex items-center gap-1.5 bg-[#E8705A] hover:bg-[#C95540] text-white text-sm font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-50"
            >
              <Save size={14} /> Create User
            </button>
            <button
              type="button"
              onClick={() => setShowAdd(false)}
              className="text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A]"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-white border border-[#E8E4DF] rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[#FAFAF8] border-b border-[#E8E4DF]">
            <tr>
              <th className="text-left px-5 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">User</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Role</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider hidden lg:table-cell">Last Login</th>
              <th className="text-right px-5 py-3 text-xs font-semibold text-[#6B6B6B] uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8E4DF]">
            {users.map((u) => {
              const isSelf = u.id === currentUserId;
              return (
                <tr key={u.id} className="hover:bg-[#FAFAF8]">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F9EBE8] rounded-full flex items-center justify-center text-xs font-bold text-[#E8705A]">
                        {(u.name || u.email)[0].toUpperCase()}
                      </div>
                      <div>
                        <input
                          defaultValue={u.name}
                          onBlur={(e) => handleRename(u, e.target.value.trim())}
                          placeholder="(no name)"
                          className="font-semibold text-sm text-[#1A1A1A] bg-transparent border-b border-transparent hover:border-[#E8E4DF] focus:border-[#E8705A] outline-none min-w-0 w-40"
                        />
                        <p className="text-xs text-[#6B6B6B]">{u.email}{isSelf && <span className="ml-2 text-[10px] bg-[#E8705A]/10 text-[#E8705A] px-1.5 py-0.5 rounded-full font-semibold">You</span>}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleRole(u)}
                      disabled={pending || isSelf}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full transition-colors ${
                        u.role === "admin"
                          ? "bg-[#F9EBE8] text-[#E8705A] hover:bg-[#E8705A]/20"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } ${isSelf ? "opacity-60 cursor-not-allowed" : ""}`}
                      title={isSelf ? "You cannot change your own role" : "Click to toggle role"}
                    >
                      <ShieldCheck size={10} /> {u.role}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(u)}
                      disabled={pending || isSelf}
                      className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full transition-colors ${
                        u.active
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      } ${isSelf ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      {u.active ? <><CheckCircle2 size={10} /> active</> : <><XCircle size={10} /> disabled</>}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#6B6B6B] hidden lg:table-cell">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "Never"}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setPwModalUserId(u.id)}
                        title="Change password"
                        className="w-7 h-7 rounded-lg bg-[#FAFAF8] hover:bg-[#E8E4DF] text-[#6B6B6B] flex items-center justify-center"
                      >
                        <Lock size={12} />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        disabled={isSelf || pending}
                        title={isSelf ? "You cannot delete yourself" : "Delete user"}
                        className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Password change modal */}
      {pwModalUserId && (
        <PasswordModal
          userEmail={users.find((u) => u.id === pwModalUserId)?.email || ""}
          onClose={() => setPwModalUserId(null)}
          onSave={(pw) => handleChangePassword(pwModalUserId, pw)}
          pending={pending}
        />
      )}
    </div>
  );
}

function PasswordModal({
  userEmail,
  onClose,
  onSave,
  pending,
}: {
  userEmail: string;
  onClose: () => void;
  onSave: (pw: string) => void;
  pending: boolean;
}) {
  const [pw, setPw] = useState("");
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-5" onClick={onClose}>
      <div
        className="bg-white border border-[#E8E4DF] rounded-2xl p-6 max-w-sm w-full shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-[#1A1A1A] inline-flex items-center gap-2">
            <Lock size={14} /> Change password
          </h2>
          <button onClick={onClose} className="text-[#6B6B6B] hover:text-[#1A1A1A]">
            <X size={14} />
          </button>
        </div>
        <p className="text-xs text-[#6B6B6B] mb-3">For <strong>{userEmail}</strong></p>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
          minLength={8}
          placeholder="New password (min 8 characters)"
          className="w-full px-3 py-2 border border-[#E8E4DF] rounded-xl text-sm focus:border-[#E8705A] outline-none font-mono"
        />
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => onSave(pw)}
            disabled={pending || pw.length < 8}
            className="inline-flex items-center gap-1.5 bg-[#E8705A] hover:bg-[#C95540] text-white text-xs font-bold px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            <Save size={12} /> Save
          </button>
          <button onClick={onClose} className="text-xs font-semibold text-[#6B6B6B] hover:text-[#1A1A1A]">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
