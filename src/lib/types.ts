export interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  bio: string | null;
  location: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  row_count: number;
  color_index: number;
  status: "in_progress" | "finished" | "hibernating" | "frogged";
  craft: "knitting" | "crochet";
  pattern_name: string | null;
  pattern_id: string | null;
  yarn_id: string | null;
  needle_size: string | null;
  gauge: string | null;
  started_at: string | null;
  completed_at: string | null;
  notes: string | null;
  photos: string[];
  progress: number;
  made_for: string | null;
  happiness: number;
  created_at: string;
}

export interface Pattern {
  id: string;
  user_id: string;
  name: string;
  author: string | null;
  craft: "knitting" | "crochet";
  category: string | null;
  yarn_weight: string | null;
  needle_size: string | null;
  gauge: string | null;
  yardage: number | null;
  description: string | null;
  photos: string[];
  is_free: boolean;
  price: number | null;
  url: string | null;
  difficulty: number;
  created_at: string;
}

export interface StashYarn {
  id: string;
  user_id: string;
  yarn_name: string;
  brand: string | null;
  color: string | null;
  colorway: string | null;
  weight: string;
  fiber_content: string | null;
  yardage: number | null;
  skeins: number;
  notes: string | null;
  photos: string[];
  created_at: string;
}

export interface QueueItem {
  id: string;
  user_id: string;
  pattern_id: string | null;
  pattern_name: string;
  notes: string | null;
  priority: number;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  pattern_id: string;
  created_at: string;
  pattern?: Pattern;
}
