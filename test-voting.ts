import {
  AUTHORIZED_ROLL_NUMBERS,
  normalizeRollNumber,
  isAuthorizedRollNumber,
} from './lib/constants';
import { submitVote, getStore } from './lib/store';
import fs from 'fs';
import path from 'path';

async function runTests() {
  console.log('--- Testing System Specifications ---');

  // 1. Check authorized roll count
  console.log(`Total authorized roll numbers: ${AUTHORIZED_ROLL_NUMBERS.size} (Expected: 45)`);
  if (AUTHORIZED_ROLL_NUMBERS.size !== 45) {
    throw new Error('Authorized roll numbers count is not 45');
  }

  if (!AUTHORIZED_ROLL_NUMBERS.has('231AI007')) {
    throw new Error('231AI007 should be authorized');
  }
  if (!AUTHORIZED_ROLL_NUMBERS.has('241AI001') || !AUTHORIZED_ROLL_NUMBERS.has('241AI044')) {
    throw new Error('241AI001 and 241AI044 should be authorized');
  }
  if (AUTHORIZED_ROLL_NUMBERS.has('241AI045')) {
    throw new Error('241AI045 should NOT be authorized');
  }
  console.log('✓ Authorized roll numbers verified (45 total).');

  // 2. Clean data/votes.json for test
  const dataPath = path.join(process.cwd(), 'data', 'votes.json');
  if (fs.existsSync(dataPath)) {
    fs.unlinkSync(dataPath);
  }

  // 3. Test case-insensitivity & standardization
  const testInput1 = '  241ai001  ';
  const norm1 = normalizeRollNumber(testInput1);
  console.log(`Standardized '${testInput1}' -> '${norm1}'`);
  if (norm1 !== '241AI001' || !isAuthorizedRollNumber(norm1)) {
    throw new Error('Normalization failed');
  }

  // 4. Test vote casting
  const res1 = await submitVote(norm1, 75);
  console.log('Vote 1 submission result:', res1);
  if (!res1.success) throw new Error('Vote 1 should succeed');

  // 5. Test duplicate vote rejection
  const testInputDuplicate = '241Ai001';
  const normDup = normalizeRollNumber(testInputDuplicate);
  const resDup = await submitVote(normDup, 80);
  console.log('Duplicate vote attempt:', resDup);
  if (resDup.success || !resDup.error?.includes('has already cast a vote')) {
    throw new Error(`Expected duplicate vote to be blocked with "has already cast a vote", got: ${JSON.stringify(resDup)}`);
  }
  console.log('✓ Duplicate vote blocked correctly with message:', resDup.error);

  // 6. Test second valid vote (231ai007)
  const norm2 = normalizeRollNumber('231ai007');
  const res2 = await submitVote(norm2, 60);
  console.log('Vote 2 submission result:', res2);
  if (!res2.success) throw new Error('Vote 2 should succeed');

  // 7. Check server store state
  const store = await getStore();
  console.log('Server store contents:', store);
  if (store.totalVotes !== 2) throw new Error(`Expected totalVotes: 2, got ${store.totalVotes}`);
  if (store.runningSum !== 135) throw new Error(`Expected runningSum: 135 (75 + 60), got ${store.runningSum}`);
  if (!store.votedRollNumbers.includes('241AI001') || !store.votedRollNumbers.includes('231AI007')) {
    throw new Error('votedRollNumbers missing records');
  }
  console.log('✓ Server store state correctly updated: runningSum = 135, totalVotes = 2');

  // Clean data/votes.json to initial fresh state
  fs.writeFileSync(
    dataPath,
    JSON.stringify({ votedRollNumbers: [], runningSum: 0, totalVotes: 0 }, null, 2),
    'utf-8'
  );

  console.log('\n>>> ALL 5 SPECIFICATIONS VERIFIED & PASSED! <<<');
}

runTests().catch((e) => {
  console.error('Test failed:', e);
  process.exit(1);
});
