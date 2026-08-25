import React from 'react';
import { motion } from 'framer-motion';
import { Dna, User, Sparkles, ShieldCheck, Flame, Compass, Heart, Film, ArrowRight } from 'lucide-react';
import BackButton from '../components/BackButton';
import './TasteProfilePage.css';

export default function TasteProfilePage({ onBack }) {
  const topGenres = [
    { name: 'Action', percent: 94, class: 'action' },
    { name: 'Drama', percent: 88, class: 'drama' },
    { name: 'Adventure', percent: 82, class: 'adventure' },
    { name: 'Thriller', percent: 74, class: 'thriller' },
    { name: 'Crime', percent: 68, class: 'crime' }
  ];

  const storyPreferences = [
    { title: 'Epic World Building', score: '96%' },
    { title: 'Emotional Storytelling', score: '92%' },
    { title: 'Strong Character Arcs', score: '88%' },
    { title: 'High Visual Spectacle', score: '85%' },
    { title: 'Historical / Period Narratives', score: '79%' }
  ];

  const viewingSignals = [
    { label: 'MOST WATCHED GENRE', value: 'Action & Drama', icon: <Flame size={16} /> },
    { label: 'EMOTIONAL PREFERENCE', value: 'High Intensity', icon: <Sparkles size={16} /> },
    { label: 'STORY STYLE', value: 'Character Driven', icon: <Film size={16} /> },
    { label: 'DISCOVERY STYLE', value: 'Familiar + New Balance', icon: <Compass size={16} /> },
    { label: 'CINEMATIC ERA', value: 'Modern + Classic Mix', icon: <Dna size={16} /> }
  ];

  const evolutionSteps = [
    { stage: 'EARLY PREFERENCE', detail: 'Exploration of blockbusters & popular Telugu cinema' },
    { stage: 'GENRE EXPLORATION', detail: 'High engagement with action thrillers & period dramas' },
    { stage: 'STRONG STORY PATTERNS', detail: 'Preference for high-stakes narratives & world-building' },
    { stage: 'CURRENT CINEMATIC DNA', detail: 'The Epic Story Seeker profile established with 96% AI confidence' }
  ];

  return (
    <div className="taste-profile-page">
      {onBack && <BackButton onBack={onBack} />}

      {/* HERO TITLE AREA */}
      <div className="profile-hero-header">
        <div className="profile-signal-badge">
          <Dna size={16} className="badge-dna-icon" />
          <span>PERSONAL TASTE INTELLIGENCE</span>
        </div>
        <h1 className="profile-main-title">MY CINEMATIC DNA</h1>
        <p className="profile-subtitle">
          Understand the recurring patterns, story signals, and emotional preferences behind what you love to watch.
        </p>
      </div>

      {/* MAIN PROFILE CARD */}
      <motion.div 
        className="central-profile-card"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <div className="profile-card-left">
          <div className="user-avatar-large">
            <span>D</span>
          </div>
          <div className="profile-identity">
            <span className="profile-tag">YOUR AI CINEMATIC PERSONALITY</span>
            <h2 className="profile-personality-title">THE EPIC STORY SEEKER</h2>
            <p className="profile-user-email">demo@moviemind.ai &bull; Demo User</p>
          </div>
        </div>

        <div className="profile-card-right">
          <div className="ai-confidence-chip">
            <ShieldCheck size={16} />
            <span>96% AI CONFIDENCE</span>
          </div>
          <p className="profile-explanation-quote">
            &ldquo;Your viewing patterns suggest a strong preference for emotionally intense stories, large-scale cinematic worlds, character-driven narratives, and high visual spectacle.&rdquo;
          </p>
        </div>
      </motion.div>

      {/* TOP GENRES & STORY PREFERENCES */}
      <div className="profile-grid-two">
        {/* TOP GENRES */}
        <div className="profile-box">
          <h3 className="box-title">TOP GENRE ALIGNMENT</h3>
          <div className="genres-bars-list">
            {topGenres.map((g, idx) => (
              <div key={idx} className="genre-bar-row">
                <div className="genre-label-row">
                  <span className="genre-name">{g.name}</span>
                  <span className="genre-percent">{g.percent}%</span>
                </div>
                <div className="genre-track">
                  <div 
                    className={`genre-fill ${g.class}`} 
                    style={{ width: `${g.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STORY PREFERENCE RADAR */}
        <div className="profile-box">
          <h3 className="box-title">YOUR STORY PREFERENCES</h3>
          <div className="story-pref-list">
            {storyPreferences.map((pref, idx) => (
              <div key={idx} className="story-pref-item">
                <span className="pref-bullet"></span>
                <span className="pref-title">{pref.title}</span>
                <span className="pref-score">{pref.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* YOUR VIEWING SIGNALS */}
      <div className="signals-section-container">
        <h3 className="section-title">YOUR VIEWING SIGNALS</h3>
        <div className="signals-cards-grid">
          {viewingSignals.map((sig, idx) => (
            <div key={idx} className="signal-card">
              <div className="signal-card-header">
                {sig.icon}
                <span className="signal-card-label">{sig.label}</span>
              </div>
              <div className="signal-card-value">{sig.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* TASTE EVOLUTION TIMELINE */}
      <div className="profile-box evolution-box">
        <h3 className="box-title">TASTE EVOLUTION TIMELINE</h3>
        <div className="evolution-timeline">
          {evolutionSteps.map((step, idx) => (
            <div key={idx} className="timeline-node">
              <div className="node-dot"></div>
              <div className="node-content">
                <span className="node-stage">{step.stage}</span>
                <p className="node-detail">{step.detail}</p>
              </div>
              {idx < evolutionSteps.length - 1 && <ArrowRight size={16} className="node-arrow" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
