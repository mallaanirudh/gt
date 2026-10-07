import React from 'react';
import { getStore } from '@/lib/store';
import { AUTHORIZED_ROLL_NUMBERS } from '@/lib/constants';
import AdminDashboard from '@/components/AdminDashboard';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AdminPage() {
  const store = await getStore();
  const totalAuthorized = AUTHORIZED_ROLL_NUMBERS.size;
  const average =
    store.totalVotes > 0
      ? Number((store.runningSum / store.totalVotes).toFixed(2))
      : null;

  const initialData = {
    totalVotes: store.totalVotes,
    totalAuthorized,
    runningSum: store.runningSum,
    average,
    turnoutPercentage: Number(((store.totalVotes / totalAuthorized) * 100).toFixed(1)),
    votedRollNumbers: store.votedRollNumbers,
  };

  return (
    <main className="portal-container" style={{ maxWidth: '820px' }}>
      <AdminDashboard initialData={initialData} />
    </main>
  );
}
