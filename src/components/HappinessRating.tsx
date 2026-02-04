"use client";

import { HAPPINESS_LABELS } from "@/lib/constants";

interface HappinessRatingProps {
  value: number;
  onChange?: (value: number) => void;
  readonly?: boolean;
}

const faces = ["", ":(", ":|", ":)", ":D", "<3"];

export default function HappinessRating({ value, onChange, readonly = false }: HappinessRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((level) => (
        <button
          key={level}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(value === level ? 0 : level)}
          className={`flex h-8 w-8 items-center justify-center rounded-full text-sm transition-all ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } ${
            level <= value
              ? level <= 2
                ? "bg-red-100 text-red-500"
                : level <= 3
                ? "bg-amber-100 text-amber-500"
                : "bg-green-100 text-green-500"
              : "bg-zinc-100 text-zinc-300 dark:bg-zinc-700 dark:text-zinc-500"
          }`}
          title={HAPPINESS_LABELS[level]}
        >
          {level <= 2 ? (level === 1 ? "😞" : "😐") : level === 3 ? "🙂" : level === 4 ? "😊" : "😍"}
        </button>
      ))}
      {value > 0 && (
        <span className="ml-2 text-xs text-zinc-500">{HAPPINESS_LABELS[value]}</span>
      )}
    </div>
  );
}
