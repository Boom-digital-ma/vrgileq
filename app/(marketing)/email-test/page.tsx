'use client';

import { useState } from 'react';
import { Loader2, Mail, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { testEmailAction } from './actions';

export default function EmailTestPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const res = await testEmailAction(email);
      setResult(res);
      if (res.success) toast.success('Email dispatched!');
      else toast.error('Failed to dispatch');
    } catch (err: any) {
      setResult({ success: false, error: err.message });
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-zinc-100">
        <div className="flex items-center gap-3 mb-6 text-primary">
          <div className="bg-primary/10 p-3 rounded-xl">
            <Mail size={24} />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-widest">Email System Diagnostic</h1>
        </div>

        <p className="text-zinc-500 text-sm mb-8">
          Send a test "Outbid Alert" email to verify your Resend configuration.
          <br/><span className="text-xs italic opacity-70">(Check server logs for detailed API response)</span>
        </p>

        <form onSubmit={handleTest} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-zinc-400 ml-2">Target Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 outline-none focus:border-primary transition-all font-medium text-secondary"
              placeholder="you@example.com"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-secondary text-white py-4 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-primary transition-all flex justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : 'Dispatch Test Email'}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-xl text-xs font-mono break-all border ${result.success ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
            <div className="flex items-center gap-2 mb-2 font-bold uppercase tracking-widest">
              {result.success ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              {result.success ? 'Success' : 'Failure'}
            </div>
            {JSON.stringify(result, null, 2)}
          </div>
        )}
      </div>
    </div>
  );
}
