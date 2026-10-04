import { describe, expect, it } from 'vitest';
import {
  calculateAverageLoss,
  calculateAverageWin,
  calculateExpectancy,
  calculateGrossPnl,
  calculateMaxDrawdown,
  calculateMonthlyPnl,
  calculateNetPnl,
  calculateProfitFactor,
  calculateRMultiple,
  calculateWinRate,
} from './calculations';

describe('trade calculations', () => {
  it('calculates long pnl correctly', () => {
    expect(calculateGrossPnl({ direction: 'Long', entry_price: 100, exit_price: 120, quantity: 10 })).toBe(200);
  });

  it('calculates short pnl correctly', () => {
    expect(calculateGrossPnl({ direction: 'Short', entry_price: 120, exit_price: 100, quantity: 10 })).toBe(200);
  });

  it('calculates net pnl with charges', () => {
    expect(calculateNetPnl({ direction: 'Long', entry_price: 100, exit_price: 120, quantity: 10, charges: 20 })).toBe(180);
  });

  it('calculates win rate', () => {
    expect(calculateWinRate([
      { status: 'CLOSED', net_pnl: 100 },
      { status: 'CLOSED', net_pnl: -50 },
      { status: 'CLOSED', net_pnl: 80 },
    ] as any)).toBe(66.7);
  });

  it('calculates profit factor', () => {
    expect(calculateProfitFactor([
      { status: 'CLOSED', gross_pnl: 200 },
      { status: 'CLOSED', gross_pnl: -100 },
      { status: 'CLOSED', gross_pnl: -50 },
    ] as any)).toBe(2);
  });

  it('calculates average win', () => {
    expect(calculateAverageWin([
      { status: 'CLOSED', net_pnl: 100 },
      { status: 'CLOSED', net_pnl: -50 },
      { status: 'CLOSED', net_pnl: 200 },
    ] as any)).toBe(150);
  });

  it('calculates average loss', () => {
    expect(calculateAverageLoss([
      { status: 'CLOSED', net_pnl: -100 },
      { status: 'CLOSED', net_pnl: 200 },
      { status: 'CLOSED', net_pnl: -50 },
    ] as any)).toBe(75);
  });

  it('calculates expectancy', () => {
    expect(calculateExpectancy([
      { status: 'CLOSED', net_pnl: 100 },
      { status: 'CLOSED', net_pnl: -50 },
      { status: 'CLOSED', net_pnl: 80 },
    ] as any)).toBe(43.33);
  });

  it('calculates maximum drawdown', () => {
    expect(calculateMaxDrawdown([
      { status: 'CLOSED', trade_date: '2026-01-01', net_pnl: 100 },
      { status: 'CLOSED', trade_date: '2026-01-02', net_pnl: -50 },
      { status: 'CLOSED', trade_date: '2026-01-03', net_pnl: 80 },
    ] as any)).toBe(0);
  });

  it('calculates r multiple', () => {
    expect(calculateRMultiple({ net_pnl: 200, risk_amount: 100 })).toBe(2);
  });

  it('calculates monthly pnl totals', () => {
    expect(calculateMonthlyPnl([
      { status: 'CLOSED', trade_date: '2026-01-05', net_pnl: 100 },
      { status: 'CLOSED', trade_date: '2026-01-15', net_pnl: -50 },
      { status: 'CLOSED', trade_date: '2026-02-01', net_pnl: 200 },
    ] as any)).toEqual({ '2026-01': 50, '2026-02': 200 });
  });
});
