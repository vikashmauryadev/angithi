import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resetToken, setResetToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage('');
    setError('');
    setResetToken('');

    try {
      const result = await api('/auth/forgot-password', {
        method: 'POST',
        body: { email },
      });

      setMessage(result.message || 'Password reset request created.');

      // Development-only token.
      // Later we will replace this with email delivery.
      if (result.resetToken) {
        setResetToken(result.resetToken);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

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

      <h1>Forgot Password?</h1>

      <p>
        Enter your registered email address to create a password reset request.
      </p>

      <form onSubmit={handleSubmit} style={{ marginTop: 28 }}>
        <label
          htmlFor="email"
          style={{
            display: 'block',
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          Email Address
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{
            width: '100%',
            padding: '12px 14px',
            border: '1px solid #ddd',
            borderRadius: 10,
            fontSize: 16,
            boxSizing: 'border-box',
          }}
        />

        <button
          type="submit"
          className="btn"
          disabled={loading}
          style={{ marginTop: 16 }}
        >
          {loading ? 'Creating reset request...' : 'Reset Password'}
        </button>
      </form>

      {message && (
        <div
          style={{
            marginTop: 24,
            padding: 16,
            borderRadius: 12,
            background: '#eef8f0',
            border: '1px solid #c8e6cc',
          }}
        >
          <strong>{message}</strong>
        </div>
      )}

      {resetToken && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: 12,
            background: '#fff8e8',
            border: '1px solid #ead9a8',
            wordBreak: 'break-all',
          }}
        >
          <strong>Development Reset Token</strong>

          <p style={{ fontSize: 13 }}>
            This token is shown only for local testing. Later we will send the
            reset link by email.
          </p>

          <code>{resetToken}</code>
        </div>
      )}

      {error && (
        <p
          role="alert"
          style={{
            marginTop: 20,
            color: '#b42318',
          }}
        >
          {error}
        </p>
      )}

      <p style={{ marginTop: 28 }}>
        Remember your password? <Link to="/login">Back to Login</Link>
      </p>
    </main>
  );
}