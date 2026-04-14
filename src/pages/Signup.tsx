import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import nexolLogo from '@/assets/nexolpay-logo.png';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    const { error } = await signUp(email, password);
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="nexol-card p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-foreground mb-2">Check Your Email</h2>
          <p className="text-muted-foreground text-sm mb-6">
            We've sent a verification link to <strong className="text-foreground">{email}</strong>. Click the link to activate your account.
          </p>
          <button onClick={() => navigate('/login')} className="nexol-btn-primary w-full">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <img src={nexolLogo} alt="NexolPay" className="h-16 w-16 rounded-2xl mb-4" />
          <h1 className="text-2xl font-bold text-foreground">NexolPay</h1>
          <p className="text-muted-foreground text-sm mt-1">Create your account</p>
        </div>

        <form onSubmit={handleRegister} className="nexol-card p-8 space-y-5">
          {error && <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="nexol-input" placeholder="you@example.com" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="nexol-input" placeholder="••••••••" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="nexol-input" placeholder="••••••••" required />
          </div>
          <button type="submit" disabled={loading} className="nexol-btn-primary w-full disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}