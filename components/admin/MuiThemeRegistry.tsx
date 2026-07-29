"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeProvider, createTheme } from "@mui/material/styles";

/**
 * MUI theme for the admin dashboard's charts (@mui/x-charts). Scoped to
 * /admin only — no CssBaseline, so it never touches the Tailwind-styled
 * public site. Colors mirror the forest-moss / espresso brand tokens in
 * app/globals.css so chart defaults (gridlines, legend text, tooltips) match
 * the rest of the dashboard without every chart having to override them.
 */
const theme = createTheme({
  palette: {
    primary: { main: "#427c04" }, // forest-moss-700
    secondary: { main: "#652323" }, // espresso
    text: { primary: "#0f172a", secondary: "#64748b" }, // slate-900 / slate-500
    divider: "#e2e8f0", // slate-200
  },
  typography: {
    fontFamily: "inherit",
  },
  shape: { borderRadius: 8 },
});

export default function MuiThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ key: "mui-admin" }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </AppRouterCacheProvider>
  );
}
