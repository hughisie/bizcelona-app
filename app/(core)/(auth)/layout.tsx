import { ViewTransition } from 'react';

// Sign-up and log-in sit one click from the public site, so they share its page
// transition. Nothing about how these pages look or behave changes.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <ViewTransition default="page">{children}</ViewTransition>;
}
