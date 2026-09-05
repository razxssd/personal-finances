"use client";

import { ReactElement, ReactNode, cloneElement, useState } from "react";
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
import { PopupContainerProvider } from "@/components/ui/popup-container";
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
  // The drawer node doubles as the portal target for Select/Popover popups:
  // portalled to <body> they would be untouchable while the drawer is open.
  const [contentEl, setContentEl] = useState<HTMLDivElement | null>(null);

  // No manual keyboard handling here: vaul repositions the drawer itself
  // (`repositionInputs`, on by default) and reads the drawer's own transform to
  // track the drag, so writing a transform of ours on top fought both.
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      {trigger ? <DrawerTrigger asChild>{trigger}</DrawerTrigger> : null}
      <DrawerContent ref={setContentEl} className="px-4">
        <PopupContainerProvider container={contentEl}>
          <DrawerHeader className="shrink-0 px-0 text-left">
            <DrawerTitle>{title}</DrawerTitle>
            {description ? <DrawerDescription>{description}</DrawerDescription> : null}
          </DrawerHeader>
          {/* The body is the scroller, not the sheet. With the keyboard up the sheet
              is short, and a field below the fold has to be reachable by scrolling
              rather than by dragging the sheet (which vaul reads as a dismiss). */}
          <div className="-mx-4 min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-2">
            <div className="space-y-4">{children}</div>
          </div>
          {footer ? (
            <DrawerFooter className="shrink-0 px-0">{footer}</DrawerFooter>
          ) : null}
        </PopupContainerProvider>
      </DrawerContent>
    </Drawer>
  );
}
