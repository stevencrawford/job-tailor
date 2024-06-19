import Sidebar from '@/components/side-nav';
import Header from '@/components/header';

export default function DashboardLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
