'use server';

import {
  isAuthorizedRollNumber,
  MAX_VOTE_VALUE,
  MIN_VOTE_VALUE,
  normalizeRollNumber,
} from '@/lib/constants';
import { submitVote } from '@/lib/store';
import { revalidatePath } from 'next/cache';

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
  rollNumber?: string;
}

export async function castVoteAction(
  prevState: ActionResponse | null,
  formData: FormData
): Promise<ActionResponse> {
  const rawRollNumber = formData.get('rollNumber');
  const rawVoteValue = formData.get('voteValue');

  // Validate presence
  if (!rawRollNumber || typeof rawRollNumber !== 'string') {
    return {
      success: false,
      error: 'Please enter a valid roll number.',
    };
  }

  // 1. Standardize roll number: .toUpperCase().trim()
  const normalizedRollNumber = normalizeRollNumber(rawRollNumber);

  if (!normalizedRollNumber) {
    return {
      success: false,
      error: 'Roll number cannot be empty.',
    };
  }

  // 2. Reject if not in the authorized list
  if (!isAuthorizedRollNumber(normalizedRollNumber)) {
    return {
      success: false,
      error: `Roll number ${normalizedRollNumber} is not in the authorized voting list.`,
    };
  }

  // 3. Strictly validate vote value
  if (rawVoteValue === null || rawVoteValue === undefined || rawVoteValue === '') {
    return {
      success: false,
      error: `Please enter a vote value between ${MIN_VOTE_VALUE} and ${MAX_VOTE_VALUE}.`,
    };
  }

  const voteNumber = Number(rawVoteValue);
  if (!Number.isInteger(voteNumber) || voteNumber < MIN_VOTE_VALUE || voteNumber > MAX_VOTE_VALUE) {
    return {
      success: false,
      error: `Vote value must be an integer between ${MIN_VOTE_VALUE} and ${MAX_VOTE_VALUE} inclusive.`,
    };
  }

  // 4. One-Vote Enforcement & Storage (Handled atomically in server store)
  const result = await submitVote(normalizedRollNumber, voteNumber);

  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }

  // Invalidate any server-side cached pages so admin sees real-time updates immediately
  revalidatePath('/admin');
  revalidatePath('/api/admin/stats');

  return {
    success: true,
    message: result.message ?? 'Thank you! Your vote has been recorded.',
    rollNumber: normalizedRollNumber,
  };
}
