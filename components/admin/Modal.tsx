'use client'

import React, { useEffect } from 'react'
import { X, AlertTriangle, CheckCircle2 } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 italic">
      <div 
        className="absolute inset-0 bg-secondary/40 backdrop-blur-md animate-in fade-in duration-500" 
        onClick={onClose}
      />
      
      <div className={cn(
        "relative w-full bg-white rounded-[40px] shadow-2xl shadow-secondary/20 overflow-hidden animate-in zoom-in-95 fade-in duration-500 border border-zinc-100",
        maxWidth
      )}>
        <div className="flex items-center justify-between px-10 py-8 border-b border-zinc-50 bg-zinc-50/30">
          <h2 className="text-2xl font-bold tracking-tight text-secondary font-display uppercase">{title}</h2>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-white rounded-full transition-all text-zinc-300 hover:text-secondary shadow-sm hover:shadow-md border border-transparent hover:border-zinc-100"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto max-h-[85vh]">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 italic">
            <div className="absolute inset-0 bg-secondary/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={onClose} />
            <div className="relative w-full max-w-sm bg-white rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 border border-zinc-100">
                <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center mb-6 shadow-sm border",
                    variant === 'danger' ? "bg-rose-50 text-rose-500 border-rose-100" : "bg-primary/10 text-primary border-primary/10"
                )}>
                    {variant === 'danger' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
                </div>
                
                <h3 className="text-xl font-bold text-secondary font-display uppercase mb-2">{title}</h3>
                <p className="text-[11px] font-medium text-zinc-400 uppercase leading-relaxed mb-8">{message}</p>
                
                <div className="flex gap-3">
                    <button 
                        onClick={onClose}
                        className="flex-1 px-6 py-3.5 text-[10px] font-bold text-zinc-400 hover:text-secondary bg-zinc-50 rounded-xl transition-all uppercase tracking-widest"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={() => {
                            onConfirm()
                            onClose()
                        }}
                        className={cn(
                            "flex-1 px-6 py-3.5 text-[10px] font-bold text-white rounded-xl transition-all shadow-xl uppercase tracking-widest active:scale-95",
                            variant === 'danger' ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/20" : "bg-secondary hover:bg-primary shadow-secondary/20"
                        )}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
