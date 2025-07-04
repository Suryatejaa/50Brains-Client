// app/dashboard/page.tsx - Server Component Dashboard Page
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardClientRouter } from '@/components/dashboard/DashboardClientRouter';

export default async function DashboardPage() {
  // Server-side auth check using cookies
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const refreshToken = cookieStore.get('refreshToken')?.value;

  // Redirect to login if no tokens
  if (!accessToken && !refreshToken) {
    redirect('/login');
  }

  // Return the client router which will handle user-specific routing
  return <DashboardClientRouter />;
}
