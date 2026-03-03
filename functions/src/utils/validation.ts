import type { Portfolio } from '@quota/shared/types';

/**
 * Validate portfolio configuration
 * Returns error message if invalid, null if valid
 */
export function validatePortfolio(portfolio: Portfolio): string | null {
  if (!portfolio || typeof portfolio !== 'object') {
    return 'Invalid portfolio structure';
  }

  if (!portfolio.allocations || !Array.isArray(portfolio.allocations)) {
    return 'Portfolio must have an allocations array';
  }

  if (portfolio.allocations.length === 0) {
    return 'Portfolio must have at least one asset';
  }

  if (portfolio.allocations.length > 50) {
    return 'Portfolio cannot have more than 50 assets';
  }

  // Validate total allocation sums to 100%
  const totalAllocation = portfolio.allocations.reduce(
    (sum, alloc) => sum + alloc.percentage,
    0
  );

  if (Math.abs(totalAllocation - 100) > 0.01) {
    return `Allocations must sum to 100% (currently ${totalAllocation.toFixed(2)}%)`;
  }

  // Validate each allocation
  for (const alloc of portfolio.allocations) {
    if (!alloc.symbol || typeof alloc.symbol !== 'string') {
      return 'Invalid asset symbol';
    }

    if (typeof alloc.percentage !== 'number' || alloc.percentage <= 0 || alloc.percentage > 100) {
      return `Invalid allocation percentage for ${alloc.symbol}`;
    }
  }

  // Validate capital
  if (typeof portfolio.initialCapital !== 'number' || portfolio.initialCapital <= 0) {
    return 'Initial capital must be a positive number';
  }

  if (portfolio.initialCapital > 1000000000) {
    return 'Initial capital exceeds maximum allowed value';
  }

  // Validate PAC strategy
  if (portfolio.investmentStrategy === 'pac') {
    if (!portfolio.pacAmount || portfolio.pacAmount <= 0) {
      return 'PAC amount must be positive';
    }

    if (!portfolio.pacFrequency) {
      return 'PAC frequency is required';
    }

    if (!['monthly', 'quarterly', 'yearly'].includes(portfolio.pacFrequency)) {
      return 'Invalid PAC frequency';
    }
  }

  // Validate rebalance frequency
  if (!['none', 'monthly', 'quarterly', 'yearly'].includes(portfolio.rebalanceFrequency)) {
    return 'Invalid rebalance frequency';
  }

  // Validate start year if provided
  if (portfolio.startYear !== undefined) {
    const currentYear = new Date().getFullYear();
    if (portfolio.startYear < 1990 || portfolio.startYear > currentYear) {
      return `Start year must be between 1990 and ${currentYear}`;
    }
  }

  return null; // Valid
}
