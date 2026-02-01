"use client"

import * as React from "react"
import {
  IconDashboard,
  IconShoppingBag,
  IconShoppingCart,
  IconPackage,
  IconTruckDelivery,
  IconUsers,
  IconChartBar,
  IconDiscount,
  IconSpeakerphone,
  IconSettings,
  IconHelp,
  IconLogout,
  IconWallet,
  IconStar,
  IconMessage,
  IconCategory,
  IconBrandAppgallery,
  IconFileReport,
  IconBuildingStore,
  IconCashBanknote,
  IconSearch,
  IconUserCog,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "Pamarel Admin",
    email: "pamarelfoods@gmail.com",
    avatar: "/avatars/admin.jpg",
    role: "Super Admin",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: IconDashboard,
      exact: true,
    },
    {
      title: "Orders",
      url: "/admin//orders",
      icon: IconShoppingCart,
      // badge: 12,
      items: [
        {
          title: "All Orders",
          url: "/admin/orders",
        },
        {
          title: "Pending",
          url: "/admin/orders?status=pending",
          // badge: 5,
        },
        {
          title: "Processing",
          url: "/admin/orders?status=processing",
          // badge: 3,
        },
        {
          title: "Delivered",
          url: "/admin/orders?status=delivered",
        },
        {
          title: "Cancelled",
          url: "/admin/orders?status=cancelled",
          // badge: 2,
        },
        {
          title: "Returns",
          url: "/admin/orders?status=return",
          // badge: 2,
        },
      ],
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: IconShoppingBag,
      items: [
        {
          title: "Add New",
          url: "/admin/products/new",
        },
        {
          title: "Categories",
          url: "/admin/products/categories",
          icon: IconCategory,
        },
        // {
        //   title: "Brands",
        //   url: "/admin/brands",
        //   icon: IconBrandAppgallery,
        // },
        {
          title: "Inventory",
          url: "/admin/products/inventory",
          icon: IconPackage,
        },
      ],
    },
    {
      title: "Reviews",
      url: "/admin/reviews",
      icon: IconStar,
      // badge: 24,
    },
    {
      title: "Shipping",
      url: "/admin/shipping",
      icon: IconSettings,
    },
    {
      title: "Customers",
      url: "/admin/customers",
      icon: IconUsers,
      // badge: "New",
    },
    {
      title: "Transactions",
      url: "/admin/transactions",
      icon: IconCashBanknote,
    },
    // {
    //   title: "Marketing",
    //   url: "/admin/marketing",
    //   icon: IconSpeakerphone,
    //   items: [
    //     {
    //       title: "Promotions",
    //       url: "/admin/promotions",
    //       icon: IconDiscount,
    //     },
    //     {
    //       title: "Coupons",
    //       url: "/admin/coupons",
    //     },
    //     // {
    //     //   title: "Email Campaigns",
    //     //   url: "/marketing/email",
    //     // },
    //     // {
    //     //   title: "Push Notifications",
    //     //   url: "/marketing/notifications",
    //     // },
    //   ],
    // },
    // {
    //   title: "Payments",
    //   url: "/admin/payments",
    //   icon: IconCashBanknote,
    // },
    // {
    //   title: "Store Setup",
    //   url: "/admin/store",
    //   icon: IconBuildingStore,
    //   items: [
    //     {
    //       title: "General",
    //       url: "/admin/store/general",
    //     },
    //     {
    //       title: "Shipping",
    //       url: "/admin/store/shipping",
    //       icon: IconTruckDelivery,
    //     },
    //   ],
    // },
  ],
  // navSecondary: [
  //   {
  //     title: "Help Center",
  //     url: "/admin/help",
  //     icon: IconHelp,
  //   },
  // ],
}

export function AppSidebar({
  ...props
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/" className="flex items-center gap-2">
                <div className="bg-primary text-white p-2 rounded-lg">
                  <IconShoppingBag className="!size-5" />
                </div>
                <span className="text-base font-semibold">Pamarel Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}