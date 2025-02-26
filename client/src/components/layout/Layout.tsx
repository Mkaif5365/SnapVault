import { ThemeProvider } from "@/components/theme-provider"

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="snapvault-theme">
      <main className="min-h-screen bg-background">
        {children}
      </main>
    </ThemeProvider>
  );
}
