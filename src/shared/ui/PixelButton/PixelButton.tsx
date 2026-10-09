import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "@/shared/lib/css/cx";
import "./PixelButton.css";

type Variant = "primary" | "secondary";

function buttonClass(variant: Variant, className?: string) {
  return cx("pixel-button", variant === "secondary" && "pixel-button--secondary", className);
}

type PixelButtonProps = ComponentProps<"button"> & { variant?: Variant };

export function PixelButton({ variant = "primary", className, type = "button", ...props }: PixelButtonProps) {
  return <button type={type} className={buttonClass(variant, className)} {...props} />;
}

type PixelLinkButtonProps = ComponentProps<typeof Link> & { variant?: Variant };

export function PixelLinkButton({ variant = "primary", className, ...props }: PixelLinkButtonProps) {
  return <Link className={buttonClass(variant, className)} {...props} />;
}
