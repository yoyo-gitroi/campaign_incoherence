import { useState, useEffect, useRef, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const CATEGORIES = [
  { id: "all", label: "All Cases", icon: "◉" },
  { id: "ad-landing", label: "Ad vs. Landing Page", icon: "⬡" },
  { id: "influencer", label: "Off-Brand Influencer", icon: "◈" },
  { id: "image-reality", label: "Image vs. Reality", icon: "◇" },
  { id: "agency-silo", label: "Agency Silos", icon: "⬢" },
  { id: "rebrand", label: "Post-Rebrand", icon: "◎" },
  { id: "labels", label: "Misleading Labels", icon: "⬟" },
];

const MARKETS = ["All", "India", "US", "UK", "Global"];

const CASES = [
  {
    id: 1, brand: "Lenskart", market: "India", category: "ad-landing",
    catLabel: "Ad Creative vs. Landing Page Mismatch",
    channels: ["Facebook", "Instagram", "Website"],
    creator: "In-house / Performance Agency",
    severity: "high",
    guideline: 'Ran a promotional campaign with the headline "All Eyeglasses with BLU Thin Lenses Now At Just Rs. 999," displayed prominently across digital ads and website banners.',
    deviation: 'Body text qualified the offer as "First Pair Only" — directly contradicting the "All Glasses" headline. ASCI upheld the complaint in 2020. A separate 2018 action found blue-light lens claims unsubstantiated, with celebrity endorser Katrina Kaif violating ASCI Celebrity Guidelines.',
    impact: "Named in ASCI FY2024 violator list. Pattern reflects structural disconnect between performance marketing KPIs and brand compliance.",
    fix: "Pre-publication compliance review flagging ads where headline claims are contradicted by body text. Automated consistency checks between ad headline, landing page hero, and checkout pricing.",
  },
  {
    id: 2, brand: "Shein", market: "Global", category: "ad-landing",
    catLabel: "Ad Creative vs. Landing Page Mismatch",
    channels: ["Website", "App", "Meta Ads"],
    creator: "Algorithmic Pricing Systems",
    severity: "critical",
    guideline: "Product pages display crossed-out original prices alongside discounted prices, implying genuine savings across all regional storefronts.",
    deviation: "France's DGCCRF found 50%+ of price reduction announcements offered no actual discount. Nearly 1 in 5 reflected smaller discounts than claimed. 11% were outright price increases disguised as discounts. Italy fined Shein $1.16M for misleading sustainability claims.",
    impact: "€40M fine (~$47M) from France. $1.16M fine from Italy. US class action pending seeking $500M+ in damages.",
    fix: "Pricing audit systems validating discount claims against actual price history before publication. Automated monitoring across all regional storefronts.",
  },
  {
    id: 3, brand: "Mamaearth / Honasa", market: "India", category: "influencer",
    catLabel: "Influencer Content That Goes Off-Brand",
    channels: ["Instagram", "YouTube"],
    creator: "5,000+ monthly influencer collaborations",
    severity: "critical",
    guideline: 'Positions itself as "toxin-free," "natural," Asia\'s first MadeSafe-certified brand. Brand identity revolves around safe, transparent, science-backed personal care.',
    deviation: 'ASCI FY2023-24: Honasa was India\'s #1 ad violator with 187 violations. CEO admitted 94% were influencer content. Influencers made unsubstantiated health claims without disclosures. Products contain phenoxyethanol and synthetic fragrances — contradicting "no chemicals ever" positioning.',
    impact: "187 ASCI violations in single year. Massive social media backlash. Sequoia/Peak XV sold significant equity holdings.",
    fix: "Automated influencer content screening against approved claims lists before publication. At 5,000+ monthly collaborations, manual review is structurally impossible.",
  },
  {
    id: 4, brand: "AG1 / Athletic Greens", market: "US", category: "influencer",
    catLabel: "Influencer Content That Goes Off-Brand",
    channels: ["Podcasts", "Instagram", "YouTube", "TikTok"],
    creator: "High-profile influencers (Rogan, Huberman, Kelce brothers)",
    severity: "high",
    guideline: 'Positions itself as "science-driven" with clinical trial graphics and "See our research studies" buttons implying rigorous scientific backing.',
    deviation: 'No fully independent published trial supports AG1\'s marketed benefits. Joe Rogan calls it "science-backed for energy, focus, performance." Andrew Huberman claims adaptogens for stress. Bryan Johnson isolated AG1\'s effects: "nothing changed." Class action pending for misleading advertising.',
    impact: "~$600M revenue but growing legal exposure. Class action pending. BBB C+ rating. Prop 65 lead threshold concerns.",
    fix: "Approved claims matrix for all influencers. Pre-publication review for health/efficacy language. Automated monitoring against approved claims list.",
  },
  {
    id: 5, brand: "Drunk Elephant", market: "US", category: "influencer",
    catLabel: "Influencer Content That Goes Off-Brand",
    channels: ["TikTok"],
    creator: "Influencers (Alix Earle, 7.1M followers)",
    severity: "medium",
    guideline: "FTC requires clear, conspicuous disclosure of material connections. Brand positions on transparency and ingredient integrity.",
    deviation: 'Alix Earle posted TikTok with "#drunkelephantpartner" buried on 5th line of caption, only visible after clicking "more." NAD ruled hashtag insufficient — words ran together, below fold, no verbal disclosure. Separate unpaid influencer posted with zero disclosure despite receiving free product.',
    impact: "Set NAD precedent that below-fold hashtag disclosures are insufficient. Brand voluntarily discontinued testimonials from #BareWithUs campaign.",
    fix: "Mandatory in-video verbal disclosure for all paid and gifted content. Automated caption scanning to verify disclosure in first two lines.",
  },
  {
    id: 6, brand: "Bewakoof", market: "India", category: "image-reality",
    catLabel: "Product Image vs. Reality",
    channels: ["Bewakoof.com", "Mobile App"],
    creator: "Product photography / listing team",
    severity: "high",
    guideline: "Positions as trendy, affordable fashion with accurate product representation through size charts and product images.",
    deviation: 'Systematic complaints: phone covers "looked high quality in ad" but arrived with "very poor quality print"; T-shirts "not dark in colour as pictured" and "faded after first wash"; orders with "design and pattern not even the same"; customized products with wrong sizes and names.',
    impact: "1.5-star rating on PissedConsumer (568 reviews). 1.4-star on Trustpilot. Products with inconsistent sizing show 43% higher return rates.",
    fix: "Production-sample photo matching system flagging when images don't reflect current production specs. Automated monitoring of 'not as pictured' review clusters.",
  },
  {
    id: 7, brand: "Temu", market: "US", category: "image-reality",
    catLabel: "Product Image vs. Reality",
    channels: ["App", "Website", "Meta Ads", "Google Ads"],
    creator: "Third-party sellers with no quality control",
    severity: "critical",
    guideline: "Product pages display polished imagery with specific fit, color, and quality expectations. Ad strategy relies on hyper-aggressive discount messaging.",
    deviation: 'Arizona AG sued for "advertising items that look nothing like items that arrive," fake reviews, and bait-and-switch schemes. Arkansas AG filed parallel lawsuit. Switzerland\'s SECO secured changes after finding misleading pricing and false scarcity. Customer: "9 out of 10 clothing purchases were false advertising."',
    impact: "Arizona AG seeks $10,000 per violation. Multi-jurisdiction regulatory response. BBB rating B- with 2.45/5 stars. Federal class action pending.",
    fix: "Mandatory product photo verification against shipped samples. AI-powered image comparison between listed photos and customer-submitted images.",
  },
  {
    id: 8, brand: "Halara", market: "US", category: "image-reality",
    catLabel: "Product Image vs. Reality",
    channels: ["TikTok", "Instagram", "Facebook"],
    creator: "Performance marketing / AI image generation",
    severity: "high",
    guideline: "Advertises dresses and activewear through saturated social media ads showing specific fit, drape, and color.",
    deviation: 'TikTok users identified AI-generated model images for dresses that may not exist as shown. 4.7M+ posts with significant deinfluencing content. Reviews appear auto-generated: "All posted same day, all 5-star, generic." Sizing wildly inconsistent between items.',
    impact: "Significant negative earned media from AI dress controversy. Compounding trust erosion from AI imagery + auto-generated reviews + sizing issues.",
    fix: "Mandatory disclosure of AI-generated imagery. Product image verification requiring sign-off that advertised items exist in production with shown specifications.",
  },
  {
    id: 9, brand: "Gymshark", market: "UK", category: "agency-silo",
    catLabel: "Agency Silos — Conflicting Creative",
    channels: ["Website", "Social", "Paid Media", "Influencer", "Retail"],
    creator: "Multiple teams with no unified governance",
    severity: "high",
    guideline: "A gym-focused fitness apparel brand that grew through influencer marketing on YouTube and Instagram.",
    deviation: 'Messaging fragmented so badly consumers couldn\'t identify the category. CBO admitted: "People mistake us for a sports brand or athleisure brand." Content oscillated between body positivity and ripped physiques. An influencer image was so extreme thousands accused Gymshark of using AI; post deleted within hours. ASA upheld misleading delivery complaint.',
    impact: "$757M revenue but profits declined 3 straight years. Layoffs and restructuring alongside brand consolidation. Built new 'We Do Gym' platform in-house.",
    fix: "Unified brand governance platform enforcing consistent positioning across all channels and creators. Multi-agency model had failed to maintain coherence.",
  },
  {
    id: 10, brand: "AG1 (Rebrand)", market: "US", category: "rebrand",
    catLabel: "Post-Rebrand Fragmentation",
    channels: ["D2C Website", "Amazon", "Podcasts", "Packaging"],
    creator: "Sequential agencies without continuity governance",
    severity: "medium",
    guideline: 'Multi-phase rebrand: "Athletic Greens" → "Athletic Greens Ultimate Daily" (2018) → "AG1" (2021, Creech Studio) → brand evolution (2023, The New Company).',
    deviation: 'Public agency credit dispute — Creech posted "Who rebranded AG to AG1? Us." after The New Company claimed it. Consumers still search "AG1 vs Athletic Greens difference." Counterfeit brands exploited the old name\'s SEO equity. AG1 launched on Amazon specifically to combat "rampant counterfeiting."',
    impact: "AG1 redirected $20M from marketing into clinical research during transition. Counterfeiting on Amazon required full marketplace channel launch to address.",
    fix: "Single-source brand asset management system enforcing current identity across all channels simultaneously. Automated monitoring for legacy brand name exploitation.",
  },
  {
    id: 11, brand: "Amazon (Platform)", market: "Global", category: "rebrand",
    catLabel: "Post-Rebrand Fragmentation",
    channels: ["Amazon Marketplace"],
    creator: "Platform infrastructure limitation",
    severity: "medium",
    guideline: "D2C brands executing rebrands expect to update identity consistently across all sales channels including Amazon.",
    deviation: 'Amazon offers no documentation on rebrand execution. Trademark approval takes ~9 months. Existing ASINs cannot have brand names changed — each requires individual case filing. One seller: "I had to relist from scratch. Lost all my reviews." Another had brand name changed by a third party without knowledge.',
    impact: "Loss of reviews, search rankings, and revenue. Extended periods of different identities across channels. Risk of account suspension during transition.",
    fix: "Rebrand project management tools accounting for each platform's technical limitations. Automated monitoring for channels still displaying legacy assets.",
  },
  {
    id: 12, brand: "The Whole Truth", market: "India", category: "labels",
    catLabel: "Misleading Labels & Descriptions",
    channels: ["Packaging", "Website", "Social Media"],
    creator: "Product development / procurement gap",
    severity: "critical",
    guideline: 'Entire brand built on radical transparency — "100% clean label," full ingredient disclosure, anti-marketing ethos as core competitive advantage.',
    deviation: 'August 2025: Admitted second-highest selling protein bar used candied cranberries containing added sugar — contradicting "no added sugar" positioning. Separately, influencer filed FSSAI complaint alleging protein powder contained 25g sugar per 100g. ASCI had already compelled removal of "cleanest protein on Mother Earth" claim.',
    impact: "Product pulled from shelves. Full audit committed. ASCI CEO called it a potential breach of ASCI code and Consumer Protection Act. Existential brand credibility event.",
    fix: "Ingredient-level supply chain verification linked to label claims. Automated cross-referencing between labels, website descriptions, and supplier specifications.",
  },
  {
    id: 13, brand: "BlendJet", market: "US", category: "labels",
    catLabel: "Misleading Labels & Descriptions",
    channels: ["Website", "Social Media", "Amazon", "Influencer"],
    creator: "Marketing team disconnected from safety data",
    severity: "critical",
    guideline: 'Marketed as enabling users to "blend from anywhere" with "big blend performance" that can "power through anything in 20 seconds flat."',
    deviation: "CPSC received 329 reports of blades breaking, 17 fires causing ~$150K damage, 49 burns. Consumer Reports found smoke and blade breakages. Marketing continued running positive messaging as complaints mounted. 4.8 million units recalled December 2023.",
    impact: "4.8M unit recall. Company went out of business May 13, 2025. The gap between marketing claims and product reality ended the business.",
    fix: "Real-time feedback loop connecting review sentiment, customer service tickets, and active marketing campaigns. Automated alerts when negative clusters exceed thresholds.",
  },
  {
    id: 14, brand: "Fashion Nova", market: "US", category: "labels",
    catLabel: "Misleading Labels & Descriptions",
    channels: ["Website"],
    creator: "Ecommerce operations team",
    severity: "critical",
    guideline: "Website represented that published reviews reflected views of all customers who submitted reviews.",
    deviation: "From 2015–2019, used a third-party system to auto-publish 4-5 star reviews while routing lower-rated reviews to an unprocessed approval queue. Hundreds of thousands of negative reviews suppressed over four years. First-ever FTC case involving concealment of negative reviews.",
    impact: "$4.2M FTC settlement (2022). $2.4M refunds to 148,351 consumers (2025). Plus earlier $9.3M FTC settlement for shipping violations. Total: $13.5M+ in penalties.",
    fix: "Automated review publishing with no manual filtering by star rating. Compliance audit of all third-party review platforms.",
  },
];

const finesData = [
  { name: "Shein", value: 48.16, fill: "#dc2626" },
  { name: "Fashion Nova", value: 13.5, fill: "#ef4444" },
  { name: "BlendJet", value: 4.8, unit: "M units recalled", fill: "#f87171" },
  { name: "AG1", value: 20, label: "$20M redirected", fill: "#fb923c" },
  { name: "Mamaearth", value: 187, unit: "violations", fill: "#f59e0b" },
];

const finesChartData = [
  { brand: "Shein", fines: 48.16 },
  { brand: "Fashion Nova", fines: 13.5 },
  { brand: "Temu", fines: 10 },
  { brand: "BlendJet", fines: 4.8 },
];

const asciData = [
  { name: "Digital Platform Ads", value: 85, fill: "#dc2626" },
  { name: "Print / TV / Other", value: 15, fill: "#374151" },
];

const violationTypeData = [
  { name: "Influencer Disclosure", value: 55, fill: "#dc2626" },
  { name: "Misleading Claims", value: 30, fill: "#f59e0b" },
  { name: "Other Violations", value: 15, fill: "#6b7280" },
];

const SEVERITY_COLORS = {
  critical: { bg: "bg-red-950/60", border: "border-red-500/40", text: "text-red-400", badge: "bg-red-500/20 text-red-300 border border-red-500/30" },
  high: { bg: "bg-amber-950/40", border: "border-amber-500/30", text: "text-amber-400", badge: "bg-amber-500/15 text-amber-300 border border-amber-500/30" },
  medium: { bg: "bg-sky-950/40", border: "border-sky-500/30", text: "text-sky-400", badge: "bg-sky-500/15 text-sky-300 border border-sky-500/30" },
};

const FAILURE_PATTERNS = [
  {
    title: "Volume Without Verification",
    description: "Creative output scales faster than quality control. Honasa's 5,000+ monthly influencer collaborations, Temu's millions of seller listings, Shein's algorithmic pricing — all share the same structural gap.",
    cases: ["Mamaearth / Honasa", "Temu", "Shein"],
    icon: "⚡",
  },
  {
    title: "Metric Misalignment Across Teams",
    description: "Performance marketing optimizes for CTR/conversion while brand teams own positioning and trust. Different leaders, different KPIs — the ad says one thing, the landing page says another.",
    cases: ["Gymshark", "Lenskart", "Shein"],
    icon: "⊘",
  },
  {
    title: "Supply Chain Opacity Breaking Labels",
    description: "Label claims are made based on intended specifications; actual ingredients diverge at the supplier level. Brand marketing disconnected from procurement.",
    cases: ["The Whole Truth", "Mamaearth / Honasa"],
    icon: "◬",
  },
  {
    title: "Platform Infrastructure Forcing Fragmentation",
    description: "Amazon's inability to synchronize brand name changes means any D2C brand on Amazon will experience forced post-rebrand fragmentation.",
    cases: ["AG1 (Rebrand)", "Amazon (Platform)"],
    icon: "⬡",
  },
  {
    title: "Disclosure as Afterthought",
    description: "Influencer disclosure treated as caption formatting rather than legal compliance. NAD, FTC, ASCI, and ASA have all established that responsibility falls on the brand.",
    cases: ["Drunk Elephant", "Gymshark", "Fashion Nova"],
    icon: "◉",
  },
];

function useInView(ref, threshold = 0.15) {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, threshold]);
  return inView;
}

function AnimatedNumber({ value, suffix = "", prefix = "", duration = 1600 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(eased * value * 10) / 10);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [inView, value, duration]);
  return <span ref={ref}>{prefix}{typeof value === "number" && value % 1 !== 0 ? display.toFixed(1) : Math.round(display)}{suffix}</span>;
}

function FadeIn({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const inView = useInView(ref, 0.1);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.7s cubic-bezier(.22,1,.36,1) ${delay}s, transform 0.7s cubic-bezier(.22,1,.36,1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

function StatCard({ number, suffix, prefix, label, sublabel, accent = "text-red-400" }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent rounded-2xl" />
      <div className="relative border border-white/[0.08] rounded-2xl p-6 hover:border-white/[0.15] transition-all duration-500">
        <div className={`text-4xl md:text-5xl font-light tracking-tight ${accent}`} style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
          <AnimatedNumber value={number} suffix={suffix} prefix={prefix} />
        </div>
        <div className="mt-3 text-sm text-zinc-300 font-medium tracking-wide uppercase" style={{ letterSpacing: "0.08em" }}>{label}</div>
        {sublabel && <div className="mt-1 text-xs text-zinc-500">{sublabel}</div>}
      </div>
    </div>
  );
}

function CaseCard({ c, index }) {
  const [open, setOpen] = useState(false);
  const sev = SEVERITY_COLORS[c.severity];
  return (
    <FadeIn delay={index * 0.06}>
      <div className={`relative rounded-2xl border ${sev.border} ${sev.bg} backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-opacity-80`}>
        <div className="absolute top-0 left-0 w-1 h-full" style={{ background: c.severity === "critical" ? "#dc2626" : c.severity === "high" ? "#f59e0b" : "#0ea5e9" }} />
        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-xs font-mono text-zinc-500">#{String(c.id).padStart(2, "0")}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full ${sev.badge}`}>
                  {c.severity.toUpperCase()}
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800/80 text-zinc-400 border border-zinc-700/50">{c.market}</span>
              </div>
              <h3 className="text-xl md:text-2xl text-white font-semibold tracking-tight" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {c.brand}
              </h3>
              <div className="text-xs text-zinc-500 mt-1">{c.catLabel}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 mb-5">
            {c.channels.map((ch) => (
              <span key={ch} className="text-[10px] px-2 py-0.5 rounded bg-zinc-800/60 text-zinc-400 border border-zinc-700/40 font-mono">
                {ch}
              </span>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4 mb-5">
            <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
              <div className="text-[10px] uppercase tracking-widest text-emerald-500/80 font-semibold mb-2">The Guideline</div>
              <p className="text-sm text-zinc-300 leading-relaxed">{c.guideline}</p>
            </div>
            <div className="rounded-xl bg-zinc-900/50 border border-red-900/30 p-4">
              <div className="text-[10px] uppercase tracking-widest text-red-400/80 font-semibold mb-2">The Deviation</div>
              <p className="text-sm text-zinc-300 leading-relaxed">{c.deviation}</p>
            </div>
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-2 mb-1"
          >
            <span style={{ transform: open ? "rotate(90deg)" : "rotate(0)", transition: "transform 0.3s", display: "inline-block" }}>→</span>
            {open ? "Collapse details" : "Impact, creator & fix"}
          </button>

          {open && (
            <div className="mt-4 space-y-3 animate-in" style={{ animation: "fadeSlideIn 0.4s ease" }}>
              <div className="text-xs text-zinc-500 font-mono">Created by: <span className="text-zinc-300">{c.creator}</span></div>
              <div className="rounded-xl bg-red-950/30 border border-red-900/30 p-4">
                <div className="text-[10px] uppercase tracking-widest text-red-400/70 font-semibold mb-2">Business Impact</div>
                <p className="text-sm text-zinc-300 leading-relaxed">{c.impact}</p>
              </div>
              <div className="rounded-xl bg-emerald-950/30 border border-emerald-900/30 p-4">
                <div className="text-[10px] uppercase tracking-widest text-emerald-400/70 font-semibold mb-2">The Fix</div>
                <p className="text-sm text-zinc-300 leading-relaxed">{c.fix}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </FadeIn>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-2xl">
      <p className="text-zinc-300 text-xs font-medium mb-1">{label || payload[0]?.name}</p>
      <p className="text-white text-sm font-semibold">${payload[0]?.value}M</p>
    </div>
  );
}

function PieTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 shadow-2xl">
      <p className="text-zinc-300 text-xs">{payload[0]?.name}</p>
      <p className="text-white text-sm font-semibold">{payload[0]?.value}%</p>
    </div>
  );
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeMarket, setActiveMarket] = useState("All");
  const [expandedPattern, setExpandedPattern] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filtered = useMemo(() => {
    return CASES.filter((c) => {
      if (activeCategory !== "all" && c.category !== activeCategory) return false;
      if (activeMarket !== "All" && c.market !== activeMarket) return false;
      return true;
    });
  }, [activeCategory, activeMarket]);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap');
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse-dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        * { scroll-margin-top: 80px; }
      `}</style>

      {/* NAV */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{
          background: scrollY > 50 ? "rgba(9,9,11,0.92)" : "transparent",
          backdropFilter: scrollY > 50 ? "blur(20px)" : "none",
          borderBottom: scrollY > 50 ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" style={{ animation: "pulse-dot 2s infinite" }} />
            <span className="text-xs font-mono text-zinc-500 tracking-wider uppercase">D2C Creative Incoherence Report</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            {[
              ["Cases", "cases"], ["Data", "data"], ["Patterns", "patterns"], ["Evidence", "evidence"],
            ].map(([label, id]) => (
              <button key={id} onClick={() => scrollTo(id)} className="text-xs text-zinc-500 hover:text-white transition-colors tracking-wide uppercase">
                {label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-red-950/20 via-zinc-950 to-zinc-950" />
          <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-red-600/[0.03] blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-amber-500/[0.02] blur-[120px]" />
          {/* Grid lines */}
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)",
            backgroundSize: "80px 80px"
          }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-32 pb-20 w-full">
          <FadeIn>
            <div className="flex items-center gap-2 mb-8">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-xs font-mono text-red-400/80 tracking-widest uppercase">Research Report · 14 Documented Cases</span>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.92] mb-8" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              <span className="text-white">The Brand</span><br />
              <span className="text-white">Consistency</span><br />
              <span className="bg-gradient-to-r from-red-400 via-red-500 to-amber-500 bg-clip-text text-transparent">Crisis</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-12">
              When the ad says one thing, the landing page says another, and the influencer says something else entirely — the cost isn't just confusion. It's regulatory fines, return rate inflation, and trust erosion at scale.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-16">
              <div className="border border-white/[0.08] rounded-xl p-5 bg-white/[0.02]">
                <div className="text-3xl md:text-4xl font-light text-red-400" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  <AnimatedNumber value={17} suffix="K+" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Complaints Processed</div>
              </div>
              <div className="border border-white/[0.08] rounded-xl p-5 bg-white/[0.02]">
                <div className="text-3xl md:text-4xl font-light text-amber-400" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  <AnimatedNumber value={48} prefix="$" suffix="M+" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Regulatory Fines</div>
              </div>
              <div className="border border-white/[0.08] rounded-xl p-5 bg-white/[0.02]">
                <div className="text-3xl md:text-4xl font-light text-orange-400" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  <AnimatedNumber value={1.2} prefix="$" suffix="B+" />
                </div>
                <div className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Pending Lawsuits</div>
              </div>
              <div className="border border-white/[0.08] rounded-xl p-5 bg-white/[0.02]">
                <div className="text-3xl md:text-4xl font-light text-sky-400" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  <AnimatedNumber value={14} />
                </div>
                <div className="text-[10px] text-zinc-500 mt-2 uppercase tracking-widest">Documented Cases</div>
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <button
              onClick={() => scrollTo("cases")}
              className="group flex items-center gap-3 text-sm text-zinc-400 hover:text-white transition-colors"
            >
              <span className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center group-hover:border-white/30 transition-colors">
                ↓
              </span>
              Explore the evidence
            </button>
          </FadeIn>
        </div>
      </header>

      {/* EXECUTIVE SUMMARY */}
      <section className="relative py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="max-w-3xl mb-16">
              <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">Executive Summary</span>
              <h2 className="text-3xl md:text-4xl text-white mt-4 leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                Creative governance is not a "nice to have." It is a compliance, revenue, and trust infrastructure problem.
              </h2>
              <p className="text-zinc-400 mt-6 leading-relaxed">
                Across India and the US, regulatory bodies processed over 17,000 advertising complaints in FY2024 alone, with D2C and digital-native brands accounting for the overwhelming majority. These 14 cases span ASCI rulings, FTC enforcement, NAD decisions, ASA rulings, state AG lawsuits, and consumer complaint data.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FadeIn delay={0}><StatCard number={16.9} suffix="%" label="Ecommerce Return Rate" sublabel="NRF 2024 — $890B total" accent="text-red-400" /></FadeIn>
            <FadeIn delay={0.08}><StatCard number={32} suffix="%" label="Customers Leave After" sublabel="One inconsistent experience (PwC)" accent="text-amber-400" /></FadeIn>
            <FadeIn delay={0.16}><StatCard number={33} suffix="%" label="Revenue Lift From" sublabel="Consistent brand presentation" accent="text-emerald-400" /></FadeIn>
            <FadeIn delay={0.24}><StatCard number={84} suffix="%" label="D2C Personal Care" sublabel="Share of ASCI violative ads" accent="text-sky-400" /></FadeIn>
          </div>

          {/* Category overview cards */}
          <FadeIn delay={0.1}>
            <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {CATEGORIES.slice(1).map((cat, i) => {
                const count = CASES.filter((c) => c.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setActiveCategory(cat.id); scrollTo("cases"); }}
                    className="text-left border border-zinc-800/60 rounded-xl p-4 hover:border-zinc-600/60 transition-all duration-300 bg-zinc-900/30 group"
                  >
                    <div className="text-lg mb-2 opacity-40 group-hover:opacity-80 transition-opacity">{cat.icon}</div>
                    <div className="text-xs text-zinc-400 leading-snug">{cat.label}</div>
                    <div className="text-lg text-white font-semibold mt-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{count}</div>
                    <div className="text-[10px] text-zinc-600">
                      {count === 1 ? "case" : "cases"}
                    </div>
                  </button>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* DATA DASHBOARD */}
      <section id="data" className="relative py-24 border-t border-white/[0.06] bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">Data Dashboard</span>
            <h2 className="text-3xl md:text-4xl text-white mt-4 mb-12" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              The Numbers Behind the Incoherence
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-6">
            <FadeIn delay={0.05}>
              <div className="border border-zinc-800/60 rounded-2xl p-6 bg-zinc-950/60">
                <h3 className="text-sm text-zinc-400 font-medium mb-4">Regulatory Fines by Brand (USD Millions)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={finesChartData} barSize={40}>
                    <XAxis dataKey="brand" tick={{ fill: "#71717a", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#71717a", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}M`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                    <Bar dataKey="fines" fill="#dc2626" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="border border-zinc-800/60 rounded-2xl p-6 bg-zinc-950/60">
                <h3 className="text-sm text-zinc-400 font-medium mb-4">ASCI FY2024 — Where Violations Appear</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={asciData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                      {asciData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend verticalAlign="bottom" iconType="circle" formatter={(val) => <span style={{ color: "#a1a1aa", fontSize: 12 }}>{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="border border-zinc-800/60 rounded-2xl p-6 bg-zinc-950/60">
                <h3 className="text-sm text-zinc-400 font-medium mb-4">Personal Care — Violation Types (ASCI)</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie data={violationTypeData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3} strokeWidth={0}>
                      {violationTypeData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                    <Legend verticalAlign="bottom" iconType="circle" formatter={(val) => <span style={{ color: "#a1a1aa", fontSize: 12 }}>{val}</span>} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="border border-zinc-800/60 rounded-2xl p-6 bg-zinc-950/60">
                <h3 className="text-sm text-zinc-400 font-medium mb-6">Key Returns Data Points</h3>
                <div className="space-y-5">
                  {[
                    { pct: "16–22%", label: "of online returns from description mismatch" },
                    { pct: "43%", label: "higher return rate with inconsistent sizing" },
                    { pct: "78%", label: "higher returns on color-critical items with poor imagery" },
                    { pct: "31%", label: "lower returns with comprehensive descriptions" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-baseline gap-3">
                      <span className="text-xl font-semibold text-white min-w-[72px]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{item.pct}</span>
                      <span className="text-sm text-zinc-400">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* CASES */}
      <section id="cases" className="relative py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">Case Studies</span>
            <h2 className="text-3xl md:text-4xl text-white mt-4 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              14 Cases Across 6 Failure Modes
            </h2>
            <p className="text-zinc-500 mb-10 max-w-2xl">Each case documents the stated guideline, the actual deviation, who created it, the business impact, and the governance fix that should have caught it.</p>
          </FadeIn>

          {/* Filters */}
          <div className="mb-10 space-y-4">
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`text-xs px-3.5 py-2 rounded-full border transition-all duration-300 ${
                    activeCategory === cat.id
                      ? "bg-white text-zinc-900 border-white font-medium"
                      : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                  }`}
                >
                  <span className="mr-1.5 opacity-60">{cat.icon}</span>{cat.label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {MARKETS.map((m) => (
                <button
                  key={m}
                  onClick={() => setActiveMarket(m)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-300 ${
                    activeMarket === m
                      ? "bg-zinc-700 text-white border-zinc-600"
                      : "border-zinc-800/60 text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  {m}
                </button>
              ))}
              <span className="text-xs text-zinc-600 self-center ml-2 font-mono">{filtered.length} case{filtered.length !== 1 ? "s" : ""}</span>
            </div>
          </div>

          {/* Case grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {filtered.map((c, i) => <CaseCard key={c.id} c={c} index={i} />)}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20 text-zinc-600">
              <div className="text-4xl mb-4">∅</div>
              <p>No cases match the current filters.</p>
            </div>
          )}
        </div>
      </section>

      {/* PATTERNS */}
      <section id="patterns" className="relative py-24 border-t border-white/[0.06] bg-zinc-900/30">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">Pattern Analysis</span>
            <h2 className="text-3xl md:text-4xl text-white mt-4 mb-4" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              5 Structural Failure Points
            </h2>
            <p className="text-zinc-500 mb-12 max-w-2xl">Across all 14 cases, the same governance failures recur. These are not isolated incidents — they are system design problems.</p>
          </FadeIn>

          <div className="space-y-4">
            {FAILURE_PATTERNS.map((p, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div
                  className={`border rounded-2xl transition-all duration-500 cursor-pointer ${
                    expandedPattern === i ? "border-zinc-600 bg-zinc-900/60" : "border-zinc-800/50 bg-zinc-950/40 hover:border-zinc-700/50"
                  }`}
                  onClick={() => setExpandedPattern(expandedPattern === i ? null : i)}
                >
                  <div className="p-6 md:p-8 flex items-start gap-5">
                    <div className="text-2xl opacity-30 mt-0.5 flex-shrink-0">{p.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-4">
                        <h3 className="text-lg md:text-xl text-white font-medium" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                          <span className="text-zinc-600 font-mono text-sm mr-3">0{i + 1}</span>
                          {p.title}
                        </h3>
                        <span className="text-zinc-600 text-xl flex-shrink-0" style={{ transform: expandedPattern === i ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.3s" }}>+</span>
                      </div>
                      {expandedPattern === i && (
                        <div style={{ animation: "fadeSlideIn 0.4s ease" }}>
                          <p className="text-zinc-400 mt-4 leading-relaxed">{p.description}</p>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {p.cases.map((c) => (
                              <span key={c} className="text-[10px] px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50 font-mono">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* EVIDENCE / DATA */}
      <section id="evidence" className="relative py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">The Data Behind the Business Case</span>
            <h2 className="text-3xl md:text-4xl text-white mt-4 mb-12" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              Aggregate Evidence
            </h2>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-6 mb-16">
            {[
              {
                title: "Returns & Revenue Impact",
                stats: [
                  "$890B total retail returns (NRF 2024)",
                  "53–77% of fashion returns from size/fit issues",
                  "Products with comprehensive descriptions: 31% fewer returns",
                ],
                accent: "border-red-500/30",
              },
              {
                title: "ASCI India (FY2023-24)",
                stats: [
                  "8,299 ads examined from 10,093 complaints",
                  "85% of violations on digital platforms",
                  "98% of investigated ads required modification",
                  "76% of top 100 influencers failed disclosure",
                ],
                accent: "border-amber-500/30",
              },
              {
                title: "FTC US Enforcement",
                stats: [
                  "54 consumer protection matters in FY2024",
                  "$337.3M returned to consumers",
                  "Up to $53,088 per violation under new Review Rule",
                  "$1.2B+ in pending influencer class actions",
                ],
                accent: "border-sky-500/30",
              },
            ].map((section, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className={`border ${section.accent} rounded-2xl p-6 bg-zinc-900/30 h-full`}>
                  <h3 className="text-sm text-white font-medium mb-5">{section.title}</h3>
                  <div className="space-y-3">
                    {section.stats.map((s, j) => (
                      <div key={j} className="flex items-start gap-2.5">
                        <div className="w-1 h-1 rounded-full bg-zinc-600 mt-2 flex-shrink-0" />
                        <span className="text-sm text-zinc-400 leading-relaxed">{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Brand consistency revenue data */}
          <FadeIn>
            <div className="border border-zinc-800/60 rounded-2xl p-8 bg-zinc-900/20 max-w-3xl mx-auto">
              <div className="text-center">
                <div className="text-xs font-mono text-zinc-600 tracking-widest uppercase mb-4">The Consistency Revenue Gap</div>
                <div className="flex items-center justify-center gap-8 md:gap-16 flex-wrap">
                  <div>
                    <div className="text-5xl md:text-6xl font-light text-emerald-400" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      <AnimatedNumber value={90} suffix="%" />
                    </div>
                    <div className="text-xs text-zinc-500 mt-2">have brand guidelines</div>
                  </div>
                  <div className="text-3xl text-zinc-700">→</div>
                  <div>
                    <div className="text-5xl md:text-6xl font-light text-red-400" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      <AnimatedNumber value={25} suffix="%" />
                    </div>
                    <div className="text-xs text-zinc-500 mt-2">consistently enforce them</div>
                  </div>
                </div>
                <p className="text-zinc-500 text-sm mt-6 max-w-md mx-auto">
                  81% of companies deal with off-brand content. Consistent presentation delivers 23-33% revenue lift.
                </p>
                <p className="text-zinc-600 text-[10px] mt-3 font-mono">Source: Lucidpress / Demand Metric Benchmark Studies (2016, 2019)</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* CONCLUSION */}
      <section className="relative py-24 border-t border-white/[0.06] bg-gradient-to-b from-zinc-900/40 to-zinc-950">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeIn>
            <span className="text-xs font-mono text-zinc-600 tracking-widest uppercase">Conclusion</span>
            <h2 className="text-3xl md:text-4xl text-white mt-4 mb-8 leading-snug" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              The Compliance Infrastructure Gap<br />
              <span className="text-zinc-500">Is the Product Opportunity</span>
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-zinc-400 leading-relaxed mb-8 text-lg">
              These 14 cases share a common root cause: D2C brands lack a unified system connecting brand guidelines to creative execution across every channel, every creator, and every marketplace listing in real time. The guidelines exist — 90% of brands have them. The enforcement doesn't.
            </p>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="inline-flex flex-wrap justify-center gap-3 mb-12">
              {[
                { label: "€40M fines", color: "text-red-400 border-red-500/30" },
                { label: "$1.2B+ lawsuits", color: "text-amber-400 border-amber-500/30" },
                { label: "16–22% returns", color: "text-orange-400 border-orange-500/30" },
                { label: "32% churn after 1 bad experience", color: "text-sky-400 border-sky-500/30" },
              ].map((item, i) => (
                <span key={i} className={`text-sm px-4 py-2 rounded-full border ${item.color} bg-zinc-900/50`}>
                  {item.label}
                </span>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-zinc-500 text-sm max-w-xl mx-auto">
              The business case for a Brand Consistency Platform is not theoretical. It is a calculable reduction in regulatory risk, return costs, and customer acquisition cost inflation caused by trust decay.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-xs font-mono text-zinc-600">D2C Creative Incoherence Report · 2025</span>
          </div>
          <div className="text-xs text-zinc-700">
            Sources: ASCI, FTC, NAD, ASA, CPSC, NRF, Lucidpress, PwC, Rocket Returns, Trustpilot, PissedConsumer
          </div>
        </div>
      </footer>
    </div>
  );
}
