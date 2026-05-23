"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "inputMode" | "pattern">;

export const MoneyInput = forwardRef<HTMLInputElement, Props>(function MoneyInput(props, ref) {
  return (
    <Input
      ref={ref}
      type="text"
      inputMode="decimal"
      pattern="[0-9]*[.,]?[0-9]*"
      autoComplete="off"
      placeholder="0,00"
      style={{ fontSize: "16px" }}
      {...props}
    />
  );
});
