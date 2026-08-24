import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Database, ShieldCheck, PieChart as PieChartIcon, BrainCircuit, Network, Route, ChevronRight, Activity
} from 'lucide-react';
import './Insights.css';

export default function Insights() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="insights-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!data) {
    return <div className="insights-error">Failed to load movie intelligence data.</div>;
  }

  const COLORS = ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#ffe4e6'];
  const RATING_COLORS = ['#fbbf24', '#f59e0b', '#d97706', '#b45309', '#78350f'];

  return (
    <div className="insights-page">
      
      <header className="insights-hero">
        <div className="hero-glow"></div>
        <h1 className="cinematic-title">MovieMind Intelligence Lab</h1>
        <p className="cinematic-subtitle">Explore the data, architecture, and AI behind your recommendations.</p>
      </header>

      {/* 01 DATASET UNIVERSE */}
      <section className="insight-section">
        <div className="section-header">
          <span className="section-number">01</span>
          <h2><Database size={24} /> Dataset Universe</h2>
        </div>
        <p className="section-description">The scale of information powering the MovieMind recommendation engine.</p>
        
        <div className="stats-grid">
          {Object.entries(data.stats).map(([key, value]) => (
            <div key={key} className="stat-card">
              <div className="stat-card-inner">
                <h3>{key}</h3>
                <div className="stat-value">{value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 02 DATA QUALITY */}
      <section className="insight-section">
        <div className="section-header">
          <span className="section-number">02</span>
          <h2><ShieldCheck size={24} /> Data Quality & Preparation</h2>
        </div>
        <p className="section-description">How raw metadata is transformed into an AI-ready intelligence matrix.</p>
        
        <div className="timeline-container">
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>Raw Data Ingestion</h4>
              <p>Imported MovieLens 25M dataset & external TMDb/OMDb metadata.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>Missing Value Analysis</h4>
              <p>Removed entries with missing titles or unresolvable IMDB IDs.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>Duplicate Detection</h4>
              <p>Resolved duplicate movie entries across different metadata sources using fuzzy matching.</p>
            </div>
          </div>
          <div className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <h4>Feature Vectorization</h4>
              <p>Transformed genres, tags, and user ratings into numerical matrices for model consumption.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 03 DATA VISUALIZATION */}
      <section className="insight-section">
        <div className="section-header">
          <span className="section-number">03</span>
          <h2><PieChartIcon size={24} /> Data Visualization</h2>
        </div>
        <p className="section-description">Discover patterns hidden within the global movie catalogue.</p>
        
        <div className="charts-grid">
          
          {/* Genre Distribution */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Top Genre Distribution</h3>
              <span className="chart-badge">Dynamic</span>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={data.charts.top_genres}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.charts.top_genres.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-insight">
              <strong>Insight:</strong> The catalogue is concentrated around the most dominant genres, providing a strong signal for content-based similarities.
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="chart-card">
            <div className="chart-header">
              <h3>Global Rating Distribution</h3>
              <span className="chart-badge">Dynamic</span>
            </div>
            <div className="chart-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data.charts.rating_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" fill="var(--accent-red)" radius={[4, 4, 0, 0]}>
                    {data.charts.rating_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={RATING_COLORS[index % RATING_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-insight">
              <strong>Why It Matters:</strong> Ratings are heavily skewed towards positive scores, requiring our models to normalize biases before generating recommendations.
            </div>
          </div>

        </div>
      </section>

      {/* 04 FEATURE INTELLIGENCE */}
      <section className="insight-section">
        <div className="section-header">
          <span className="section-number">04</span>
          <h2><BrainCircuit size={24} /> Feature Intelligence</h2>
        </div>
        <p className="section-description">What does MovieMind actually understand about a movie?</p>
        
        <div className="feature-map">
          <div className="fm-core">MOVIE VECTOR</div>
          
          <div className="fm-branch left">
            <div className="fm-node title">CONTENT FEATURES</div>
            <div className="fm-leaf">Genres</div>
            <div className="fm-leaf">Keywords / Tags</div>
            <div className="fm-leaf">Release Year</div>
          </div>
          
          <div className="fm-branch right">
            <div className="fm-node title">BEHAVIORAL FEATURES</div>
            <div className="fm-leaf">User Ratings</div>
            <div className="fm-leaf">Interaction Frequency</div>
            <div className="fm-leaf">Latent Matrix Factors</div>
          </div>
        </div>
      </section>

      {/* 05 RECOMMENDATION ARCHITECTURE */}
      <section className="insight-section">
        <div className="section-header">
          <span className="section-number">05</span>
          <h2><Network size={24} /> Recommendation Architecture</h2>
        </div>
        <p className="section-description">The dual-engine hybrid architecture powering personalized discovery.</p>
        
        <div className="architecture-flow">
          <div className="arch-card source">USER & MOVIE DATA</div>
          <div className="arch-arrows">
            <span className="arch-arrow">↓</span>
            <span className="arch-arrow">↓</span>
          </div>
          <div className="arch-split">
            <div className="arch-card engine">
              <h4>Collaborative Filtering</h4>
              <p>Item-KNN Similarity</p>
            </div>
            <div className="arch-card engine">
              <h4>Matrix Factorization</h4>
              <p>SVD Latent Factors</p>
            </div>
          </div>
          <div className="arch-arrows center">
            <span className="arch-arrow">↘</span>
            <span className="arch-arrow">↙</span>
          </div>
          <div className="arch-card hybrid">
            <h4>HYBRID COMBINATION ENGINE</h4>
            <p>Score Weighting & Normalization</p>
          </div>
          <div className="arch-arrow down">↓</div>
          <div className="arch-card output">FINAL RANKED RECOMMENDATIONS</div>
        </div>
      </section>

      {/* 06 HOW RECOMMENDATIONS WORK */}
      <section className="insight-section">
        <div className="section-header">
          <span className="section-number">06</span>
          <h2><Route size={24} /> How Recommendations Work</h2>
        </div>
        
        <div className="step-flow">
          <div className="step-card">
            <div className="step-icon"><Activity size={20}/></div>
            <h4>1. User Context</h4>
            <p>The system reads your interaction history or currently viewed movie.</p>
          </div>
          <ChevronRight className="step-divider" size={24} />
          <div className="step-card">
            <div className="step-icon"><Network size={20}/></div>
            <h4>2. Vector Search</h4>
            <p>Pre-computed latent vectors are compared using cosine similarity.</p>
          </div>
          <ChevronRight className="step-divider" size={24} />
          <div className="step-card">
            <div className="step-icon"><BrainCircuit size={20}/></div>
            <h4>3. Scoring</h4>
            <p>A hybrid score is generated combining item-similarity and predicted user preference.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
