import { accounts, mails } from './data';
import { Mail } from '@/components/mail';

export default function MailPage() {
  const defaultLayout = undefined;
  const defaultCollapsed = undefined;

  return (
    <>
      <div className="flex-col md:flex">
        <Mail
          accounts={accounts}
          mails={mails}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </div>
    </>
  )
}
