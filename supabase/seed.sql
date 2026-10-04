-- Demo data for TradeJournal. This is intentionally sample-only and should never be used in production.
-- Use it manually in Supabase SQL editor after creating a test user.

insert into public.strategies (id, user_id, name, description, rules, active)
values
  ('11111111-1111-4111-8111-111111111111', auth.uid(), 'EMA + RSI', 'Trend confirmation strategy', 'Wait for RSI pullback and EMA alignment.', true),
  ('22222222-2222-4222-8222-222222222222', auth.uid(), 'Support Breakout', 'Breakout from support zone', 'Wait for volume and retest confirmation.', true),
  ('33333333-3333-4333-8333-333333333333', auth.uid(), 'Price Action', 'Candlestick-based entries', 'Use structure and confirmation before entry.', true);

insert into public.trades (
  id, user_id, trade_date, symbol, segment, instrument_type, direction, option_type, strike_price, expiry_date,
  quantity, entry_price, exit_price, stop_loss, target_price, gross_pnl, charges, net_pnl, risk_amount, r_multiple,
  strategy_id, setup, timeframe, market_condition, entry_reason, exit_reason, emotion, mistake, followed_plan,
  notes, status
)
values
  (
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', auth.uid(), '2026-09-30', 'NIFTY', 'Equity', 'Index', 'Long', null, null, null,
    50, 158.40, 182.60, 156.20, 185.00, 1210.00, 45.00, 1165.00, 110.00, 10.59,
    '11111111-1111-4111-8111-111111111111', 'EMA + RSI', '15m', 'Trending', 'EMA alignment', 'Momentum continuation', 'Confident', null, true,
    'Strong index breakout after trend continuation.', 'CLOSED'
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', auth.uid(), '2026-09-28', 'BANKNIFTY', 'Futures', 'Future', 'Short', null, null, null,
    25, 312.50, 287.30, 318.50, 280.00, -632.50, 12.00, -644.50, 150.00, -4.30,
    '22222222-2222-4222-8222-222222222222', 'Breakout', '30m', 'Range', 'Resistance rejection', 'Failed continuation', 'Anxious', 'Ignored stop', false,
    'Entry was late and plan was broken with volatility spike.', 'CLOSED'
  );
