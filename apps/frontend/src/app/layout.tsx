import './global.css';
import { Chivo, Libre_Franklin } from 'next/font/google';
import { cn } from '@/shared/frontend/ui-shadcn/lib/utils';

export const metadata = {
  title: 'Job Tailor',
};

const libre_franklin = Libre_Franklin({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-libre_franklin',
});
const chivo = Chivo({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-chivo',
});

export default function RootLayout({ children }: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
    <body className={cn(libre_franklin.variable + ' ' + chivo.variable, 'overflow-hidden')}>
      {children}
    </body>
    </html>
  );
}
