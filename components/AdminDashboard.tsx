'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  Users,
  Calculator,
  CheckCircle,
  RefreshCw,
  Clock,
  Radio,
} from 'lucide-react';

interface StatsResponse {
  totalVotes: number;
  totalAuthorized: number;
  runningSum: number;
  average: number | null;
  turnoutPercentage: number;
  votedRollNumbers: string[];
}

export default function AdminDashboard({ initialData }: { initialData?: StatsResponse }) {
  const [data, setData] = useState<StatsResponse | null>(initialData || null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStats = useCallback(async (isManual = false) => {
    if (isManual) setLoading(true);
    try {
      const res = await fetch('/api/admin/stats', { cache: 'no-store' });
      if (res.ok) {
        const json: StatsResponse = await res.json();
        setData(json);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
    } finally {
      if (isManual) setLoading(false);
    }
  }, []);

  // Poll every 2.5 seconds to pick up votes cast in other tabs in real-time
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchStats(false);
    }, 2500);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchStats]);

  const totalAuthorized = data?.totalAuthorized ?? 45;
  const totalVotes = data?.totalVotes ?? 0;
  const runningSum = data?.runningSum ?? 0;
  const average =
    data?.average !== null && data?.average !== undefined
      ? data.average.toFixed(2)
      : totalVotes > 0
      ? (runningSum / totalVotes).toFixed(2)
      : 'N/A';
  const turnoutPercentage = data?.turnoutPercentage ?? ((totalVotes / totalAuthorized) * 100).toFixed(1);
  const votedRolls = data?.votedRollNumbers ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top navigation & controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.875rem',
            transition: 'color 0.2s ease',
          }}
        >
          <ArrowLeft size={16} /> Back to Voting Portal
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setAutoRefresh((prev) => !prev)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.8rem',
              borderRadius: '0.5rem',
              border: `1px solid ${autoRefresh ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              background: autoRefresh ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
              color: autoRefresh ? '#6ee7b7' : 'var(--text-dim)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <Radio size={14} className={autoRefresh ? 'pulse-dot' : ''} />
            <span>{autoRefresh ? 'Live Sync Active (2s)' : 'Live Sync Paused'}</span>
          </button>

          <button
            onClick={() => fetchStats(true)}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.4rem 0.85rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              background: 'rgba(99, 102, 241, 0.15)',
              color: '#c7d2fe',
              fontSize: '0.8rem',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <header style={{ textAlign: 'center' }}>
        <div className="header-pill">
          <span className="badge-dot" />
          <span>Real-Time Election Analytics</span>
        </div>
        <h1 className="portal-title">Election Statistics & Average</h1>
        <p className="portal-subtitle">
          Internal administration overview updating in real time as ballots are cast.
        </p>
      </header>

      {/* Primary KPI Card: Average */}
      <div
        className="glass-panel"
        style={{
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          background: 'linear-gradient(135deg, rgba(30, 27, 75, 0.75) 0%, rgba(15, 23, 42, 0.85) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: '#a5b4fc',
            fontSize: '0.9rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '0.5rem',
          }}
        >
          <Calculator size={18} />
          <span>Calculated Running Average</span>
        </div>

        <div
          style={{
            fontSize: '4.75rem',
            fontWeight: 800,
            fontFamily: 'var(--font-mono)',
            color: '#ffffff',
            lineHeight: 1.1,
            margin: '0.5rem 0',
            textShadow: '0 0 35px rgba(99, 102, 241, 0.6)',
          }}
        >
          {average}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Formula: <code>runningSum ({runningSum}) ÷ totalVotes ({totalVotes})</code>
        </p>

        <div
          style={{
            marginTop: '1.25rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.75rem',
            color: 'var(--text-dim)',
          }}
        >
          <Clock size={13} />
          <span>Last sync: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="info-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="info-item">
          <div className="info-item-title">
            <Users size={16} style={{ color: '#818cf8' }} />
            <span>Turnout</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {totalVotes} / {totalAuthorized}
          </div>
          <span className="info-item-desc">{turnoutPercentage}% of eligible voters cast ballots</span>
        </div>

        <div className="info-item">
          <div className="info-item-title">
            <BarChart3 size={16} style={{ color: '#818cf8' }} />
            <span>Cumulative Sum</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {runningSum}
          </div>
          <span className="info-item-desc">Sum total of all accepted integer scores</span>
        </div>

        <div className="info-item">
          <div className="info-item-title">
            <CheckCircle size={16} style={{ color: '#818cf8' }} />
            <span>Pending Voters</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
            {totalAuthorized - totalVotes}
          </div>
          <span className="info-item-desc">Remaining eligible roll numbers</span>
        </div>
      </div>

      {/* Roll Numbers Who Have Voted */}
      <div className="glass-panel" style={{ padding: '1.75rem' }}>
        <h3
          style={{
            fontSize: '1.1rem',
            marginBottom: '0.85rem',
            color: '#e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>Voted Roll Numbers</span>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#818cf8',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
            }}
          >
            {votedRolls.length} recorded
          </span>
        </h3>

        {votedRolls.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>No votes recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {votedRolls.map((roll) => (
              <span
                key={roll}
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.825rem',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  border: '1px solid rgba(99, 102, 241, 0.3)',
                  color: '#c7d2fe',
                  padding: '0.25rem 0.65rem',
                  borderRadius: '0.375rem',
                }}
              >
                {roll}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
