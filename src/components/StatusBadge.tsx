"use client";

import { PROJECT_STATUSES } from "@/lib/constants";

export default function StatusBadge({ status }: { status: string }) {
  const found = PROJECT_STATUSES.find(s => s.value === status);
  if (!found) return null;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${found.color}`}>
      {found.label}
    </span>
  );
}
