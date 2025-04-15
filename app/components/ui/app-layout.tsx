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
                    className="justify-center"
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
                      <Link to={`/chats/${chat.id}`} className="truncate">
                        {chat.name} - {chat.created_at.toLocaleDateString()}{" "}
                        {chat.created_at.toLocaleTimeString()}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>
      <main className="grow">
        <SidebarTrigger />
        <div className="p-2">{children}</div>
      </main>
    </SidebarProvider>
  );
}
