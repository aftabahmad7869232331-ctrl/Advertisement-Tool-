import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { workspaceApi } from "../services/workspaceApi";
import { 
  Sparkles, 
  Gem, 
  Check, 
  CreditCard, 
  HardDrive, 
  DownloadCloud, 
  Users, 
  ArrowUpRight, 
  FileText, 
  HelpCircle, 
  Globe, 
  ChevronRight, 
  ShieldCheck, 
  Info,
  DollarSign,
  Briefcase,
  Layers,
  FileCheck
} from "lucide-react";

// Currencies mapping and dynamic conversion multipliers
const CURRENCY_CONFIG: Record<string, { symbol: string; rate: number; label: string }> = {
  INR: { symbol: "₹", rate: 1, label: "India (INR)" },
  USD: { symbol: "$", rate: 0.012, label: "United States (USD)" },
  EUR: { symbol: "€", rate: 0.011, label: "Europe (EUR)" },
  GBP: { symbol: "£", rate: 0.0094, label: "United Kingdom (GBP)" },
  AUD: { symbol: "A$", rate: 0.018, label: "Australia (AUD)" },
  CAD: { symbol: "C$", rate: 0.016, label: "Canada (CAD)" },
  JPY: { symbol: "¥", rate: 1.91, label: "Japan (JPY)" },
  SGD: { symbol: "S$", rate: 0.016, label: "Singapore (SGD)" },
  AED: { symbol: "AED ", rate: 0.044, label: "United Arab Emirates (AED)" },
  SAR: { symbol: "SAR ", rate: 0.045, label: "Saudi Arabia (SAR)" }
};

export function PremiumView() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "quarterly" | "yearly">("yearly");
  const [currency, setCurrency] = useState<string>("INR");
  const [selectedPlan, setSelectedPlan] = useState<string>("professional");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    void workspaceApi.action("premium", "ui-action", { message: msg }).catch(() => undefined);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Auto-detect country based on timezone on mount (simulated local optimization)
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz.includes("Europe")) {
        setCurrency("EUR");
      } else if (tz.includes("Asia/Kolkata")) {
        setCurrency("INR");
      } else if (tz.includes("Australia")) {
        setCurrency("AUD");
      } else if (tz.includes("Asia/Tokyo")) {
        setCurrency("JPY");
      } else if (tz.includes("Asia/Dubai") || tz.includes("Asia/Muscat")) {
        setCurrency("AED");
      } else if (tz.includes("America")) {
        setCurrency("USD");
      }
    } catch (e) {
      console.warn("Timezone-based country detection skipped.", e);
    }
  }, []);

  const currentCurrency = CURRENCY_CONFIG[currency] ?? CURRENCY_CONFIG.INR!;

  const getPrice = (inrBase: number) => {
    let price = inrBase * currentCurrency.rate;
    // Billing discounts
    if (billingCycle === "quarterly") {
      price = price * 0.9 * 3; // 10% off per month, billed for 3 months
    } else if (billingCycle === "yearly") {
      price = price * 0.8 * 12; // 20% off per month, billed for 12 months
    }
    return Math.round(price).toLocaleString();
  };

  const getBilledLabel = () => {
    if (billingCycle === "monthly") return "/ month";
    if (billingCycle === "quarterly") return "/ quarter (10% off)";
    return "/ year (20% off)";
  };

  const plans = [
    {
      id: "starter",
      name: "Starter Business",
      priceINR: 500,
      description: "Perfect for freelancers and small businesses.",
      icon: "🟨",
      accent: "from-yellow-500/20 to-yellow-600/5",
      borderColor: "border-yellow-500/20",
      glowColor: "shadow-yellow-500/5",
      features: [
        "Unlimited Projects",
        "Premium Templates",
        "Standard Video Studio",
        "Cloud Storage (10 GB)",
        "Daily Downloads: 15 files",
        "Commercial License"
      ]
    },
    {
      id: "professional",
      name: "Professional",
      priceINR: 2999,
      description: "Perfect for creators, agencies and business owners requiring premium creative tools and video production.",
      icon: "🟧",
      accent: "from-orange-500/30 to-orange-600/5",
      borderColor: "border-[#F8B400]/40",
      glowColor: "shadow-amber-500/10",
      highlight: true,
      features: [
        "Unlimited Projects",
        "Premium Videos & Templates",
        "Premium Images & Assets",
        "Cloud Storage (100 GB)",
        "Project Backup & Version History",
        "Brand Kit Studio",
        "Voice Lab & Caption Studio",
        "Priority 4K Rendering",
        "Daily Downloads: 100 files",
        "Team Workspace Sharing (Up to 3 members)",
        "Advanced Analytics & Growth Center",
        "Priority Support (Response under 2h)"
      ]
    },
    {
      id: "business-pro",
      name: "Business Pro",
      priceINR: 7999,
      description: "Perfect for marketing agencies, design studios and growing companies.",
      icon: "🟥",
      accent: "from-red-500/20 to-red-600/5",
      borderColor: "border-red-500/20",
      glowColor: "shadow-red-500/5",
      features: [
        "Everything in Professional",
        "Cloud Storage (1 TB)",
        "Unlimited Daily Downloads",
        "Dedicated Rendering Node",
        "Team Workspace Sharing (Up to 15 members)",
        "Dedicated Account Manager",
        "Tailored Multi-Campaign Routing Rules"
      ]
    }
  ];

  const creditStats = {
    available: 1500,
    used: 420,
    remaining: 1080,
    expiry: "July 25, 2026"
  };

  const paymentMethods = {
    india: ["Google Pay", "PhonePe", "Paytm", "UPI", "Credit Card", "Debit Card", "Net Banking"],
    international: ["Visa", "MasterCard", "American Express", "Google Pay", "Apple Pay", "PayPal", "Bank Transfer"]
  };

  const invoiceHistory = [
    { id: "INV-2026-004", date: "June 25, 2026", amount: "₹2,999", status: "Paid" },
    { id: "INV-2026-003", date: "May 25, 2026", amount: "₹2,999", status: "Paid" },
    { id: "INV-2026-002", date: "April 25, 2026", amount: "₹2,999", status: "Paid" }
  ];

  const downloadInvoice = (invoice: { id: string; date: string; amount: string }) => {
    const documentHtml = `<!doctype html><html><head><meta charset="utf-8"><title>${invoice.id}</title></head><body style="font-family:Arial,sans-serif;padding:40px"><h1>Brick-Maker Studio</h1><h2>Invoice ${invoice.id}</h2><p>Date: ${invoice.date}</p><p>Amount: ${invoice.amount}</p><p>Status: Paid</p></body></html>`;
    const url = URL.createObjectURL(new Blob([documentHtml], { type: "text/html" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${invoice.id}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
    showToast(`Invoice ${invoice.id} downloaded.`);
  };

  const faqs = [
    { q: "How does the Credits system work?", a: "Credits are used for heavy AI tasks such as premium voice generation, advanced high-res image creations, and automated 4K video rendering. Every plan includes a monthly credit allocation. Additional credits can be purchased at any time." },
    { q: "Can I upgrade or downgrade my membership at any time?", a: "Yes. Upgrades take effect immediately and are pro-rated. Downgrades take effect at the end of your current billing cycle. All plans can be easily managed dynamically via this Membership workspace." },
    { q: "What is the commercial license policy?", a: "All assets created during a valid premium membership include a full, royalty-free, lifetime commercial license. You can use your designs in commercial ads, print packages, client websites, and social media promotions without any attribution." },
    { q: "Is payment processing secure?", a: "Absolutely. All payment gateways are processed via fully encrypted AES-256 PCI-DSS compliant providers (Stripe, Razorpay, or PayPal) managed dynamically by our secure Admin Dashboard." }
  ];

  return (
    <div className="workspace-page space-y-10 text-white pb-16 animate-fade-in" id="premium-membership-view">
      
      {/* ─── PAGE HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div className="space-y-2 text-left">
          <span className="text-[#F8B400] text-xs font-black tracking-widest uppercase block flex items-center gap-1.5">
            <Gem size={12} className="animate-bounce" />
            WORKSPACE SYNDICATE
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight">
            💎 Premium Membership
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm font-light max-w-xl">
            Unlock premium tools, business resources, cloud services and enterprise features to grow your business.
          </p>
        </div>

        {/* Global Currency Selector (Dynamic Country Conversion) */}
        <div className="flex items-center gap-2.5 bg-black p-2 rounded-xl border border-white/10 self-start md:self-center">
          <Globe size={13} className="text-amber-500" />
          <span className="text-[10px] text-gray-400 font-extrabold uppercase">Currency</span>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-zinc-950 text-xs text-white px-2 py-1 rounded border border-white/5 outline-none cursor-pointer focus:border-amber-500"
          >
            {Object.entries(CURRENCY_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ─── BILLING TOGGLE ─── */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <div className="flex items-center gap-1 bg-zinc-950 p-1.5 rounded-xl border border-white/5">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              billingCycle === "monthly" ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("quarterly")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              billingCycle === "quarterly" ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            Quarterly (10% Off)
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
              billingCycle === "yearly" ? "bg-amber-500 text-black shadow-lg" : "text-gray-400 hover:text-white"
            }`}
          >
            Yearly (20% Off)
          </button>
        </div>
        <span className="text-[10px] text-amber-400 font-black tracking-widest uppercase animate-pulse">
          ⚡ Discount automatically applied
        </span>
      </div>

      {/* ─── THREE COLUMN PLANS GRID ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-2xl border bg-gradient-to-br ${plan.accent} p-6 relative flex flex-col text-left transition-all duration-300 hover:scale-[1.02] ${plan.borderColor} ${plan.glowColor} ${
              plan.highlight ? "shadow-2xl md:-translate-y-2 ring-1 ring-amber-500/20" : ""
            }`}
          >
            {plan.highlight && (
              <span className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-black text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                Recommended Choice
              </span>
            )}

            <div className="space-y-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">{plan.icon}</span>
                <h3 className="text-lg font-black text-white uppercase tracking-wider">
                  {plan.name}
                </h3>
              </div>
              <p className="text-xs text-gray-500 font-light leading-relaxed min-h-[40px]">
                {plan.description}
              </p>

              {/* Price Display */}
              <div className="pt-2">
                <span className="text-3xl font-black text-white tracking-tight">
                  {currentCurrency.symbol}{getPrice(plan.priceINR)}
                </span>
                <span className="text-[11px] text-gray-400 font-mono block mt-1">
                  Billed {getBilledLabel()}
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setSelectedPlan(plan.id);
                  showToast(`Plan-change request saved for ${plan.name}. No payment was charged.`);
                }}
                className={`w-full py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer ${
                  plan.highlight
                    ? "bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:from-amber-400 hover:to-amber-500 shadow-xl shadow-amber-500/10"
                    : "bg-white/5 hover:bg-white/10 text-white border border-white/10"
                }`}
              >
                Upgrade Workspace Now
              </button>

              {/* Feature check list */}
              <div className="space-y-2.5 pt-4 border-t border-white/5">
                <span className="text-[9px] text-gray-400 font-black uppercase tracking-widest block">
                  Included Capabilities
                </span>
                <ul className="space-y-2">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-gray-300 font-light">
                      <span className="w-4 h-4 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mt-0.5 shrink-0">
                        <Check size={10} />
                      </span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ─── ENTERPRISE CUSTOM BLOCK ─── */}
      <div className="p-8 rounded-2xl border border-white/5 bg-zinc-950/40 text-left max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">🏢</span>
            <h3 className="text-lg font-black uppercase tracking-wider">Enterprise Custom Plan</h3>
          </div>
          <p className="text-xs text-gray-400 font-light max-w-xl">
            Need localized sub-accounts, unlimited collaborative seats, a dedicated physical printer routing pipeline, custom security audits, or private edge CDN deployment? Let's design a custom roadmap.
          </p>
        </div>
        <button 
          onClick={() => showToast("Enterprise sales request saved for follow-up.")}
          className="px-6 py-3 rounded-xl bg-white text-black font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all cursor-pointer whitespace-nowrap"
        >
          Contact Enterprise Sales
        </button>
      </div>

      {/* ─── CREDITS, STORAGE & ACCOUNT DETAILS (TWO COLUMN) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto items-start">
        
        {/* LEFT 8 COLS: Usage Metrics & Accounts */}
        <div className="lg:col-span-8 space-y-8 text-left">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Credits system */}
            <div className="p-5 rounded-xl border border-white/5 bg-black/60 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-xs font-black text-white uppercase tracking-widest">
                  AI Credits Allocation
                </h4>
                <button 
                  onClick={() => showToast("Additional-credit request saved. No payment was charged.")}
                  className="text-[9px] font-bold text-amber-400 hover:underline cursor-pointer"
                >
                  Buy Additional
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-zinc-950 p-2 rounded-lg border border-white/5">
                  <span className="block text-base font-black text-white">{creditStats.available}</span>
                  <span className="block text-[8px] text-gray-500 uppercase">Available</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-lg border border-white/5">
                  <span className="block text-base font-black text-gray-400">{creditStats.used}</span>
                  <span className="block text-[8px] text-gray-500 uppercase">Used</span>
                </div>
                <div className="bg-zinc-950 p-2 rounded-lg border border-white/5">
                  <span className="block text-base font-black text-amber-400">{creditStats.remaining}</span>
                  <span className="block text-[8px] text-gray-500 uppercase">Remaining</span>
                </div>
              </div>

              <div className="text-[9px] text-gray-500 flex justify-between">
                <span>Credit cycle resets monthly</span>
                <span>Expiry date: <strong className="text-gray-400">{creditStats.expiry}</strong></span>
              </div>
            </div>

            {/* Cloud Storage and Limits */}
            <div className="p-5 rounded-xl border border-white/5 bg-black/60 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-xs font-black text-white uppercase tracking-widest">
                  Secure Cloud Storage
                </h4>
                <span className="text-[9px] font-bold text-gray-500 font-mono">1.2 GB / 100 GB</span>
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="w-full h-1.5 bg-zinc-950 rounded-full overflow-hidden border border-white/5">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: "1.2%" }} />
                </div>
                <div className="flex justify-between text-[9px] text-gray-500">
                  <span>98.8% Available Storage</span>
                  <span>Unlimited Backups</span>
                </div>
              </div>

              <div className="flex justify-between text-[9px] text-gray-500 pt-1">
                <span>Domain Backup Sync: <strong className="text-emerald-400">ACTIVE</strong></span>
                <button 
                  onClick={() => showToast("Project-restore request saved. Cloud restore requires configured storage.")}
                  className="hover:text-white underline cursor-pointer"
                >
                  Restore Projects
                </button>
              </div>
            </div>

          </div>

          {/* Payment Methods and Security info */}
          <div className="p-6 rounded-xl border border-white/5 bg-black/40 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2.5">
              Secure Global Payment Methods
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div className="space-y-2">
                <span className="block font-black text-gray-400 text-[10px] uppercase">India Methods</span>
                <div className="flex flex-wrap gap-1.5">
                  {paymentMethods.india.map((m, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-zinc-950 border border-white/5 text-[9px] text-gray-300 font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <span className="block font-black text-gray-400 text-[10px] uppercase">International Methods</span>
                <div className="flex flex-wrap gap-1.5">
                  {paymentMethods.international.map((m, i) => (
                    <span key={i} className="px-2 py-1 rounded bg-zinc-950 border border-white/5 text-[9px] text-gray-300 font-mono">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-white/5 flex items-center gap-2 text-[10px] text-gray-500">
              <ShieldCheck size={13} className="text-amber-500" />
              <span>PCI-DSS Level 1 compliant secure payment processors. All credit logs are monitored securely.</span>
            </div>
          </div>

          {/* FAQ SECTION */}
          <div className="space-y-3 pt-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest">
              Frequently Asked Questions
            </h4>
            <div className="space-y-2.5">
              {faqs.map((faq, i) => (
                <div key={i} className="p-3.5 rounded-lg border border-white/5 bg-zinc-950/20">
                  <button
                    onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                    className="w-full flex items-center justify-between text-left text-xs font-extrabold text-[#EAEAEA] hover:text-[#F8B400] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <HelpCircle size={14} className="text-amber-500 shrink-0" />
                  </button>
                  {activeFaq === i && (
                    <p className="mt-2 text-[11px] text-gray-500 leading-relaxed font-light transition-all duration-300 border-t border-white/5 pt-2">
                      {faq.a}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT 4 COLS: Account Billing Summary & Invoices */}
        <div className="lg:col-span-4 space-y-8 text-left">
          
          {/* Billing Profile Summary */}
          <div className="p-5 rounded-xl border border-white/5 bg-black/80 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2.5">
              Membership Summary
            </h4>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Current Plan</span>
                <span className="font-extrabold text-amber-400">Professional (Active)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Billed At</span>
                <span className="text-gray-200">₹2,999 / month (Billed Yearly)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Renewal Date</span>
                <span className="text-gray-200 font-mono">June 25, 2027</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Cloud Backups</span>
                <span className="text-emerald-400 font-bold">Synchronized</span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-white/5 flex gap-2">
              <button 
                onClick={() => showToast("Cancellation request saved for confirmation. The plan is still active.")}
                className="flex-1 py-1.5 rounded bg-pink-500/10 hover:bg-pink-500/15 text-pink-400 font-bold text-[9px] uppercase tracking-wider transition-all border border-pink-500/10 cursor-pointer"
              >
                Cancel Plan
              </button>
              <button 
                onClick={() => showToast("Seat-management request saved for administrator review.")}
                className="flex-1 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 font-bold text-[9px] uppercase tracking-wider transition-all border border-white/5 cursor-pointer"
              >
                Manage Seats
              </button>
            </div>
          </div>

          {/* Invoice History download panel */}
          <div className="p-5 rounded-xl border border-white/5 bg-black/60 space-y-4">
            <h4 className="text-xs font-black text-white uppercase tracking-widest border-b border-white/5 pb-2.5">
              Invoice History
            </h4>

            <div className="space-y-3 text-xs">
              {invoiceHistory.map((inv, idx) => (
                <div key={idx} className="flex justify-between items-center text-[10px] bg-zinc-950 p-2.5 rounded-lg border border-white/5">
                  <div className="space-y-0.5">
                    <span className="block font-black text-[#EAEAEA]">{inv.id}</span>
                    <span className="block text-[8px] text-gray-500 font-mono">{inv.date}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-extrabold text-white">{inv.amount}</span>
                    <button 
                      onClick={() => downloadInvoice(inv)}
                      className="text-amber-500 hover:text-amber-400 p-1 rounded hover:bg-amber-500/5 cursor-pointer"
                      title="Download invoice"
                    >
                      <DownloadCloud size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ADMIN CONSOLE NOTE FOR BILLING */}
          <div className="p-4 rounded-xl border border-white/5 bg-zinc-950 text-left space-y-2 text-[9px] text-gray-500">
            <div className="flex items-center gap-1.5 text-gray-400 font-extrabold uppercase">
              <Info size={11} className="text-amber-500" />
              <span>Dynamic Admin Routing</span>
            </div>
            <p className="leading-relaxed">
              Plans, discounts, payment gateway channels, and tax rates are retrieved dynamically from the secure <strong>Admin Console</strong>. The frontend maintains responsive localized currency scaling and client invoicing records automatically.
            </p>
          </div>

        </div>

      </div>

      {/* ─── TOAST FEEDBACK ─── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-6 right-6 z-50 pointer-events-none"
          >
            <div className="px-5 py-3.5 rounded-2xl bg-[#090909] border border-amber-500/40 text-xs font-bold text-gray-100 shadow-2xl flex items-center gap-3 max-w-sm backdrop-blur-xl">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>{toastMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
