import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

interface Props {
  children: React.ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="snapvault-theme">
      <main className="min-h-screen bg-background">
        {children}
        <Toaster />
      </main>
    </ThemeProvider>
  );
}
