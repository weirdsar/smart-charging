'use client';

export function triggerLeadNotifications(leadId: string): void {
  void fetch('/api/leads/notify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leadId }),
    keepalive: true,
  }).catch((error: unknown) => {
    console.error('Lead notification request failed:', error);
  });
}
