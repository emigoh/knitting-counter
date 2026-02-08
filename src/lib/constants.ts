export const PROJECT_COLORS = [
  { bg: "bg-rose-500", light: "bg-rose-100", text: "text-rose-600", border: "border-rose-500", hex: "#f43f5e" },
  { bg: "bg-sky-500", light: "bg-sky-100", text: "text-sky-600", border: "border-sky-500", hex: "#0ea5e9" },
  { bg: "bg-amber-500", light: "bg-amber-100", text: "text-amber-600", border: "border-amber-500", hex: "#f59e0b" },
  { bg: "bg-emerald-500", light: "bg-emerald-100", text: "text-emerald-600", border: "border-emerald-500", hex: "#10b981" },
  { bg: "bg-violet-500", light: "bg-violet-100", text: "text-violet-600", border: "border-violet-500", hex: "#8b5cf6" },
  { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-600", border: "border-orange-500", hex: "#f97316" },
  { bg: "bg-teal-500", light: "bg-teal-100", text: "text-teal-600", border: "border-teal-500", hex: "#14b8a6" },
  { bg: "bg-pink-500", light: "bg-pink-100", text: "text-pink-600", border: "border-pink-500", hex: "#ec4899" },
  { bg: "bg-indigo-500", light: "bg-indigo-100", text: "text-indigo-600", border: "border-indigo-500", hex: "#6366f1" },
  { bg: "bg-lime-500", light: "bg-lime-100", text: "text-lime-600", border: "border-lime-500", hex: "#84cc16" },
];

export const PROJECT_STATUSES = [
  { value: "in_progress", label: "In Progress", color: "bg-blue-100 text-blue-700" },
  { value: "finished", label: "Finished", color: "bg-green-100 text-green-700" },
  { value: "hibernating", label: "Hibernating", color: "bg-amber-100 text-amber-700" },
  { value: "frogged", label: "Frogged", color: "bg-red-100 text-red-700" },
] as const;

export const CRAFT_TYPES = [
  { value: "knitting", label: "Knitting" },
  { value: "crochet", label: "Crochet" },
] as const;

export const YARN_WEIGHTS = [
  { value: "lace", label: "Lace" },
  { value: "fingering", label: "Fingering" },
  { value: "sport", label: "Sport" },
  { value: "dk", label: "DK" },
  { value: "worsted", label: "Worsted" },
  { value: "aran", label: "Aran" },
  { value: "bulky", label: "Bulky" },
  { value: "super_bulky", label: "Super Bulky" },
] as const;

export const PATTERN_CATEGORIES = [
  { value: "hat", label: "Hat" },
  { value: "scarf", label: "Scarf" },
  { value: "cowl", label: "Cowl" },
  { value: "shawl", label: "Shawl" },
  { value: "sweater", label: "Sweater" },
  { value: "cardigan", label: "Cardigan" },
  { value: "vest", label: "Vest" },
  { value: "socks", label: "Socks" },
  { value: "mittens", label: "Mittens" },
  { value: "gloves", label: "Gloves" },
  { value: "blanket", label: "Blanket" },
  { value: "bag", label: "Bag" },
  { value: "toy", label: "Toy" },
  { value: "home_decor", label: "Home Decor" },
  { value: "other", label: "Other" },
] as const;

export const HAPPINESS_LABELS = [
  "",
  "Not happy",
  "Meh",
  "It's okay",
  "Happy",
  "Love it!",
] as const;
