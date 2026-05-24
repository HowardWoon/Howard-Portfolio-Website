import { redirect } from 'next/navigation';
import { requireAdminUser } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProtectedDashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await requireAdminUser();

  return children;
}
