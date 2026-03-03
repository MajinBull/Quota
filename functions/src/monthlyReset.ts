import { onSchedule } from 'firebase-functions/v2/scheduler';
import * as admin from 'firebase-admin';

/**
 * Cloud Function: Monthly reset of backtest execution counters
 *
 * Schedule: Runs on the 1st day of every month at 00:00 UTC
 * Cron expression: "0 0 1 * *"
 *
 * What it does:
 * - Resets backtestExecutionCount to 0 for all users
 * - Uses batched writes to handle large user bases efficiently
 * - Logs completion for monitoring
 */
export const monthlyResetLimits = onSchedule(
  {
    schedule: '0 0 1 * *',
    timeZone: 'UTC',
    region: 'us-central1',
    memory: '256MiB',
  },
  async (event) => {
    const startTime = Date.now();
    console.log('Starting monthly backtest limit reset...');

    try {
      const usersRef = admin.firestore().collection('users');

      // Query only users who have executed at least 1 backtest
      // This optimizes the update (no need to update users with count already at 0)
      const snapshot = await usersRef
        .where('backtestExecutionCount', '>', 0)
        .get();

      if (snapshot.empty) {
        console.log('No users to reset (all counts already at 0)');
        return;
      }

      console.log(`Found ${snapshot.size} users with non-zero backtest counts`);

      // Firebase limits batch writes to 500 operations
      // Split into multiple batches if needed
      const BATCH_SIZE = 500;
      let totalReset = 0;
      let batchCount = 0;

      for (let i = 0; i < snapshot.docs.length; i += BATCH_SIZE) {
        const batch = admin.firestore().batch();
        const batchDocs = snapshot.docs.slice(i, i + BATCH_SIZE);

        batchDocs.forEach((doc) => {
          batch.update(doc.ref, {
            backtestExecutionCount: 0,
          });
          totalReset++;
        });

        await batch.commit();
        batchCount++;
        console.log(`Batch ${batchCount} committed (${batchDocs.length} users)`);
      }

      const executionTime = Date.now() - startTime;
      console.log(
        `Monthly reset completed: ${totalReset} users reset in ${executionTime}ms (${batchCount} batches)`
      );

      // Optional: Log to a separate collection for audit trail
      await admin.firestore().collection('system_logs').add({
        event: 'monthly_reset',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        usersReset: totalReset,
        executionTimeMs: executionTime,
      });

      return;
    } catch (error) {
      console.error('Monthly reset failed:', error);

      // Log error to a collection for monitoring
      await admin.firestore().collection('system_logs').add({
        event: 'monthly_reset_error',
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        error: error instanceof Error ? error.message : String(error),
      });

      throw error;
    }
  });
