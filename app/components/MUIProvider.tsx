"use client";

import * as React from "react";
import { ThemeProvider, createTheme, CssBaseline } from "@mui/material";
import { amber, deepOrange, grey } from "@mui/material/colors";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: amber[600],
    },
    secondary: {
      main: deepOrange[500],
    },
    background: {
      default: grey[50],
      paper: "#ffffff",
    },
  },
  typography: {
    fontFamily: '"Geist", "Inter", Roboto, Helvetica, Arial, sans-serif',
  },
});

export default function MUIProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
