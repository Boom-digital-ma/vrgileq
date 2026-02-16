'use client'

import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  maxWidth?: string
}

export const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleEsc)
    }
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-900/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={cn(
        "relative w-full bg-white rounded-3xl shadow-2xl shadow-zinc-950/20 overflow-hidden animate-in zoom-in-95 fade-in duration-300",
        maxWidth
      )}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100">
          <h2 className="text-xl font-bold tracking-tight text-zinc-900">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-900"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </div>
    </div>
  )
}

interface ConfirmModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    variant?: 'danger' | 'primary'
}

export const ConfirmModal = ({ 
    isOpen, 
    onClose, 
    onConfirm, 
    title, 
    message, 
    confirmText = "Confirm", 
    variant = "primary" 
}: ConfirmModalProps) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-[2px]" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-xl animate-in zoom-in-95 duration-200">
                <h3 className="text-lg font-bold text-zinc-900 mb-2">{title}</h3>
                <p className="text-sm text-zinc-500 mb-6">{message}</p>
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-sm font-bold text-zinc-500 hover:bg-zinc-100 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={cn(
                            "flex-1 px-4 py-2 text-sm font-bold text-white rounded-xl transition-all shadow-lg",
                            variant === 'danger' ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200" : "bg-zinc-900 hover:bg-zinc-800 shadow-zinc-200"
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
