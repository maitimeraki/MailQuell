import { useState } from "react";
// import "./App.css";
import { Route, Routes } from "react-router";
import HomePage from "./pages/Home-Page";
// import { Dashboard } from "./pages/Dashboard-Page";
// import PricingPage from "./pages/Pricing-Page";
import { AppRoutes } from "./routes/AppRoutes";
import { useAutoLogin } from "./hooks/useAutoLogin";
function App() {

  return <AppRoutes />;
}

export default App;
