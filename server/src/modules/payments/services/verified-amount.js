// Values must come from Paystack's authenticated server-side verify response,
// never redirect parameters. Customer-borne fees increase `amount`, while
// `requested_amount` retains the original price.
export function matchesVerifiedAmount(transaction, expectedKobo) {
  if (!Number.isSafeInteger(expectedKobo) || expectedKobo <= 0) return false;
  const amount = Number(transaction.amount);
  if (!Number.isSafeInteger(amount) || amount < expectedKobo) return false;
  const hasRequestedAmount = transaction.requested_amount !== undefined && transaction.requested_amount !== null;
  if (hasRequestedAmount && Number(transaction.requested_amount) !== expectedKobo) return false;
  if (amount === expectedKobo) return true;
  const fees = Number(transaction.fees);
  return hasRequestedAmount && transaction.fees !== null && transaction.fees !== undefined
    && Number.isSafeInteger(fees) && fees > 0
    && amount - fees === expectedKobo;
}
