import type { ReactNode } from 'react';
import AppHeader from './AppHeader';
import AppFooter from './AppFooter';

export default function AppShell({
  children,
  showBack = false,
  backTo = '/welcome',
}: {
  children: ReactNode;
  showBack?: boolean;
  backTo?: string;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader showBack={showBack} backTo={backTo} />
      <div className="flex-1">{children}</div>
      <AppFooter />
    </div>
  );
}
