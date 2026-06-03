"use client";

import { PASSWORD_CHECKS, areAllPasswordRulesMet } from "@/app/lib/shema";
import { type ReactNode, useMemo, useState } from "react";

type PasswordRulesPopoverProps = {
  password: string;
  inputId?: string;
  children: (props: {
    id: string;
    onFocus: () => void;
    onBlur: () => void;
  }) => ReactNode;
};

export default function PasswordRulesPopover({
  password,
  inputId = "password",
  children,
}: PasswordRulesPopoverProps) {
  const [focused, setFocused] = useState(false);

  const rules = useMemo(
    () => PASSWORD_CHECKS.map((rule) => ({ ...rule, met: rule.test(password) })),
    [password],
  );

  const allMet = areAllPasswordRulesMet(password);
  const open = focused && !allMet;

  return (
    <div className="relative">
      {children({
        id: inputId,
        onFocus: () => setFocused(true),
        onBlur: () => setFocused(false),
      })}

      {open && (
        <div
          role="dialog"
          aria-label="Password requirements"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20"
        >
          <div className="rounded-xl border border-rose-600/50 bg-surface-popover px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.55),0_0_20px_rgba(244,63,94,0.15)]">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-200">
              Password must include
            </p>
            <ul className="space-y-1.5">
              {rules.map((rule) => (
                <li
                  key={rule.id}
                  className={`flex items-start gap-2 text-sm transition-colors ${
                    rule.met ? "text-emerald-300" : "text-rose-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      rule.met
                        ? "bg-emerald-500/25 text-emerald-300"
                        : "bg-rose-500/15 text-rose-300/70"
                    }`}
                    aria-hidden
                  >
                    {rule.met ? "✓" : "·"}
                  </span>
                  <span>{rule.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
