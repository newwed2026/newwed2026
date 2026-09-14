const DAY_IN_MS = 86_400_000;

export function currentDateInRecife(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA",{
    timeZone:"America/Recife",year:"numeric",month:"2-digit",day:"2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function resolveCheckoutDueDate(requested: string | undefined,now = new Date()) {
  if (requested) return requested;
  const localNoon = new Date(`${currentDateInRecife(now)}T12:00:00Z`);
  return new Date(localNoon.getTime() + 3 * DAY_IN_MS).toISOString().slice(0,10);
}

export function checkoutExpiresAt(dueDate: string) {
  return new Date(`${dueDate}T23:59:59.999-03:00`).toISOString();
}

export function dueDateFromCheckoutExpiry(expiresAt: string) {
  return new Intl.DateTimeFormat("en-CA",{ timeZone:"America/Recife",year:"numeric",month:"2-digit",day:"2-digit" }).format(new Date(expiresAt));
}

export function installmentsAreAllowed(method: "PIX"|"CREDIT_CARD",count: number,maxCount: number) {
  if (method === "PIX") return count === 1;
  return Number.isInteger(count) && count >= 1 && count <= maxCount;
}
