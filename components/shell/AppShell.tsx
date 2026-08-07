import { BottomNav } from "@/components/shell/BottomNav";
import { EdgeBackGesture } from "@/components/shell/EdgeBackGesture";
import { InstallPrompt } from "@/components/shell/InstallPrompt";
import { OfflineBanner } from "@/components/shell/OfflineBanner";
import { PwaRegister } from "@/components/shell/PwaRegister";
import { TopBar } from "@/components/shell/TopBar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex h-[100dvh] w-full max-w-lg flex-col overflow-hidden bg-board">
      <EdgeBackGesture />
      <PwaRegister />
      <TopBar />
      <OfflineBanner />
      <InstallPrompt />
      <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-3.5">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
