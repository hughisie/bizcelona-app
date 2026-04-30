'use client';

export function WhatsAppButton({
  number,
  name,
  recipientId,
}: {
  number: string;
  name: string;
  recipientId: string;
}) {
  const firstName = name.split(' ')[0];
  const text = encodeURIComponent(`Hi ${firstName}, I'm reaching out via Bizcelona.`);
  const clean = number.replace(/[^\d+]/g, '').replace(/^\+/, '');
  const href = `https://wa.me/${clean}?text=${text}`;

  function handleClick() {
    // Fire-and-forget — don't block the WhatsApp redirect
    fetch('/api/connections/track', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ recipientId }),
    }).catch(() => {});
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-4 py-2 bg-[#25d366] text-white rounded-md text-sm font-medium hover:brightness-110"
    >
      <span>💬</span> Message on WhatsApp
    </a>
  );
}
