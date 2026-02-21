"use client";

import { useMemo } from "react";

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
}

function evaluateStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: "", color: "" };

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

  const levels: StrengthResult[] = [
    { score: 0, label: "Zeer zwak", color: "bg-red-500" },
    { score: 1, label: "Zwak", color: "bg-orange-500" },
    { score: 2, label: "Matig", color: "bg-yellow-500" },
    { score: 3, label: "Sterk", color: "bg-green-500" },
    { score: 4, label: "Zeer sterk", color: "bg-green-600" },
  ];

  return levels[score];
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => evaluateStrength(password), [password]);

  if (!password) return null;

  const checks = [
    { met: password.length >= 8, label: "Minimaal 8 tekens" },
    { met: /[a-z]/.test(password) && /[A-Z]/.test(password), label: "Hoofd- en kleine letters" },
    { met: /\d/.test(password), label: "Minimaal 1 cijfer" },
    { met: /[^a-zA-Z0-9]/.test(password), label: "Minimaal 1 speciaal teken" },
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
          {strength.label}
        </span>
      </div>

      {/* Requirements checklist */}
      <ul className="space-y-1">
        {checks.map((check) => (
          <li
            key={check.label}
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
