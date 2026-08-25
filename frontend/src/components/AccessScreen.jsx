import React from 'react';
import AuthLayout from './auth/AuthLayout';

export default function AccessScreen({ onAuthSuccess }) {
  return <AuthLayout onAuthSuccess={onAuthSuccess} />;
}
