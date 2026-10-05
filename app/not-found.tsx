import type { Metadata } from 'next';
import { ErrorScreen } from '@/components/error-screen';

export const metadata: Metadata = { title: 'Page not found', robots: { index: false } };

/** R35: a mistyped or old link gets the site's own 404 instead of the unstyled default */
export default function NotFound() {
  return <ErrorScreen code="404" title="This page does not exist." detail="The link may be old or mistyped." />;
}
