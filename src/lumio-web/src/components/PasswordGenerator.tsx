"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RefreshCw, Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

interface PasswordGeneratorProps {
  onUse: (password: string) => void;
}

const LOWERCASE = "abcdefghijklmnopqrstuvwxyz";
const UPPERCASE = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SPECIAL = "!@#$%^&*()_+-=[]{}|;:,.<>?";

function generatePassword(
  length: number,
  useUppercase: boolean,
  useDigits: boolean,
  useSpecial: boolean
): string {
  let charset = LOWERCASE;
  if (useUppercase) charset += UPPERCASE;
  if (useDigits) charset += DIGITS;
  if (useSpecial) charset += SPECIAL;

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);

  let password = Array.from(array)
    .map((n) => charset[n % charset.length])
    .join("");

  // Ensure at least one of each required character type
  const required: string[] = [LOWERCASE[Math.floor(Math.random() * LOWERCASE.length)]];
  if (useUppercase) required.push(UPPERCASE[Math.floor(Math.random() * UPPERCASE.length)]);
  if (useDigits) required.push(DIGITS[Math.floor(Math.random() * DIGITS.length)]);
  if (useSpecial) required.push(SPECIAL[Math.floor(Math.random() * SPECIAL.length)]);

  // Replace first N characters with required chars (then shuffle)
  const chars = password.split("");
  required.forEach((c, i) => {
    if (i < chars.length) chars[i] = c;
  });
  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}

export function PasswordGenerator({ onUse }: PasswordGeneratorProps) {
  const [expanded, setExpanded] = useState(false);
  const [length, setLength] = useState(20);
  const [useUppercase, setUseUppercase] = useState(true);
  const [useDigits, setUseDigits] = useState(true);
  const [useSpecial, setUseSpecial] = useState(true);
  const [generated, setGenerated] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const pw = generatePassword(length, useUppercase, useDigits, useSpecial);
    setGenerated(pw);
    setCopied(false);
  }, [length, useUppercase, useDigits, useSpecial]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generated);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUse = () => {
    onUse(generated);
    setExpanded(false);
  };

  return (
    <div className="rounded-md border bg-muted/30 p-3">
      <button
        type="button"
        onClick={() => {
          setExpanded(!expanded);
          if (!expanded && !generated) generate();
        }}
        className="flex w-full items-center justify-between text-sm font-medium text-primary"
      >
        <span className="flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5" />
          Wachtwoord generator
        </span>
        {expanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {/* Generated password display */}
          {generated && (
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded border bg-background px-3 py-2 text-sm font-mono break-all">
                {generated}
              </code>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          )}

          {/* Options */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Lengte: {length}</Label>
              <input
                type="range"
                min={8}
                max={64}
                value={length}
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full accent-primary"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Opties</Label>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={useUppercase}
                    onChange={(e) => setUseUppercase(e.target.checked)}
                    className="accent-primary"
                  />
                  ABC
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={useDigits}
                    onChange={(e) => setUseDigits(e.target.checked)}
                    className="accent-primary"
                  />
                  123
                </label>
                <label className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={useSpecial}
                    onChange={(e) => setUseSpecial(e.target.checked)}
                    className="accent-primary"
                  />
                  !@#
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generate}
              className="gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Nieuw
            </Button>
            {generated && (
              <Button
                type="button"
                size="sm"
                onClick={handleUse}
                className="gap-1"
              >
                Gebruik dit wachtwoord
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
