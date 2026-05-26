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
        duration: 0.4,
        ease: "easeOut",
      });
      return controls.stop;
    }, [value, motionValue]);

    return (
      <motion.div
        ref={ref}
        className={cn(
          "group relative rounded-2xl p-3.5 card-elevated text-center cursor-default overflow-hidden",
          className
        )}
        transition={{ duration: 0.15 }}
        {...(props as any)}
      >
        {/* Glow on hover */}
        <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[radial-gradient(circle_at_50%_0%,hsl(var(--primary)/0.18),transparent_70%)]" />

        <motion.div
          className="flex justify-center mb-1 relative"
          transition={{ duration: 0.15 }}
        >
          {icon}
        </motion.div>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5 relative">
          {label}
        </p>
        {placeholder ? (
          <p className={cn("text-sm font-bold relative", valueClassName)}>{placeholder}</p>
        ) : (
          <motion.p className={cn("text-sm font-bold relative", valueClassName)}>
            {display}
          </motion.p>
        )}
      </motion.div>
    );
  }
);

StatCard.displayName = "StatCard";

export { StatCard };
