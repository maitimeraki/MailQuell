export function navGroups() {
    return [
    {
      label: "HOME",
      items: [
        { to: "/mail/overview", label: "Overview", icon: "fa-solid fa-chart-line" },
        { to: "/mail/activity", label: "Activity Feed", icon: "fa-solid fa-clock-rotate-left" }
      ]
    },
    {
      label: "TAG MANAGEMENT",
      items: [
        { to: "/mail/tag-inputs", label: "Tag Inputs", icon: "fa-solid fa-list-check" },
        // { to: "/mail/tag-pages", label: "Tag Pages", icon: "fa-solid fa-tags" },
        // { to: "/mail/tag-explorer", label: "Tag Explorer", icon: "fa-solid fa-magnifying-glass" }
      ]
    },
    // {
    //   label: "AUTOMATION / RULES",
    //   items: [
    //     { to: "/mail/rules", label: "Rules List", icon: "fa-solid fa-diagram-project" },
    //     { to: "/mail/rule-composer", label: "Rule Composer", icon: "fa-solid fa-pen-ruler" },
    //     { to: "/mail/rule-runs", label: "Rule Runs", icon: "fa-solid fa-terminal" }
    //   ]
    // },
    // {
    //   label: "ANALYTICS",
    //   items: [
    //     { to: "/mail/analytics/volume", label: "Volume & Trends", icon: "fa-solid fa-chart-area" },
    //     { to: "/mail/analytics/performance", label: "Performance", icon: "fa-solid fa-gauge-high" },
    //     { to: "/mail/analytics/insights", label: "Insights", icon: "fa-solid fa-lightbulb" },
    //     { to: "/mail/analytics/exports", label: "Exports", icon: "fa-solid fa-file-arrow-down" }
    //   ]
    // },
    // {
    //   label: "USAGE & BILLING",
    //   items: [
    //     { to: "/mail/usage", label: "Usage", icon: "fa-solid fa-circle-nodes" },
    //     { to: "/mail/billing", label: "Billing", icon: "fa-solid fa-credit-card" }
    //   ]
    // },
    // {
    //   label: "TEAM & SECURITY",
    //   items: [
    //     { to: "/mail/members", label: "Members", icon: "fa-solid fa-users" },
    //     { to: "/mail/roles", label: "Roles & Permissions", icon: "fa-solid fa-lock" },
    //     { to: "/mail/audit-log", label: "Audit Log", icon: "fa-solid fa-clipboard-list" }
    //   ]
    // },
    // {
    //   label: "INTEGRATIONS",
    //   items: [
    //     { to: "/mail/integrations/accounts", label: "Accounts", icon: "fa-solid fa-at" },
    //     { to: "/mail/integrations/api-keys", label: "API Keys", icon: "fa-solid fa-key" },
    //     { to: "/mail/integrations/webhooks", label: "Webhooks", icon: "fa-solid fa-plug" },
    //     { to: "/mail/integrations/marketplace", label: "Marketplace", icon: "fa-solid fa-store" }
    //   ]
    // },
    {
      label: "SETTINGS",
      items: [
        { to: "/mail/settings/profile", label: "Profile", icon: "fa-solid fa-user" },
        // { to: "/mail/settings/workspace", label: "Workspace", icon: "fa-solid fa-briefcase" },
        // { to: "/mail/settings/security", label: "Security", icon: "fa-solid fa-shield-halved" },
        // { to: "/mail/settings/notifications", label: "Notifications", icon: "fa-solid fa-bell" }
      ]
    }
  ];
}