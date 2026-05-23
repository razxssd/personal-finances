"use client";

import { ReactElement, ReactNode, cloneElement } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
} from "@/components/ui/drawer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useKeyboardOffset } from "@/lib/hooks/useVisualViewport";
import { useIsDesktop } from "@/lib/hooks/useMediaQuery";

type Props = {
  trigger?: ReactElement<{ onClick?: (e: React.MouseEvent) => void }>;
  open?: boolean;
  onOpenChange?: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function BottomSheet(props: Props) {
  const isDesktop = useIsDesktop();
  return isDesktop ? <DesktopDialog {...props} /> : <MobileDrawer {...props} />;
}

function DesktopDialog({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: Props) {
  const triggerWithOnClick = trigger
    ? cloneElement(trigger, {
        onClick: (e: React.MouseEvent) => {
          trigger.props.onClick?.(e);
          onOpenChange?.(true);
        },
      })
    : null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {triggerWithOnClick}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}

function MobileDrawer({
  trigger,
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
}: Props) {
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
