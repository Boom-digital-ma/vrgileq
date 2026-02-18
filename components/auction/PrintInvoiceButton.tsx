'use client'

import { Printer } from 'lucide-react'

export default function PrintInvoiceButton() {
  return (
    <button 
      onClick={() => window.print()}
      className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
    >
      <Printer size={18} />
      Print Invoice
    </button>
  )
}
