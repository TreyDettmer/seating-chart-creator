"use client";
import { AppProvider } from "./app-context";
import Dashboard from "./components/dashboard";

export default function Home() {
  return (
    <AppProvider>
      <Dashboard></Dashboard>
    </AppProvider>
    
  );
}
