import React from 'react';
import { ArrowLeft } from 'lucide-react';
import './BackButton.css';

export default function BackButton({ onBack, label = 'Back' }) {
  if (!onBack) return null;

  return (
    <button className="app-back-btn" onClick={onBack} title="Go to previous view">
      <ArrowLeft size={18} />
      <span>{label}</span>
    </button>
  );
}
