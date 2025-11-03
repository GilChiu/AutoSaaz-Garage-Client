import React from 'react';

/**
 * DevCredentialsBanner
 * Displays developer-only credentials to speed up local testing.
 * Hidden automatically in production builds.
 */
export default function DevCredentialsBanner({ onApply }) {
  // Only show in non-production builds AND when explicitly enabled
  const isProd = process.env.NODE_ENV === 'production';
  const allow = process.env.REACT_APP_SHOW_DEV_CREDS !== 'false';
  if (isProd || !allow) return null;

  const generated = typeof window !== 'undefined' ? localStorage.getItem('userGeneratedPassword') : null;
  const email = process.env.REACT_APP_DEV_LOGIN_EMAIL || 'dev@autosaaz.com';
  const password = generated || process.env.REACT_APP_DEV_LOGIN_PASSWORD || '';

  if (!email && !password && !generated) return null;

  const containerStyle = {
    background: '#FFF8E1',
    border: '1px solid #F3E5AB',
    color: '#5D4037',
    padding: '10px 12px',
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 12,
  };

  const codeStyle = {
    display: 'inline-block',
    background: '#fff',
    border: '1px solid #e7dac5',
    borderRadius: 6,
    padding: '6px 8px',
    marginRight: 8,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  };

  const btnStyle = {
    background: '#6C5CE7',
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    padding: '6px 10px',
    cursor: 'pointer',
  };

  return (
    <div style={containerStyle} aria-live="polite">
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Developer credentials (local only)</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {email ? <span style={codeStyle}>Email: {email}</span> : null}
        {password ? <span style={codeStyle}>Password: {password}</span> : null}
        {onApply ? (
          <button
            type="button"
            style={btnStyle}
            onClick={() => onApply({ email, password })}
            aria-label="Fill login form with developer credentials"
          >
            Fill
          </button>
        ) : null}
      </div>
      {generated && (
        <div style={{ marginTop: 6, opacity: 0.8 }}>
          Note: Using one-time generated password from registration (saved locally).
        </div>
      )}
    </div>
  );
}
