import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function ResetPassword() {
  const navigate = useNavigate();

  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();

    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const result = await api('/auth/reset-password', {
        method: 'POST',
        body: {
          token,
          password,
        },
      });

      setMessage(
        result.message || 'Password reset successfully.'
      );

      setToken('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(
        err.message || 'Unable to reset password.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="wrap"
      style={{
        maxWidth: 500,
        paddingTop: 70,
        paddingBottom: 80,
      }}
    >
      <p style={{ color: '#a04b24', fontWeight: 600 }}>
        ACCOUNT SECURITY
      </p>

      <h1>Reset Password</h1>

      <p>
        Enter your reset token and choose a new password.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 28 }}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="token">Reset Token</label>

          <textarea
            id="token"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your reset token"
            required
            rows={4}
            style={{
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              padding: 12,
              marginTop: 6,
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password">New Password</label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            required
            style={{
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              padding: 12,
              marginTop: 6,
            }}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="confirmPassword">
            Confirm New Password
          </label>

          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            placeholder="Confirm new password"
            minLength={8}
            maxLength={128}
            autoComplete="new-password"
            required
            style={{
              display: 'block',
              width: '100%',
              boxSizing: 'border-box',
              padding: 12,
              marginTop: 6,
            }}
          />
        </div>

        {error && (
          <p role="alert" style={{ color: '#b42318' }}>
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            style={{
              color: '#217a3a',
              fontWeight: 600,
            }}
          >
            {message}
          </p>
        )}

        <button
          className="btn"
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            marginTop: 8,
          }}
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>

      <p style={{ marginTop: 24 }}>
        Remember your password?{' '}
        <Link to="/login">Back to Login</Link>
      </p>
    </main>
  );
}