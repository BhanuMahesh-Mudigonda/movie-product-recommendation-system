import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordField({ value, onChange, placeholder = "Password", name = "password", error }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-group">
      <label>{placeholder}</label>
      <div className="input-wrapper">
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className={`auth-input ${error ? 'error' : ''}`}
          placeholder={`Enter your ${placeholder.toLowerCase()}`}
        />
        <button
          type="button"
          className="password-toggle"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}
