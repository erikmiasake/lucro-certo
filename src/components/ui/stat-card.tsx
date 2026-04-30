"use client";

import * as React from "react";
import { useSpring, useTransform, animate, motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: number;
  icon: React.ReactNode;
  /** Format the animated number for display */
  format?: (n: number) => string;
  /** Tailwind class for the value color */
  valueClassName?: string;
  /** Skip animation and show this string instead (e.g. "—") */
  placeholder?: string;
}

const StatCard = React.forwardRef<HTMLDivElement, StatCardProps>(
  (
    { label, value, icon, format, valueClassName, placeholder, className, ...props },
    ref
  ) => {
    const motionValue = useSpring(0, { damping: 30, stiffness: 90 });
    const display = useTransform(motionValue, (latest) =>
      format ? format(latest) : Math.round(latest).toString()
    );

    React.useEffect(() => {
      const controls = animate(motionValue, value, {
        duration: 1.2,
        ease: "easeOut",
      });
      return controls.stop;
    }, [value, motionValue]);

    return (
      <div
        ref={ref}
        className={cn("rounded-2xl p-3.5 card-elevated text-center", className)}
        {...props}
      >
        <div className="flex justify-center mb-1">{icon}</div>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">
          {label}
        </p>
        {placeholder ? (
          <p className={cn("text-sm font-bold", valueClassName)}>{placeholder}</p>
        ) : (
          <motion.p className={cn("text-sm font-bold", valueClassName)}>
            {display}
          </motion.p>
        )}
      </div>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };
