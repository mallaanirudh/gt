import fs from 'fs';
import path from 'path';

export interface VoteStoreData {
  votedRollNumbers: string[];
  runningSum: number;
  totalVotes: number;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'votes.json');

// In-memory fallback
let memoryStore: VoteStoreData = {
  votedRollNumbers: [],
  runningSum: 0,
  totalVotes: 0,
};

let writeQueue = Promise.resolve();

function readFromDisk(): VoteStoreData {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(raw);
      if (
        Array.isArray(parsed.votedRollNumbers) &&
        typeof parsed.runningSum === 'number' &&
        typeof parsed.totalVotes === 'number'
      ) {
        memoryStore = {
          votedRollNumbers: parsed.votedRollNumbers,
          runningSum: parsed.runningSum,
          totalVotes: parsed.totalVotes,
        };
        return memoryStore;
      }
    }

    // Initialize if not present
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error reading DATA_FILE from disk:', err);
  }
  return memoryStore;
}

export async function getStore(): Promise<VoteStoreData> {
  // Always read freshest data from disk to ensure cross-process/worker synchronization
  const current = readFromDisk();
  return {
    votedRollNumbers: [...current.votedRollNumbers],
    runningSum: current.runningSum,
    totalVotes: current.totalVotes,
  };
}

export async function hasAlreadyVoted(normalizedRollNumber: string): Promise<boolean> {
  const current = readFromDisk();
  return current.votedRollNumbers.includes(normalizedRollNumber);
}

export interface VoteSubmissionResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Atomically records a vote and persists immediately to votes.json.
 */
export async function submitVote(
  normalizedRollNumber: string,
  voteValue: number
): Promise<VoteSubmissionResult> {
  return new Promise<VoteSubmissionResult>((resolve) => {
    writeQueue = writeQueue
      .then(async () => {
        const current = readFromDisk();

        // 4. One-Vote Enforcement
        if (current.votedRollNumbers.includes(normalizedRollNumber)) {
          resolve({
            success: false,
            error: `Roll number ${normalizedRollNumber} has already cast a vote.`,
          });
          return;
        }

        // Apply new vote
        const updated: VoteStoreData = {
          votedRollNumbers: [...current.votedRollNumbers, normalizedRollNumber],
          runningSum: current.runningSum + voteValue,
          totalVotes: current.totalVotes + 1,
        };

        memoryStore = updated;

        // Persist synchronously/atomically to avoid read-after-write delays
        try {
          fs.writeFileSync(DATA_FILE, JSON.stringify(updated, null, 2), 'utf-8');
        } catch (fsErr) {
          console.error('Failed to write votes.json:', fsErr);
        }

        resolve({
          success: true,
          message: 'Thank you! Your vote has been recorded.',
        });
      })
      .catch((err) => {
        console.error('Error in submitVote queue:', err);
        resolve({
          success: false,
          error: 'An internal server error occurred while processing your vote.',
        });
      });
  });
}
