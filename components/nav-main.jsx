"use client"

import { 
  IconCirclePlusFilled,
  IconChevronRight
} from "@tabler/icons-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const MenuSeparator = () => (
  <div className="h-px w-full bg-border my-2" />
);

export function NavMain({ items }) {
  const [expandedItems, setExpandedItems] = useState({});
  const pathname = usePathname();

  const toggleItem = (title) => {
    setExpandedItems(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isActive = (url, exact = false) => {
    if (exact) return pathname === url;
    return pathname.startsWith(url);
  };

  const SeparatorComponent = SidebarSeparator || MenuSeparator;

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-1">
        {/* Quick Actions Section */}
        <SidebarMenu>
          <SidebarMenuItem>
            <Button 
              asChild
              variant="ghost" 
              className="w-full justify-start gap-2 bg-primary/5 hover:bg-primary/10 text-primary"
            >
              <Link href="/products/new">
                <IconCirclePlusFilled className="h-4 w-4" />
                <span>Add New Product</span>
              </Link>
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>

        <SeparatorComponent />

        {/* Main Navigation */}
        <SidebarMenu>
          {items.map((item) => (
            <div key={item.title} className="flex flex-col">
              <SidebarMenuItem>
                <SidebarMenuButton 
                  asChild={!item.items}
                  onClick={() => item.items && toggleItem(item.title)}
                  className={`group ${isActive(item.url, item.exact) ? 'active' : ''}`}
                >
                  {item.items ? (
                    <div className="flex items-center w-full">
                      <div className="flex items-center gap-2 flex-1">
                        {item.icon && <item.icon className="h-5 w-5" />}
                        <span>{item.title}</span>
                      </div>
                      
                      {item.badge && (
                        <span className="ml-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                          {typeof item.badge === 'string' ? (
                            <span className="text-xs uppercase">{item.badge}</span>
                          ) : item.badge}
                        </span>
                      )}
                      
                      {item.items && (
                        <IconChevronRight 
                          className={`h-4 w-4 ml-2 transition-transform ${
                            expandedItems[item.title] ? 'rotate-90' : ''
                          }`} 
                        />
                      )}
                    </div>
                  ) : (
                    <Link 
                      href={item.url} 
                      className={`flex items-center gap-2 flex-1 ${isActive(item.url, item.exact) ? 'active' : ''}`}
                    >
                      {item.icon && <item.icon className="h-5 w-5" />}
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                          {typeof item.badge === 'string' ? (
                            <span className="text-xs uppercase">{item.badge}</span>
                          ) : item.badge}
                        </span>
                      )}
                    </Link>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>

              {item.items && expandedItems[item.title] && (
                <div className="ml-6 pl-2 border-l-2 border-muted">
                  {item.items.map((subItem) => (
                    <SidebarMenuItem key={subItem.title}>
                      <SidebarMenuButton 
                        asChild
                        className={isActive(subItem.url) ? 'active' : ''}
                      >
                        <Link href={subItem.url} className="pl-8">
                          {subItem.icon && <subItem.icon className="h-4 w-4 mr-2" />}
                          <span>{subItem.title}</span>
                          {subItem.badge && (
                            <span className="ml-auto bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                              {subItem.badge}
                            </span>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </div>
              )}
            </div>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}