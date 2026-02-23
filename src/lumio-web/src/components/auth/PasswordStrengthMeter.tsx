"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthResult {
  score: number; // 0-4
  color: string;
}

const STRENGTH_COLORS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-green-600",
];

function evaluateStrength(password: string): StrengthResult {
  if (!password) return { score: 0, color: "" };

  let score = 0;

  // Length checks
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // Character variety
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  // Cap at 4
  score = Math.min(score, 4);

  return { score, color: STRENGTH_COLORS[score] };
}

const STRENGTH_LABEL_KEYS = [
  "zeerZwak",
  "zwak",
  "matig",
  "sterk",
  "zeerSterk",
] as const;

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => evaluateStrength(password), [password]);
  const t = useTranslations("auth.wachtwoordsterkte");

  if (!password) return null;

  const checks = [
    { met: password.length >= 8, label: t("minimaalTekens") },
    { met: /[a-z]/.test(password) && /[A-Z]/.test(password), label: t("hoofdletters") },
    { met: /\d/.test(password), label: t("cijfer") },
    { met: /[^a-zA-Z0-9]/.test(password), label: t("speciaalTeken") },
  ];

  return (
    <div className="space-y-2">
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < strength.score ? strength.color : "bg-muted"
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground w-20 text-right">
          {t(STRENGTH_LABEL_KEYS[strength.score])}
        </span>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1">
        {checks.map((check, i) => (
          <li
            key={i}
            className={`text-xs flex items-center gap-1.5 ${
              check.met ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            <span>{check.met ? "\u2713" : "\u2022"}</span>
            {check.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
