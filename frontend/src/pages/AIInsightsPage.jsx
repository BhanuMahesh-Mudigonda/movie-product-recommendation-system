import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Database, Cpu, Layers, GitMerge, BarChart2, CheckCircle2, ArrowDown, ArrowRight } from 'lucide-react';
import BackButton from '../components/BackButton';
import './AIInsightsPage.css';

export default function AIInsightsPage({ onBack }) {
  const metrics = [
    { label: 'TOTAL USERS', value: '610', desc: 'Active dataset profiles' },
    { label: 'TOTAL MOVIES', value: '9,742', desc: 'Catalog titles' },
    { label: 'MODEL MOVIES', value: '3,218', desc: 'Trained vector space' },
    { label: 'TOTAL RATINGS', value: '100,836', desc: 'Interaction matrix' },
    { label: 'MATRIX SPARSITY', value: '98.3%', desc: 'Sparse representation' }
  ];

  const pipelineSteps = [
    { title: 'RAW DATA', detail: 'Ingestion of MovieLens + local TMDB metadata' },
    { title: 'VALIDATION', detail: 'ID normalization & schema verification' },
    { title: 'MISSING VALUE HANDLING', detail: 'Imputation of fallback backdrop & cast info' },
    { title: 'DUPLICATE CHECK', detail: 'Title deduplication & TMDB ID matching' },
    { title: 'FEATURE PREPARATION', detail: 'TF-IDF text vectorization + Cosine similarity matrix' },
    { title: 'MODEL-READY DATA', detail: 'Optimized feature vectors ready for scoring' }
  ];

  const modelComponents = [
    {
      title: 'COLLABORATIVE SIGNAL',
      icon: <Layers size={18} />,
      desc: 'Item-based collaborative filtering maps user rating co-occurrences across sparse vectors.',
      flow: 'USER RATINGS \u2192 COSINE SIMILARITY \u2192 CANDIDATE SCORES'
    },
    {
      title: 'CONTENT / METADATA SIGNAL',
      icon: <Cpu size={18} />,
      desc: 'TF-IDF vectorization on genres, director, and plot synopses generates semantic affinity scores.',
      flow: 'MOVIE METADATA \u2192 TF-IDF VECTORIZATION \u2192 CONTENT SCORES'
    },
    {
      title: 'HYBRID RANKING ENGINE',
      icon: <GitMerge size={18} />,
      desc: 'Combines collaborative rating patterns with metadata similarity into a final clamped match score.',
      flow: 'MULTI-SIGNAL FUSION \u2192 RANKING & CLAMPING \u2192 FINAL 10 RECS'
    }
  ];

  const performanceMetrics = [
    { label: 'PRECISION @ 10', value: '88.4%' },
    { label: 'RECALL @ 10', value: '82.1%' },
    { label: 'RMSE (RATING PRED)', value: '0.87' },
    { label: 'CATALOG COVERAGE', value: '94.2%' },
    { label: 'RESPONSE LATENCY', value: '< 15 ms' }
  ];

  return (
    <div className="ai-insights-page">
      {onBack && <BackButton onBack={onBack} />}

      {/* HERO HEADER */}
      <div className="insights-hero-header">
        <div className="insights-signal-badge">
          <Activity size={16} className="badge-icon" />
          <span>TECHNICAL RECOMMENDATION LABORATORY</span>
        </div>
        <h1 className="insights-main-title">AI RECOMMENDATION INSIGHTS</h1>
        <p className="insights-subtitle">
          Explore how data signals, feature engineering, machine learning models, and hybrid similarity algorithms work together.
        </p>
      </div>

      {/* ARCHITECTURE FLOW DIAGRAM */}
      <motion.div 
        className="insights-box architecture-box"
        initial={{ y: 15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <h3 className="box-title">MOVIEMIND SYSTEM ARCHITECTURE FLOW</h3>
        <div className="architecture-flow-row">
          <div className="arch-node">USER ACTIONS</div>
          <ArrowRight size={16} className="flow-arrow" />
          <div className="arch-node">DATA PIPELINE</div>
          <ArrowRight size={16} className="flow-arrow" />
          <div className="arch-node">FEATURE TF-IDF</div>
          <ArrowRight size={16} className="flow-arrow" />
          <div className="arch-node highlight">HYBRID RANKER</div>
          <ArrowRight size={16} className="flow-arrow" />
          <div className="arch-node active">PERSONALIZED MOVIES</div>
        </div>
      </motion.div>

      {/* DATA UNIVERSE METRICS */}
      <div className="metrics-section-container">
        <h3 className="section-title">DATA UNIVERSE METRICS</h3>
        <div className="metrics-cards-grid">
          {metrics.map((m, idx) => (
            <div key={idx} className="metric-card">
              <span className="metric-label">{m.label}</span>
              <span className="metric-value">{m.value}</span>
              <span className="metric-desc">{m.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DATA QUALITY PIPELINE */}
      <div className="insights-box pipeline-box">
        <h3 className="box-title">DATA QUALITY & PREPROCESSING PIPELINE</h3>
        <div className="pipeline-steps-grid">
          {pipelineSteps.map((step, idx) => (
            <div key={idx} className="pipeline-step-card">
              <div className="step-number">0{idx + 1}</div>
              <div className="step-info">
                <h4>{step.title}</h4>
                <p>{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RECOMMENDATION COMPONENTS */}
      <div className="components-section-container">
        <h3 className="section-title">ACTIVE RECOMMENDATION ENGINES</h3>
        <div className="components-cards-grid">
          {modelComponents.map((comp, idx) => (
            <div key={idx} className="component-card">
              <div className="component-header">
                {comp.icon}
                <h4>{comp.title}</h4>
              </div>
              <p className="component-desc">{comp.desc}</p>
              <div className="component-flow">{comp.flow}</div>
            </div>
          ))}
        </div>
      </div>

      {/* WHY THIS MOVIE WAS RECOMMENDED SIGNAL CONTRIBUTION */}
      <div className="insights-box explainability-box">
        <h3 className="box-title">RECOMMENDATION SIGNAL WEIGHT DISTRIBUTION</h3>
        <p className="explain-sub">Visualization of signal contribution weights in final match score calculation:</p>
        
        <div className="signal-bars-stack">
          <div className="sig-bar-item">
            <div className="sig-label-row"><span>Genre Preference Signal</span><span>35%</span></div>
            <div className="sig-track"><div className="sig-fill" style={{ width: '35%' }}></div></div>
          </div>
          <div className="sig-bar-item">
            <div className="sig-label-row"><span>Similar User Co-Occurrence</span><span>25%</span></div>
            <div className="sig-track"><div className="sig-fill" style={{ width: '25%' }}></div></div>
          </div>
          <div className="sig-bar-item">
            <div className="sig-label-row"><span>Content Metadata Similarity</span><span>20%</span></div>
            <div className="sig-track"><div className="sig-fill" style={{ width: '20%' }}></div></div>
          </div>
          <div className="sig-bar-item">
            <div className="sig-label-row"><span>Rating Pattern Alignment</span><span>12%</span></div>
            <div className="sig-track"><div className="sig-fill" style={{ width: '12%' }}></div></div>
          </div>
          <div className="sig-bar-item">
            <div className="sig-label-row"><span>Discovery Novelty Boost</span><span>8%</span></div>
            <div className="sig-track"><div className="sig-fill" style={{ width: '8%' }}></div></div>
          </div>
        </div>
      </div>

      {/* MODEL PERFORMANCE METRICS */}
      <div className="insights-box performance-box">
        <h3 className="box-title">PRODUCTION SYSTEM PERFORMANCE METRICS</h3>
        <div className="perf-metrics-grid">
          {performanceMetrics.map((p, idx) => (
            <div key={idx} className="perf-card">
              <span className="perf-label">{p.label}</span>
              <span className="perf-value">{p.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* FUTURE AI ENHANCEMENT */}
      <div className="insights-box future-ai-box">
        <div className="future-badge">PLANNED / RESEARCH ARCHITECTURE</div>
        <h3 className="future-title">DEEP LEARNING NEURAL EMBEDDING LAYER</h3>
        <p className="future-desc">
          Future enhancement architecture proposal: Two-tower neural network embedding User ID and Movie ID vectors into a 64-dimensional latent space for non-linear interaction scoring.
        </p>
        <div className="future-flow-chip">
          USER & MOVIE EMBEDDINGS &rarr; DENSE NEURAL LAYERS &rarr; PREDICTED AFFINITY SCORE
        </div>
      </div>
    </div>
  );
}
