import type { Chat } from "generated/prisma";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./sidebar";
import { Link } from "react-router";
import type { ReactNode } from "react";

export function AppLayout({
  chats,
  activeChatId,
  children,
}: {
  chats: Chat[];
  activeChatId?: Chat["id"];
  children?: ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Chats</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    variant="outline"
                    asChild
                    className="w-fit flex justify-center items-center min-h-10 min-w-10 mb-1 ml-2 border-1 bg-white"
                  >
                    <Link to="/">+</Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                {chats.map((chat) => (
                  <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      isActive={chat.id === activeChatId}
                      asChild
                    >
                      <Link to={`/chats/${chat.id}`} className="block">
                        <div className="truncate mb-1">{chat.name}</div>
                        <div className="ml-auto text-[0.7em] opacity-50">
                          {chat.created_at.toLocaleDateString()}{" "}
                          {chat.created_at.toLocaleTimeString()}
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="relative grow h-screen flex flex-col">
        <SidebarTrigger />
        <div className="p-2 pt-0 grow flex flex-col justify-center overflow-hidden">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
}
