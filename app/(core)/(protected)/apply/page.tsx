import { permanentRedirect } from 'next/navigation';

// Legacy /apply route — the wizard-based onboarding lives at /signup now.
export default function ApplyRedirect() {
  permanentRedirect('/signup');
}
