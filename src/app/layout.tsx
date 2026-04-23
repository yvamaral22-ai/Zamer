import type { Metadata } from 'next';
import { IBM_Plex_Mono, Sora } from 'next/font/google';

import { AppShell } from '@/components/app-shell';
import { PrototypeProvider } from '@/components/prototype-provider';

import './globals.css';

const sora = Sora({
  subsets: ['latin'],
  variable: '--font-display',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'IntegraFlow',
  description:
    'Protótipo de sistema corporativo para gestão integrada de solicitações, tarefas e comunicação entre departamentos.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${sora.variable} ${plexMono.variable}`}>
      <body>
        <PrototypeProvider>
          <AppShell>{children}</AppShell>
        </PrototypeProvider>
      </body>
    </html>
  );
}
