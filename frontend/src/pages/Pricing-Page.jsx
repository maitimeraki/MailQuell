import { useState } from "react";

export default function PricingPage() {
  const [annual, setAnnual] = useState(true);

  const plans = [
    {
      id: "free",
      name: "Free",
      tagline: "Get started and explore the basics.",
      monthly: 0,
      yearly: 0,
      cta: "Get Started",
      highlighted: false,
      features: [
        "Up to 3 tag pages",
        "100 emails processed / month",
        "Basic filtering",
        "Community support",
      ],
      limits: "For personal evaluation",
    },
    {
      id: "pro",
      name: "Pro",
      tagline: "Advanced tools for consistent workflows.",
      monthly: 19,
      yearly: 12, // effective monthly when billed annually
      cta: "Upgrade",
      highlighted: true,
      features: [
        "Unlimited tag pages",
        "15,000 emails processed / month",
        "Advanced rules & conditions",
        "Priority processing queue",
        "Export & analytics",
        "Email SLA support",
      ],
      limits: "Best for solo professionals",
    },
    {
      id: "team",
      name: "Team",
      tagline: "Collaborate and scale with confidence.",
      monthly: 49,
      yearly: 39,
      cta: "Contact Sales",
      highlighted: false,
      features: [
        "Everything in Pro",
        "Shared workspaces",
        "Role-based access",
        "Custom retention policies",
        "Audit logs",
        "Dedicated success manager",
        "SAML SSO (on request)",
      ],
      limits: "Flexible seat pricing",
    },
  ];

  const priceLabel = (p) =>
    p === 0 ? "Free" : `$${p}${annual ? "" : ""}`;

  return (
    <div style={styles.page}>
      <header style={styles.hero}>
        <div style={styles.heroInner}>
          <h1 style={styles.h1}>Simple, transparent pricing</h1>
          <p style={styles.sub}>
            Choose a plan that grows with your email automation needs.
          </p>
          <div style={styles.toggleWrap} aria-label="Billing Toggle">
            <span style={{ ...styles.toggleLabel, opacity: annual ? 1 : 0.55 }}>
              Annual (save up to 35%)
            </span>
            <button
              type="button"
              onClick={() => setAnnual((v) => !v)}
              style={styles.switchBtn}
              aria-pressed={annual}
            >
              <span
                style={{
                  ...styles.knob,
                  transform: annual ? "translateX(0)" : "translateX(22px)",
                }}
              />
            </button>
            <span style={{ ...styles.toggleLabel, opacity: annual ? 0.55 : 1 }}>
              Monthly
            </span>
          </div>
          <p style={styles.note}>
            {annual
              ? "Annual billing shows the effective monthly rate."
              : "Switch to annual to save more."}
          </p>
        </div>
      </header>

      <section style={styles.cardsRow}>
        {plans.map((plan) => {
          const display = annual ? plan.yearly : plan.monthly;
            const realMonthly = annual ? plan.yearly : plan.monthly;
          return (
            <div
              key={plan.id}
              style={{
                ...styles.card,
                ...(plan.highlighted ? styles.cardHighlight : {}),
              }}
            >
              {plan.highlighted && (
                <div style={styles.badge}>Most Popular</div>
              )}
              <h2 style={styles.planName}>{plan.name}</h2>
              <p style={styles.tagline}>{plan.tagline}</p>

              <div style={styles.priceBox}>
                <span style={styles.priceMain}>{priceLabel(display)}</span>
                {display !== 0 && (
                  <span style={styles.pricePeriod}>
                    /mo {annual && <em style={styles.effective}>(billed yearly)</em>}
                  </span>
                )}
              </div>

              <p style={styles.limits}>{plan.limits}</p>

              <ul style={styles.featureList}>
                {plan.features.map((f) => (
                  <li key={f} style={styles.featureItem}>
                    <span style={styles.checkIcon}>✔</span> {f}
                  </li>
                ))}
              </ul>

              <button
                type="button"
                style={{
                  ...styles.ctaBtn,
                  ...(plan.highlighted ? styles.ctaPrimary : {}),
                }}
                onClick={() => {
                  if (plan.id === "team") {
                    window.location.href = "/contact";
                  } else {
                    console.log("Select plan:", plan.id);
                  }
                }}
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </section>

      <section style={styles.faqSection}>
        <h3 style={styles.faqHeading}>Frequently asked questions</h3>
        <div style={styles.faqGrid}>
          {faqData.map((q) => (
            <details key={q.q} style={styles.detail}>
              <summary style={styles.summary}>{q.q}</summary>
              <p style={styles.answer}>{q.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section style={styles.trustSection}>
        <h3 style={styles.trustHeading}>Ready to streamline your inbox logic?</h3>
        <p style={styles.trustText}>
          Start free. Upgrade anytime. No credit card needed for Free.
        </p>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            style={{ ...styles.bigAction, background: "#2563eb", color: "#fff" }}
            onClick={() => (window.location.href = "/signup")}
          >
            Get Started
          </button>
          <button
            style={{ ...styles.bigAction, background: "#111", color: "#fff" }}
            onClick={() => (window.location.href = "/contact")}
          >
            Talk to Sales
          </button>
        </div>
      </section>
    </div>
  );
}

const faqData = [
  {
    q: "Can I switch plans later?",
    a: "Yes. You can upgrade or downgrade at any time; changes pro‑rate automatically on the next cycle.",
  },
  {
    q: "Do you offer refunds?",
    a: "We offer a 14‑day pro‑rated refund window for annual subscriptions. Cancel anytime from your billing settings.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Upgrading to Pro grants immediate access. We periodically run trials; watch announcements in the app.",
  },
  {
    q: "What happens if I exceed my limits?",
    a: "We send notifications and temporarily queue additional processing until you upgrade or the cycle resets.",
  },
  {
    q: "Do you support custom contracts?",
    a: "Yes for Team tier and above. Contact sales for procurement, security review, and custom terms.",
  },
  {
    q: "How is email volume counted?",
    a: "Each unique inbound email evaluated by rules counts once. Reprocessing manually does not double count.",
  },
];

const styles = {
  page: {
    fontFamily: "system-ui, sans-serif",
    color: "#111",
    lineHeight: 1.4,
  },
  hero: {
    padding: "72px 24px 40px",
    textAlign: "center",
    background:
      "linear-gradient(145deg,#eef5ff 0%, #ffffff 40%, #f2f8ff 100%)",
  },
  heroInner: { maxWidth: 880, margin: "0 auto" },
  h1: { fontSize: "clamp(2.2rem,4.5vw,3.2rem)", margin: "0 0 16px" },
  sub: {
    fontSize: 18,
    maxWidth: 640,
    margin: "0 auto 28px",
    color: "#333",
    fontWeight: 400,
  },
  toggleWrap: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    padding: 8,
    background: "#fff",
    borderRadius: 999,
    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
  },
  toggleLabel: { fontSize: 13, fontWeight: 500 },
  switchBtn: {
    position: "relative",
    width: 46,
    height: 24,
    borderRadius: 30,
    background: "#2563eb",
    border: "none",
    padding: 0,
    cursor: "pointer",
  },
  knob: {
    position: "absolute",
    top: 3,
    left: 3,
    width: 18,
    height: 18,
    borderRadius: "50%",
    background: "#fff",
    transition: "transform .28s cubic-bezier(.4,.2,.2,1)",
    boxShadow: "0 1px 3px rgba(0,0,0,0.25)",
  },
  note: { marginTop: 14, fontSize: 13, color: "#555" },
  cardsRow: {
    display: "grid",
    gap: 28,
    padding: "40px clamp(16px,4vw,56px) 56px",
    gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
    maxWidth: 1240,
    margin: "0 auto",
  },
  card: {
    position: "relative",
    background: "#fff",
    border: "1px solid #e5e9f2",
    borderRadius: 18,
    padding: "28px 26px 30px",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    minHeight: 480,
    boxShadow: "0 4px 14px -4px rgba(0,0,0,0.06)",
  },
  cardHighlight: {
    border: "2px solid #2563eb",
    background:
      "linear-gradient(180deg,#ffffff 0%, #f2f8ff 65%, #eef5ff 100%)",
  },
  badge: {
    position: "absolute",
    top: -14,
    left: 18,
    background: "#2563eb",
    color: "#fff",
    fontSize: 11,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 999,
    letterSpacing: 0.5,
  },
  planName: { fontSize: 22, margin: "8px 0 0" },
  tagline: { fontSize: 14, color: "#444", margin: 0, minHeight: 40 },
  priceBox: {
    display: "flex",
    alignItems: "baseline",
    gap: 6,
    marginTop: 8,
    flexWrap: "wrap",
  },
  priceMain: { fontSize: 40, fontWeight: 600 },
  pricePeriod: { fontSize: 14, color: "#555" },
  effective: { fontStyle: "normal", fontSize: 12, color: "#2563eb" },
  limits: { fontSize: 12, color: "#666", margin: "0 0 4px" },
  featureList: {
    listStyle: "none",
    padding: 0,
    margin: "12px 0 0",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    flexGrow: 1,
  },
  featureItem: { fontSize: 14, display: "flex", gap: 8, alignItems: "flex-start" },
  checkIcon: { color: "#2563eb", fontWeight: 600 },
  ctaBtn: {
    marginTop: 18,
    background: "#f1f5f9",
    border: "1px solid #cfd8e3",
    color: "#111",
    padding: "12px 18px",
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 500,
    cursor: "pointer",
    transition: "background .18s",
  },
  ctaPrimary: {
    background: "#2563eb",
    border: "1px solid #2563eb",
    color: "#fff",
    boxShadow: "0 4px 14px -4px rgba(37,99,235,0.5)",
  },
  faqSection: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "32px 24px 64px",
  },
  faqHeading: { fontSize: 28, margin: "12px 0 28px", textAlign: "center" },
  faqGrid: {
    display: "grid",
    gap: 18,
    gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
  },
  detail: {
    background: "#fff",
    border: "1px solid #e5e9f2",
    borderRadius: 12,
    padding: "14px 18px",
  },
  summary: {
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 15,
    listStyle: "none",
  },
  answer: { fontSize: 14, margin: "10px 0 0", color: "#444" },
  trustSection: {
    background: "linear-gradient(145deg,#111 0%,#1f2937 100%)",
    color: "#fff",
    textAlign: "center",
    padding: "70px 24px 90px",
  },
  trustHeading: {
    fontSize: "clamp(1.8rem,3.5vw,2.6rem)",
    margin: "0 0 16px",
    fontWeight: 600,
  },
  trustText: {
    fontSize: 18,
    maxWidth: 640,
    margin: "0 auto 32px",
    color: "#d1d5db",
  },
  bigAction: {
    border: "none",
    padding: "14px 28px",
    fontSize: 16,
    fontWeight: 500,
    borderRadius: 14,
    cursor: "pointer",
    letterSpacing: 0.2,
  },
};