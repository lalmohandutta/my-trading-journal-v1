import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    const { error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setError(signUpError.message);
      return;
    }
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-navy-900 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-soft">
        <div className="mb-6 text-center">
          <div className="text-2xl font-semibold text-white">Create account</div>
        </div>
        <form onSubmit={handleRegister} className="space-y-4">
          <label className="block text-sm text-slate-300">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" required />
          </label>
          <label className="block text-sm text-slate-300">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 text-white" required />
          </label>
          {error ? <div className="text-sm text-red-400">{error}</div> : null}
          <button type="submit" className="w-full rounded-xl bg-sky-500 px-4 py-2.5 font-medium text-slate-950">Register</button>
        </form>
        <div className="mt-4 text-center text-sm text-slate-400">
          Already have an account? <Link to="/login" className="text-sky-300">Login</Link>
        </div>
      </div>
    </div>
  );
}
