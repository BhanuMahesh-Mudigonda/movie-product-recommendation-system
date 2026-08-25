import React, { useState } from 'react';
import { motion } from 'framer-motion';
import EmailLoginForm from './EmailLoginForm';
import SignupForm from './SignupForm';

export default function AuthCard({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('email'); // 'email' | 'demo'
  const [activeView, setActiveView] = useState('login'); // 'login' | 'signup'

  return (
    <div className="auth-hud-wrapper">
      <motion.div 
        className="auth-hud-interface"
        initial={{ scale: 0.96, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hud-header">
          <span className="hud-welcome-tag">WELCOME BACK</span>
          <h2 className="hud-title">
            {activeView === 'login' ? (
              <>Enter <span className="text-movie">Movie</span><span className="text-mind">Mind</span></>
            ) : (
              'Create Account'
            )}
          </h2>
          <p className="hud-subtitle">Sign in to continue your cinematic journey.</p>
        </div>

        {/* TABS */}
        <div className="hud-tabs-row">
          <button 
            className={`hud-tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            Email
          </button>
          <button 
            className={`hud-tab ${activeTab === 'demo' ? 'active' : ''}`}
            onClick={() => setActiveTab('demo')}
          >
            Demo
          </button>
        </div>

        {activeView === 'login' ? (
          <EmailLoginForm onAuthSuccess={onAuthSuccess} />
        ) : (
          <SignupForm onAuthSuccess={onAuthSuccess} />
        )}

        {/* PROPERLY STYLED SECONDARY ACTION (NO PLAIN WHITE BUTTON) */}
        <div className="auth-footer">
          {activeView === 'login' ? (
            <div className="signup-prompt-row">
              <span className="prompt-label">New to MovieMind?</span>
              <button type="button" className="cinematic-secondary-btn" onClick={() => setActiveView('signup')}>
                CREATE ACCOUNT &rarr;
              </button>
            </div>
          ) : (
            <div className="signup-prompt-row">
              <span className="prompt-label">Already have an account?</span>
              <button type="button" className="cinematic-secondary-btn" onClick={() => setActiveView('login')}>
                SIGN IN &rarr;
              </button>
            </div>
          )}
        </div>

        <div className="hud-privacy-line">
          <span className="privacy-dot"></span>
          <span>Your data is encrypted and secured. MovieMind respects your privacy.</span>
        </div>
      </motion.div>
    </div>
  );
}
