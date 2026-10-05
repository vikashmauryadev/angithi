
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Auth() {
  const location = useLocation();
  const navigate = useNavigate();
  const isSignup = location.pathname === '/signup';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api(
        isSignup ? '/auth/signup' : '/auth/login',
        {
          method: 'POST',
          body: isSignup
            ? { name, email, password }
            : { email, password },
        }
      );

      localStorage.setItem('angithi_token', result.token);
      localStorage.setItem('angithi_user', JSON.stringify(result.user));
      window.dispatchEvent(new Event('angithi-auth-change'));

      navigate('/');
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="wrap" style={{ maxWidth: 460, paddingTop: 48, paddingBottom: 64 }}>
      <section
        style={{
          background: 'white',
          padding: 28,
          borderRadius: 16,
          border: '1px solid #e5e5e5',
        }}
      >
        <h1 style={{ marginTop: 0 }}>
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>

        <p>
          {isSignup
            ? 'Join Angithi to keep track of your orders.'
            : 'Log in to access your Angithi account.'}
        </p>

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="name">Full name</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={2}
                maxLength={80}
                autoComplete="name"
                required
                style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 12, marginTop: 6 }}
              />
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 12, marginTop: 6 }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={isSignup ? 8 : 1}
              maxLength={128}
              autoComplete={isSignup ? 'new-password' : 'current-password'}
              required
              style={{ display: 'block', width: '100%', boxSizing: 'border-box', padding: 12, marginTop: 6 }}
            />
            {isSignup && (
              <small>Use at least 8 characters.</small>
            )}
          </div>

          {error && (
            <p role="alert" style={{ color: '#b42318' }}>
              {error}
            </p>
          )}

          <button
            className="btn"
            type="submit"
            disabled={loading}
            style={{ width: '100%', marginTop: 8 }}
          >
            {loading
              ? 'Please wait...'
              : isSignup
                ? 'Create Account'
                : 'Log In'}
          </button>
          {!isSignup && (
            <div style={{ textAlign: 'right', marginTop: 10 }}>
              <Link to="/forgot-password">
                Forgot Password?
              </Link>
            </div>
          )}
        </form>

        <p style={{ marginBottom: 0, marginTop: 20 }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <Link to={isSignup ? '/login' : '/signup'}>
            {isSignup ? 'Log in' : 'Sign up'}
          </Link>
        </p>
      </section>
    </main>
  );
}