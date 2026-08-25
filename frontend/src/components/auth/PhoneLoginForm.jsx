import React, { useState } from 'react';
import PasswordField from './PasswordField';
import { useAuth } from '../../context/AuthContext';

export default function PhoneLoginForm({ onAuthSuccess }) {
  const { loginPhone } = useAuth();
  const [formData, setFormData] = useState({ phone: '', password: '', rememberMe: false });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validate = () => {
    const newErrors = {};
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (formData.phone.replace(/[^0-9]/g, '').length < 7) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const fillDemoAccount = () => {
    setFormData({
      phone: '+91 9876543210',
      password: 'MovieMind@123',
      rememberMe: true
    });
    setErrors({});
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await loginPhone(formData.phone, formData.password);
      onAuthSuccess?.(); // Transition to app
    } catch (err) {
      setApiError('Incorrect email/phone number or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    if (apiError) setApiError('');
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {apiError && (
        <div className="error-message" style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          color: '#f87171',
          padding: '12px 16px',
          borderRadius: '8px',
          fontSize: '0.9rem',
          textAlign: 'center',
          marginBottom: '16px'
        }}>
          {apiError}
        </div>
      )}

      {/* DEMO ACCOUNT BOX */}
      <div style={{
        background: 'rgba(139, 92, 246, 0.1)',
        border: '1px solid rgba(139, 92, 246, 0.3)',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '0.85rem', color: '#c4b5fd' }}>
          <strong style={{ display: 'block', color: '#ffffff' }}>Demo Phone Account</strong>
          <span>+91 9876543210</span>
        </div>
        <button
          type="button"
          onClick={fillDemoAccount}
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 14px',
            fontSize: '0.8rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          Use Demo Phone
        </button>
      </div>

      <div className="form-group">
        <label>Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className={`auth-input ${errors.phone ? 'error' : ''}`}
          placeholder="+91 9876543210"
          autoComplete="tel"
          disabled={isSubmitting}
        />
        {errors.phone && <span className="error-message">{errors.phone}</span>}
      </div>

      <PasswordField 
        value={formData.password}
        onChange={handleChange}
        error={errors.password}
        disabled={isSubmitting}
      />

      <div className="form-options">
        <label className="remember-me">
          <input 
            type="checkbox" 
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            disabled={isSubmitting}
          />
          <span>Remember me</span>
        </label>
      </div>

      <button type="submit" className="submit-btn" disabled={isSubmitting}>
        {isSubmitting ? 'Signing in...' : 'SIGN IN \u2192'}
      </button>
    </form>
  );
}
