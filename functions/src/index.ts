/**
 * Firebase Cloud Functions for Quota Portfolio Backtest Platform
 *
 * Functions:
 * - executeBacktest: Main backtest execution with limit enforcement
 * - monthlyResetLimits: Scheduled function to reset backtest counters monthly
 */

import * as admin from 'firebase-admin';

// Initialize Firebase Admin SDK
admin.initializeApp();

// Export all Cloud Functions
export { executeBacktest } from './executeBacktest';
export { monthlyResetLimits } from './monthlyReset';
