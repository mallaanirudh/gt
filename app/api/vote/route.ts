import { NextRequest, NextResponse } from 'next/server';
import {
  isAuthorizedRollNumber,
  MAX_VOTE_VALUE,
  MIN_VOTE_VALUE,
  normalizeRollNumber,
} from '@/lib/constants';
import { submitVote } from '@/lib/store';
import { revalidatePath } from 'next/cache';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rollNumber, voteValue } = body;

    if (!rollNumber || typeof rollNumber !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Roll number is required.' },
        { status: 400 }
      );
    }

    // 1. Standardize roll number: .toUpperCase().trim()
    const normalizedRollNumber = normalizeRollNumber(rollNumber);

    // 2. Reject if not authorized
    if (!isAuthorizedRollNumber(normalizedRollNumber)) {
      return NextResponse.json(
        {
          success: false,
          error: `Roll number ${normalizedRollNumber} is not in the authorized voting list.`,
        },
        { status: 403 }
      );
    }

    // 3. Strictly validate vote value
    const voteNumber = Number(voteValue);
    if (
      voteValue === undefined ||
      voteValue === null ||
      !Number.isInteger(voteNumber) ||
      voteNumber < MIN_VOTE_VALUE ||
      voteNumber > MAX_VOTE_VALUE
    ) {
      return NextResponse.json(
        {
          success: false,
          error: `Vote value must be an integer between ${MIN_VOTE_VALUE} and ${MAX_VOTE_VALUE} inclusive.`,
        },
        { status: 400 }
      );
    }

    // 4. One-Vote Enforcement & Storage
    const result = await submitVote(normalizedRollNumber, voteNumber);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 409 }
      );
    }

    revalidatePath('/admin');
    revalidatePath('/api/admin/stats');

    return NextResponse.json(
      {
        success: true,
        message: result.message || 'Thank you! Your vote has been recorded.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('API /api/vote error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error processing vote.' },
      { status: 500 }
    );
  }
}
