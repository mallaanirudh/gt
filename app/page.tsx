import React from 'react';
import VotingForm from '@/components/VotingForm';
import { Shield, KeyRound, Lock, UserCheck2 } from 'lucide-react';

export default function HomePage() {
  return (
    <main className="portal-container">
      {/* Header section */}
      <header style={{ textAlign: 'center' }}>
        <div className="header-pill">
          <span className="badge-dot" />
          <span>Active Voting Session</span>
        </div>
        <h1 className="portal-title">Authorized Voting System</h1>
        <p className="portal-subtitle">
          Submit your confidential ballot securely. All submissions are verified against the
          authorized roll roster and aggregated with strict one-vote enforcement.
        </p>
      </header>

      {/* Main Interactive Voting Form */}
      <VotingForm />

      {/* Security & Verification Specifications Panel */}
      <section className="info-grid" aria-label="System security specifications">
        <div className="info-item">
          <div className="info-item-title">
            <UserCheck2 size={16} style={{ color: '#818cf8' }} />
            <span>Authorized Roster</span>
          </div>
          <p className="info-item-desc">
            Restricted to exactly 45 eligible voters: <code>241AI001</code>–<code>241AI044</code> and{' '}
            <code>231AI007</code>. Verification is case-insensitive.
          </p>
        </div>

        <div className="info-item">
          <div className="info-item-title">
            <Shield size={16} style={{ color: '#818cf8' }} />
            <span>Single-Vote Guarantee</span>
          </div>
          <p className="info-item-desc">
            Duplicate votes for the same roll number are systematically rejected at the server level
            with atomic state locks.
          </p>
        </div>

        <div className="info-item">
          <div className="info-item-title">
            <Lock size={16} style={{ color: '#818cf8' }} />
            <span>Voter Privacy</span>
          </div>
          <p className="info-item-desc">
            Voter ballots and running tallies remain confidential. Individual vote records are never
            exposed to public clients.
          </p>
        </div>

        <div className="info-item">
          <div className="info-item-title">
            <KeyRound size={16} style={{ color: '#818cf8' }} />
            <span>Score Boundaries</span>
          </div>
          <p className="info-item-desc">
            Ballots are strictly validated to integer values between 50 and 85 inclusive. Out-of-range
            inputs are blocked.
          </p>
        </div>
      </section>
    </main>
  );
}
