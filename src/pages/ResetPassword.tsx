import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage('Password updated successfully.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-soft">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold text-white">Reset password</div>
        </div>
        <form onSubmit={handleResetPassword} className="space-y-4">
          <label className="block text-sm text-slate-300">
            New password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" required />
          </label>
          {message ? <div className="text-sm text-sky-300">{message}</div> : null}
          <button type="submit" className="w-full rounded-xl bg-sky-500 px-4 py-2.5 font-medium text-slate-950">Update password</button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-400">
          <Link to="/login" className="text-sky-300">Go to login</Link>
        </div>
      </div>
    </div>
  );
}
