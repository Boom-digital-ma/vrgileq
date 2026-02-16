'use client'

import { useForm, useNavigation } from "@refinedev/core"
import { ArrowLeft, Loader2, Save, UserPlus, Shield } from "lucide-react"
import Link from "next/link"

export const UserCreate = () => {
  const { onFinish, formLoading } = useForm({
    resource: "profiles",
    redirect: "list",
  })

  const { list } = useNavigation()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const data = Object.fromEntries(formData.entries())
    onFinish(data)
  }

  const inputClasses = "w-full h-11 bg-zinc-50 border border-zinc-200 rounded-xl px-4 text-sm outline-none focus:bg-white focus:ring-4 focus:ring-zinc-900/5 focus:border-zinc-900 transition-all font-medium"
  const labelClasses = "text-[13px] font-semibold text-zinc-700 ml-1"

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
            <button onClick={() => list("profiles")} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <ArrowLeft size={20} />
            </button>
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Provision New User</h1>
                <p className="text-sm text-zinc-500">Add an administrator or moderator to the system.</p>
            </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className={labelClasses}>Full Identity Name</label>
                <input name="full_name" required className={inputClasses} placeholder="e.g. John Doe" />
            </div>
            <div className="space-y-2">
                <label className={labelClasses}>Access Role</label>
                <select name="role" required className={inputClasses}>
                    <option value="client">Client (Default)</option>
                    <option value="moderator">Moderator</option>
                    <option value="admin">Administrator</option>
                </select>
            </div>
          </div>

          <div className="space-y-2 text-zinc-500 bg-zinc-50 p-4 rounded-xl border border-zinc-100 italic text-[11px] leading-relaxed">
            <div className="flex gap-2">
                <Shield size={14} className="shrink-0 text-zinc-400" />
                <p>
                    <strong>Security Notice:</strong> Manually provisioning a user creates their platform profile. 
                    The user must still complete the authentication process with the corresponding email to access the system.
                </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button 
                disabled={formLoading}
                className="bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
            >
                {formLoading ? <Loader2 size={18} className="animate-spin" /> : <><Save size={18} /> Provision User</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
