import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { auth } from '@/lib/auth';
import '@/styles/admin.css';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    return <>{children}</>;
  }

  const user = {
    name: session.user.name,
    email: session.user.email ?? '',
    role: session.user.role ?? 'ADMIN',
  };

  return (
    <div className="admin-shell flex min-h-screen bg-primary text-text-primary">
      <AdminSidebar user={user} />
      <div className="flex min-h-screen flex-1 flex-col lg:ml-64">
        <AdminHeader user={user} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
