'use client';

import React, { useState, useTransition } from 'react';
import { castVoteAction, ActionResponse } from '@/app/actions/vote';
import { MIN_VOTE_VALUE, MAX_VOTE_VALUE, normalizeRollNumber } from '@/lib/constants';
import { ShieldCheck, UserCheck, AlertCircle, CheckCircle2, Lock, Sparkles, Hash } from 'lucide-react';

export default function VotingForm() {
  const [rollNumber, setRollNumber] = useState('');
  const [voteValue, setVoteValue] = useState<number>(65);
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<ActionResponse | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('rollNumber', rollNumber);
    formData.append('voteValue', voteValue.toString());

    startTransition(async () => {
      const response = await castVoteAction(null, formData);
      setState(response);
    });
  };

  // 5. Privacy & User Interface: Upon successful submission, show confirmation and hide form
  if (state?.success) {
    return (
      <div className="glass-panel">
        <div className="success-card">
          <div className="success-icon-wrap">
            <CheckCircle2 size={36} />
          </div>

          <h2 className="success-title">Vote Recorded Successfully</h2>

          <p className="success-text">
            {state.message || 'Thank you! Your vote has been recorded.'}
          </p>

          <div
            style={{
              padding: '0.6rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.85rem',
              color: '#c7d2fe',
            }}
          >
            Voter ID Confirmed: <strong>{state.rollNumber}</strong>
          </div>

          <div className="privacy-banner">
            <Lock size={18} style={{ color: '#818cf8', flexShrink: 0 }} />
            <span>
              <strong>Zero-Knowledge Privacy:</strong> Your individual ballot has been factored
              into the server running tally and anonymized. Per election rules, individual ballots
              and cumulative scores remain confidential.
            </span>
          </div>
        </div>
      </div>
    );
  }

  const normalizedPreview = rollNumber.trim() ? normalizeRollNumber(rollNumber) : '';

  return (
    <div className="glass-panel">
      {/* Error Alert */}
      {state?.error && (
        <div className="alert alert-error" role="alert" id="voting-error-banner">
          <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong style={{ display: 'block', marginBottom: '2px' }}>Submission Rejected</strong>
            <span>{state.error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} id="secure-voting-form" noValidate>
        {/* Roll Number Field */}
        <div className="form-group">
          <label htmlFor="rollNumber" className="form-label">
            <span>Roll Number</span>
            <span className="label-hint">Case-insensitive</span>
          </label>

          <div className="input-wrapper">
            <span className="input-icon">
              <UserCheck size={18} />
            </span>
            <input
              id="rollNumber"
              name="rollNumber"
              type="text"
              required
              autoComplete="off"
              spellCheck={false}
              className="text-input"
              placeholder="e.g. 241AI001 or 231AI007"
              value={rollNumber}
              onChange={(e) => {
                setRollNumber(e.target.value);
                if (state?.error) setState(null);
              }}
              disabled={isPending}
            />
          </div>

          {normalizedPreview && (
            <div
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                marginTop: '0.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
              }}
            >
              <span>Standardized ID:</span>
              <code
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: '#a5b4fc',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}
              >
                {normalizedPreview}
              </code>
            </div>
          )}
        </div>

        {/* Vote Value Field */}
        <div className="form-group">
          <label htmlFor="voteValue" className="form-label">
            <span>Vote Score / Evaluation</span>
            <span className="label-hint">
              Range: {MIN_VOTE_VALUE} – {MAX_VOTE_VALUE} (Integers only)
            </span>
          </label>

          <div className="range-container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Hash size={16} style={{ color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Selected Value:</span>
              </div>
              <input
                id="voteValue"
                name="voteValue"
                type="number"
                min={MIN_VOTE_VALUE}
                max={MAX_VOTE_VALUE}
                step={1}
                required
                className="text-input"
                style={{
                  width: '90px',
                  padding: '0.45rem 0.6rem',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '1.1rem',
                  fontFamily: 'var(--font-mono)',
                  color: '#818cf8',
                }}
                value={voteValue}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    setVoteValue(val);
                  }
                  if (state?.error) setState(null);
                }}
                disabled={isPending}
              />
            </div>

            <input
              type="range"
              min={MIN_VOTE_VALUE}
              max={MAX_VOTE_VALUE}
              step={1}
              value={voteValue}
              onChange={(e) => {
                setVoteValue(parseInt(e.target.value, 10));
                if (state?.error) setState(null);
              }}
              className="range-slider"
              disabled={isPending}
              aria-label="Vote score slider"
            />

            <div className="range-labels">
              <span>Min ({MIN_VOTE_VALUE})</span>
              <span>Mid (67)</span>
              <span>Max ({MAX_VOTE_VALUE})</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          id="submit-vote-btn"
          className="submit-btn"
          disabled={isPending || !rollNumber.trim()}
        >
          {isPending ? (
            <>
              <div
                className="spin"
                style={{
                  width: '18px',
                  height: '18px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                }}
              />
              <span>Encrypting & Casting Vote...</span>
            </>
          ) : (
            <>
              <ShieldCheck size={19} />
              <span>Cast Confidential Vote</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
