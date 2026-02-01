"use client"

import React from "react"
import {
  Accordion as AccordionPrimitive,
  AccordionItem as AccordionPrimitiveItem,
  AccordionHeader,
  AccordionTrigger as AccordionPrimitiveTrigger,
  AccordionContent as AccordionPrimitiveContent
} from "@radix-ui/react-accordion"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

const Accordion = AccordionPrimitive

const AccordionItem = React.forwardRef(({ className, ...props }, ref) => (
  <AccordionPrimitiveItem
    ref={ref}
    className={cn("border-b", className)}
    {...props}
  />
))
AccordionItem.displayName = "AccordionItem"

const AccordionTrigger = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionHeader className="flex">
    <AccordionPrimitiveTrigger
      ref={ref}
      className={cn(
        "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200" />
    </AccordionPrimitiveTrigger>
  </AccordionHeader>
))
AccordionTrigger.displayName = AccordionPrimitiveTrigger.displayName

const AccordionContent = React.forwardRef(({ className, children, ...props }, ref) => (
  <AccordionPrimitiveContent
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </AccordionPrimitiveContent>
))

AccordionContent.displayName = AccordionPrimitiveContent.displayName

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }