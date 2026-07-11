export const ROUTES = {
  home: "/", dashboard: "/dashboard", projects: "/projects", studio: "/studio",
  templates: "/templates", video: "/video", gallery: "/gallery", growth: "/growth",
  premium: "/premium", support: "/support", login: "/login", pricing: "/pricing",
  settings: "/settings",
} as const;

export type AppRoute = typeof ROUTES[keyof typeof ROUTES];
