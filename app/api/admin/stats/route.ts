import { NextResponse } from 'next/server';
import { getStore } from '@/lib/store';
import { AUTHORIZED_ROLL_NUMBERS } from '@/lib/constants';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const store = await getStore();
  const totalAuthorized = AUTHORIZED_ROLL_NUMBERS.size;
  const average =
    store.totalVotes > 0
      ? Number((store.runningSum / store.totalVotes).toFixed(2))
      : null;

  return NextResponse.json(
    {
      totalVotes: store.totalVotes,
      totalAuthorized,
      runningSum: store.runningSum,
      average,
      turnoutPercentage: Number(((store.totalVotes / totalAuthorized) * 100).toFixed(1)),
      votedRollNumbers: store.votedRollNumbers,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}
