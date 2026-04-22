export const THEME_COLORS = {
  dark: {
    bg: "#07090F",
    surface: "#0E1117",
    card: "#141820",
    border: "#1E2530",
    accent: "#3B82F6",
    text: "#F1F5F9",
    muted: "#64748B",
    subtle: "#1A2030",
  },
  light: {
    bg: "#F5F7FB",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    border: "#D6DEE9",
    accent: "#2563EB",
    text: "#0F172A",
    muted: "#475569",
    subtle: "#EEF2F7",
  },
}

export const C = { ...THEME_COLORS.dark }

export function applyThemeColors(theme) {
  const palette = THEME_COLORS[theme] || THEME_COLORS.dark
  Object.assign(C, palette)
}

export const STATUS_COLORS = {
  Open: "#3B82F6",
  "In Progress": "#F59E0B",
  Pending: "#8B5CF6",
  Resolved: "#10B981",
  Closed: "#6B7280",
};

export const PRIORITY_COLORS = {
  Low: "#10B981",
  Medium: "#F59E0B",
  High: "#EF4444",
  Urgent: "#DC2626",
};

export const DIR_COLORS = {
  "Front→Back": "#3B82F6",
  "Back→Front": "#8B5CF6",
};

export const ROLE_COLORS = {
  admin: "#F59E0B",
  front: "#3B82F6",
  back: "#8B5CF6",
};

export const CATEGORIES = ["Dossier", "Paiement", "Inscription", "Visa", "Autre"];
export const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
export const STATUSES = ["Open", "In Progress", "Pending", "Resolved", "Closed"];
export const DIRECTIONS = ["Front→Back", "Back→Front"];
