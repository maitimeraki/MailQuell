import React, { lazy, Suspense } from "react";
import { Routes, Route } from "react-router";
import HomePage from "@/pages/Home-Page";
import { Dashboard } from "../pages/Dashboard-Page";
const Overview = lazy(() => import("@/components/Overview"));
const ActivityFeed = lazy(() => import("@/components/ActivityFeed"));
const TagInputs = lazy(() => import("@/components/TagInputs"));
// const TagPages = lazy(() => import("@/components/TagPages"));
// const TagExplorer = lazy(() => import("@/components/TagExplorer"));
// const RulesList = lazy(() => import("@/components/RulesList"));
// const RuleComposer = lazy(() => import("@/components/RuleComposer"));
// const RuleRuns = lazy(() => import("@/components/RuleRuns"));
// const VolumeTrends = lazy(() => import("@/components/analytics/VolumeTrends"));
// const Performance = lazy(() => import("@/components/analytics/Performance"));
// const Insights = lazy(() => import("@/components/analytics/Insights"));
// const Exports = lazy(() => import("@/components/analytics/Exports"));
// const Usage = lazy(() => import("@/components/Usage"));
// const Billing = lazy(() => import("@/components/Billing"));
// const Members = lazy(() => import("@/components/Members"));
// const Roles = lazy(() => import("@/components/Roles"));
// const AuditLog = lazy(() => import("@/components/AuditLog"));
// const Accounts = lazy(() => import("@/components/integrations/Accounts"));
// const ApiKeys = lazy(() => import("@/components/integrations/ApiKeys"));
// const Webhooks = lazy(() => import("@/components/integrations/Webhooks"));
// const Marketplace = lazy(() => import("@/components/integrations/Marketplace"));
const Profile = lazy(() => import("@/components/settings/Profile"));
// const Workspace = lazy(() => import("@/components/settings/Workspace"));
// const Security = lazy(() => import("@/components/settings/Security"));
// const Notifications = lazy(() => import("@/components/settings/Notifications"));
export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/mail" element={<Dashboard />}>
        {/* This is the index route for the root path */}
        <Route index element={<Overview />} />
        <Route path="overview" element={<Overview />} />
        <Route path="activity" element={<ActivityFeed />} />
        <Route path="tag-inputs" element={<TagInputs />} />
        {/* <Route path="tag-pages" element={<TagPages />} />
      <Route path="tag-explorer" element={<TagExplorer />} />
      <Route path="rules" element={<RulesList />} />
      <Route path="rule-composer" element={<RuleComposer />} />
      <Route path="rule-runs" element={<RuleRuns />} />
      <Route path="analytics/volume" element={<VolumeTrends />} />
      <Route path="analytics/performance" element={<Performance />} />
      <Route path="analytics/insights" element={<Insights />} />
      <Route path="analytics/exports" element={<Exports />} />
      <Route path="usage" element={<Usage />} />
      <Route path="billing" element={<Billing />} />
      <Route path="members" element={<Members />} />
      <Route path="roles" element={<Roles />} />
      <Route path="audit-log" element={<AuditLog />} />
      <Route path="integrations/accounts" element={<Accounts />} />
      <Route path="integrations/api-keys" element={<ApiKeys />} />
      <Route path="integrations/webhooks" element={<Webhooks />} />
      <Route path="integrations/marketplace" element={<Marketplace />} /> */}
        <Route path="settings/profile" element={<Profile />} />
        {/* <Route path="settings/workspace" element={<Workspace />} />
      <Route path="settings/security" element={<Security />} />
      <Route path="settings/notifications" element={<Notifications />} /> */}
      </Route>
    </Routes>
  );
}

// export default AppRoutes;
