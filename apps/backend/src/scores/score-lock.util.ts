export function deriveLockedAt(enteredAt: Date, lockMinutes: number): Date | null {
  const lockTime = new Date(enteredAt.getTime() + lockMinutes * 60_000);
  return new Date() >= lockTime ? lockTime : null;
}
