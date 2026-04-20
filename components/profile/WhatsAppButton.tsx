export function WhatsAppButton({ number, name }: { number: string; name: string }) {
  const text = encodeURIComponent(`Hi ${name.split(' ')[0]}, I found you via Bizcelona.`);
  const clean = number.replace(/[^\d+]/g, '').replace(/^\+/, '');
  const href = `https://wa.me/${clean}?text=${text}`;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
       className="inline-flex items-center gap-2 px-4 py-2 bg-[#25d366] text-white rounded-md text-sm font-medium hover:brightness-110">
      <span>💬</span> Message on WhatsApp
    </a>
  );
}
