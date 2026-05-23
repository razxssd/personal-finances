"use client";

import { ReactNode } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useKeyboardOffset } from "@/lib/hooks/useVisualViewport";

export function BottomSheet({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: {
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const offset = useKeyboardOffset();
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
      <DrawerContent
        style={{ transform: offset > 0 ? `translateY(-${offset}px)` : undefined }}
        className="px-4 transition-transform duration-150"
      >
        <DrawerHeader className="px-0 text-left">
          <DrawerTitle>{title}</DrawerTitle>
          {description ? <DrawerDescription>{description}</DrawerDescription> : null}
        </DrawerHeader>
        <div className="space-y-4 pb-2">{children}</div>
        {footer ? <DrawerFooter className="px-0">{footer}</DrawerFooter> : null}
      </DrawerContent>
    </Drawer>
  );
}
