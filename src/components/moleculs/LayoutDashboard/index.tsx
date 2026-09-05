import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

import { Separator } from "@/components/ui/separator";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import DashboardTitle from "@/components/atoms/DashboardTitle";

type DashboardShellProps = {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  title?: string;
};

export default function LayoutDashboard({
  children,
  sidebar,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarProvider>
        {sidebar}

        <SidebarInset className="min-w-0 bg-background">
          <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-4 text-foreground">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />

              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />

              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage><DashboardTitle /></BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          <main className="min-w-0 flex min-h-screen flex-1 flex-col gap-4 bg-background p-4 text-foreground">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}