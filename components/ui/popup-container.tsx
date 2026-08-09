"use client"

import * as React from "react"

/**
 * The element that portalled popups (Popover, Select) should render into.
 *
 * Inside a vaul Drawer this matters: vaul is a modal Radix dialog, so while the
 * drawer is open Radix sets `pointer-events: none` on <body>. A popup portalled
 * to <body> inherits that — it is painted but not touchable, and taps fall
 * through to whatever sits underneath (often the overlay, which dismisses the
 * drawer). Rendering the popup inside the drawer content keeps it interactive.
 *
 * `null` (the default, outside any drawer) means "portal to <body>" as usual.
 */
const PopupContainerContext = React.createContext<HTMLElement | null>(null)

export function PopupContainerProvider({
  container,
  children,
}: {
  container: HTMLElement | null
  children: React.ReactNode
}) {
  return (
    <PopupContainerContext.Provider value={container}>
      {children}
    </PopupContainerContext.Provider>
  )
}

export function usePopupContainer() {
  return React.useContext(PopupContainerContext)
}
