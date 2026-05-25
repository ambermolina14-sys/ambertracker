
import { useState, useEffect } from "react";

const TODAY = new Date(2026, 4, 24);
const PERIOD_START = new Date(2026, 4, 15);
const CYCLE_LEN = 27;

function daysSincePeriod(d) {
  const diff = Math.floor((d - PERIOD_START) / (1000 * 60 * 60 * 24));
  return ((diff % CYCLE_LEN) + CYCLE_LEN) % CYCLE_LEN;
}
function getCycleDay(d) { return daysSincePeriod(d) + 1; }
function getPhase(d) {
  const day = getCycleDay(d);
  if (day <= 6) return "menstrual";
  if (day <= 13) return "follicular";
  if (day === 14) return "ovulation";
  return "luteal";
}
function phaseLabel(p) {
  return { menstrual: "Menstrual", follicular: "Follicular", ovulation: "Ovulation", luteal: "Luteal" }[p];
}

const SUPPLEMENTS = {
  "morning-empty": [
    { id: "amino", name: "Amino Complex", note: "Full essential amino acids — take first, empty stomach", time: "7:00am", test: "No direct test — monitor via energy & symptom tracker" },
    { id: "iron", name: "Iron Bisglycinate + Vitamin C", note: "Eat 2-3 bites first. No dairy/tea/coffee within 1-2hr", time: "7:00am", warn: true, test: "Ferritin recheck mid-June (Quest, 11911 N Meridian St) — target 70+" },
  ],
  "morning-food": [
    { id: "methyl", name: "Methyl Guard Plus", note: "Most critical supplement — 5-MTHF, methylcobalamin, P5P, riboflavin", time: "7:30am", test: "Homocysteine (Ulta Lab Tests, mid-June) — confirms methylation working" },
    { id: "vitd", name: "Vitamin D3", note: "1000 IU (likely insufficient — test urgently)", time: "7:30am", warn: true, test: "Vitamin D 25-OH — Everlywell ordered, URGENT" },
    { id: "fishoil", name: "Fish Oil", note: "EPA/DHA direct — moderate dose, eat fatty fish 3x/week primarily", time: "7:30am", test: "Cholesterol/Lipids (Choose Health Metabolic — mailed May 24) — watch HDL with APOA1 variant" },
    { id: "thyrocsin", name: "Thyrocsin", note: "Iodine, Tyrosine, Selenium 200mcg, Zinc, Ashwagandha, Guggul", time: "7:30am", test: "Free T3, Free T4, TSH — confirmed normal on Everlywell May 2026. Reverse T3 pending (Ulta)" },
    { id: "nac", name: "NAC", note: "Half capsule — boosts glutathione, compensates GSTP1 weakness", time: "7:30am", test: "GGT (in Choose Health Metabolic) — liver detox marker" },
    { id: "quercetin", name: "Quercetin + Bromelain", note: "Mast cell stabiliser, NRF2 activator. Bromelain reduces cramps", time: "7:30am", test: "hsCRP (in Choose Health Metabolic) — inflammation marker, confirms anti-inflammatory effect" },
    { id: "florav", name: "Flora V Probiotic", note: "Lactobacillus blend + cranberry extract", time: "7:30am", test: "No direct test — monitor via bloating & digestion in symptoms tab" },
    { id: "adrenal", name: "Adrenal Cortex", note: "Confirms low DHEAS 1.1 — supports adrenal recovery", time: "7:30am", test: "DHEAS — confirmed LOW 1.1 ng/mL (ref 2.0–19.0) on Everlywell May 2026. Retest in 3–6 months" },
  ],
  "mid-morning": [
    { id: "adrenal-cocktail", name: "Adrenal Cocktail", note: "4oz OJ + coconut aloe water + cream of tartar + sea salt + collagen", time: "Mid-morning", test: "No direct test — supports adrenal DHEAS recovery alongside Adrenal Cortex supplement" },
    { id: "flow-balance", name: "Flow Balance (Organic Olivia)", note: "EVERY DAY without exception — Vitex needs 2-3 months uninterrupted", time: "Mid-morning", warn: true, test: "Estradiol retest (Everlywell, ~3 months) — should be trending toward 246 or below" },
    { id: "liver-tinc", name: "Liver Tincture", note: "Add to adrenal cocktail — estrogen clearance, Phase 2 detox", time: "Mid-morning", test: "GGT (Choose Health Metabolic) + Estradiol retest — measures liver detox function and estrogen clearance" },
  ],
  bedtime: [
    { id: "magnesium", name: "Magnesium CitraMate", note: "GABA support, sleep, muscle relaxation — consider switching to glycinate", time: "Bedtime", test: "No direct test — monitor via sleep quality slider in symptoms tab" },
    { id: "pharmagaba", name: "PharmaGABA 100", note: "30-60 min before sleep — not earlier (CYP2D6 slow clearance)", time: "Bedtime", warn: true, test: "No direct test — monitor via sleep quality and anxiety sliders in symptoms tab" },
    { id: "pemf", name: "PEMF Mat Level 1 — Sleep (3Hz)", note: "Every night — deep sleep entrainment, adrenal recovery", time: "Bedtime", test: "No direct test — HRV tracking (future: Oura Ring) would measure nervous system recovery" },
  ],
  biohacking: [
    { id: "lumebox", name: "Lumebox Red Light", note: "6-7 min full head protocol — forehead, crown, temples, neck/vagus", time: "Daily", test: "No direct test — monitor via brain fog and energy sliders. Future: BDNF levels" },
    { id: "sunlight", name: "Morning sunlight", note: "10 min within 30 min of waking — non-negotiable for HPA axis", time: "Morning", test: "Vitamin D 25-OH (Everlywell, URGENT) — sunlight exposure directly affects Vitamin D" },
    { id: "cold-shower", name: "Cold shower", note: "30-60 sec cold at end of shower — dopamine spike + NRF2", time: "Morning", test: "No direct test — monitor via mood and energy sliders" },
    { id: "vibration", name: "Vibration plate", note: "10 min — lymphatic drainage, bone density, circulation", time: "Evening", test: "No direct test — future: DEXA scan for bone density (VKORC1 variant = lower bone density risk)" },
    { id: "sauna", name: "Infrared sauna blanket", note: "30-45 min — detox via sweat. Shower after to remove mobilised toxins", time: "Evening", test: "GGT (Choose Health Metabolic) — liver/detox marker improved by sweating" },
    { id: "cruciferous", name: "Cruciferous vegetables", note: "DAILY — confirmed estrogen dominance requires this non-negotiable", time: "Meals", warn: true, test: "Estradiol retest (Everlywell ~3 months) — cruciferous veg directly supports estrogen clearance" },
    { id: "walk", name: "20-30 min walk", note: "IL6 blood sugar superpower — after meals best", time: "Daily", test: "HbA1c + Fasting Glucose + Insulin Resistance (Choose Health Metabolic) — all improved by walks" },
  ],
};

const EVERLYWELL = [
  { name: "Estradiol", val: "263.38 pg/mL", flag: "high", ref: "Ref: 36.50–246.00" },
  { name: "DHEAS", val: "1.1 ng/mL", flag: "low", ref: "Ref: 2.0–19.0" },
  { name: "Progesterone", val: "<0.1 ng/mL", flag: "normal", ref: "Saliva — normal" },
  { name: "Testosterone (Total)", val: "22.9 pg/mL", flag: "normal", ref: "Ref: 10.0–130.0" },
  { name: "TSH", val: "1.54 uIU/mL", flag: "normal", ref: "Ref: 0.45–5.33" },
  { name: "Free T3", val: "2.55 pg/mL", flag: "normal", ref: "Ref: 2.07–3.87" },
  { name: "Free T4", val: "0.91 ng/dL", flag: "normal", ref: "Ref: 0.50–1.14" },
  { name: "TPO Antibodies", val: "<0.25 IU/mL", flag: "normal", ref: "No Hashimoto's" },
  { name: "Cortisol Morning", val: "3.05 ng/mL", flag: "normal", ref: "HPA rhythm intact" },
  { name: "FSH", val: "4.91 mIU/mL", flag: "normal", ref: "Ref: 3.85–8.78" },
  { name: "LH", val: "3.62 mIU/mL", flag: "normal", ref: "Ref: 2.12–10.89" },
  { name: "LH/FSH Ratio", val: "0.74", flag: "normal", ref: "No PCOS (threshold >2.0)" },
];

const PENDING = [
  { name: "Choose Health Metabolic 7-in-1", val: "Mailed May 24", flag: "pending", ref: "Results late May/early June" },
  { name: "Ferritin recheck", val: "Due mid-June", flag: "pending", ref: "Quest, 11911 N Meridian St" },
  { name: "Vitamin D (25-OH)", val: "URGENT", flag: "pending", ref: "Everlywell ordered" },
  { name: "Serum Progesterone Day 21", val: "Next cycle Day 21", flag: "pending", ref: "Blood confirmation" },
  { name: "Free Testosterone", val: "Pending", flag: "pending", ref: "SHBG variant — total insufficient" },
  { name: "Homocysteine", val: "Pending", flag: "pending", ref: "Confirms methylation working" },
  { name: "Reverse T3", val: "Pending", flag: "pending", ref: "Pairs with Free T3" },
];

const PRIORITY_FOODS = {
  menstrual: ["Eggs (choline + preformed Vit A)", "Red meat (heme iron — most critical now)", "Blueberries (brain anti-inflammatory)", "Warm soups and broths"],
  follicular: ["Salmon or sardines (EPA/DHA)", "Cruciferous veg (sulforaphane + estrogen clearance)", "Eggs daily", "Cooked tomatoes with olive oil (lycopene)"],
  ovulation: ["Quercetin foods — red onion", "Brazil nuts (selenium)", "Fatty fish", "Take extra quercetin supplement today"],
  luteal: ["Eggs (critical)", "Cruciferous veg (estrogen dominance)", "Sardines every OTHER day only (histamine)", "Fresh food only — no leftovers or fermented"],
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

const colors = {
  sage: "#5a7a6a", sageLight: "#e8f0ec",
  blush: "#c47a8a", blushLight: "#f5e8eb",
  gold: "#b8860b", goldLight: "#f5f0e0",
};

const flagColors = {
  high: { bg: "#fce4ec", color: "#c2185b" },
  low: { bg: "#fff3e0", color: "#e65100" },
  normal: { bg: "#e8f5e9", color: "#2e7d32" },
  pending: { bg: colors.goldLight, color: colors.gold },
  warn: { bg: colors.blushLight, color: colors.blush },
};

const phaseColors = {
  menstrual: "#fce4ec", follicular: "#e8f5e9",
  ovulation: "#e3f2fd", luteal: "#fff3e0",
};

function Badge({ type, children }) {
  const c = flagColors[type] || flagColors.normal;
  return (
    <span style={{ background: c.bg, color: c.color, fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 500 }}>
      {children}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 500, color: "#888", letterSpacing: ".08em", textTransform: "uppercase", margin: "1.25rem 0 .6rem" }}>
      {children}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{ background: "var(--color-background-primary)", border: ".5px solid var(--color-border-tertiary)", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: ".75rem", ...style }}>
      {children}
    </div>
  );
}

function ChecklistTab({ checks, setChecks }) {
  const allItems = Object.values(SUPPLEMENTS).flat();
  const done = allItems.filter(i => checks[i.id]).length;
  const total = allItems.length;
  const pct = total ? Math.round((done / total) * 100) : 0;

  const toggle = (id, val) => setChecks(prev => ({ ...prev, [id]: val }));

  const sections = [
    { key: "morning-empty", label: "🌅 Morning — Empty Stomach (7:00am)" },
    { key: "morning-food", label: "🍳 Breakfast (7:30am)" },
    { key: "mid-morning", label: "🍊 Mid Morning — Adrenal Cocktail" },
    { key: "bedtime", label: "🌙 Bedtime" },
    { key: "biohacking", label: "⚡ Biohacking Tools" },
  ];

  return (
    <div>
      <div style={{ marginBottom: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
          <span style={{ color: "var(--color-text-secondary)" }}>Today's protocol</span>
          <span style={{ fontWeight: 500, color: colors.sage }}>{done} / {total}</span>
        </div>
        <div style={{ height: 4, background: "var(--color-background-secondary)", borderRadius: 2, margin: "8px 0 4px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: colors.sage, borderRadius: 2, transition: "width .3s" }} />
        </div>
      </div>

      {sections.map(s => (
        <div key={s.key}>
          <SectionTitle>{s.label}</SectionTitle>
          <Card>
            {SUPPLEMENTS[s.key].map((item, i) => (
              <div key={item.id} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < SUPPLEMENTS[s.key].length - 1 ? ".5px solid var(--color-border-tertiary)" : "none" }}>
                <input type="checkbox" checked={!!checks[item.id]} onChange={e => toggle(item.id, e.target.checked)}
                  style={{ marginTop: 2, width: 15, height: 15, cursor: "pointer", accentColor: colors.sage, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>
                    {item.name}{" "}
                    <span style={{ background: colors.sageLight, color: colors.sage, fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 500 }}>{item.time}</span>
                  </div>
                  <div style={{ fontSize: 11, color: "var(--color-text-secondary)", lineHeight: 1.4, marginTop: 2 }}>{item.note}</div>
                  {item.warn && <div style={{ fontSize: 11, color: colors.blush, marginTop: 1 }}>⚠ Important timing note</div>}
                  {item.test && <div style={{ fontSize: 11, color: colors.sage, marginTop: 2, lineHeight: 1.4 }}>🧪 {item.test}</div>}
                </div>
              </div>
            ))}
          </Card>
        </div>
      ))}
    </div>
  );
}

const GENERAL_SYMPTOMS = [
  { id: "energy", label: "Energy level", low: "Exhausted", high: "Full energy" },
  { id: "fatigue", label: "Fatigue", low: "No fatigue", high: "Severe fatigue", invert: true },
  { id: "brain_fog", label: "Mental clarity", low: "Total fog", high: "Crystal clear" },
  { id: "focus", label: "Focus & concentration", low: "Can't focus", high: "Laser focused" },
  { id: "mood", label: "Overall mood", low: "Very low", high: "Great" },
  { id: "emotional_stability", label: "Emotional stability", low: "Volatile", high: "Steady" },
  { id: "anxiety", label: "Anxiety", low: "None", high: "Severe", invert: true },
  { id: "agitation", label: "Agitation / irritability", low: "Calm", high: "Very agitated", invert: true },
  { id: "sleep_quality", label: "Last night's sleep", low: "Terrible", high: "Deep & restful" },
];

const CYCLE_SYMPTOMS = [
  { id: "cramps", label: "Cramps", low: "None", high: "Severe", invert: true },
  { id: "bloating", label: "Bloating", low: "None", high: "Very bloated", invert: true },
  { id: "breast_tenderness", label: "Breast tenderness", low: "None", high: "Very tender", invert: true },
  { id: "pms_mood", label: "PMS mood swings", low: "None", high: "Intense", invert: true },
  { id: "pms_hunger", label: "Cravings / hunger", low: "Normal", high: "Very strong", invert: true },
  { id: "pms_overwhelm", label: "Sensory overwhelm", low: "None", high: "Severe", invert: true },
];

function SliderRow({ sym, val, onChange }) {
  const color = sym.invert
    ? val <= 3 ? "#2e7d32" : val <= 6 ? "#e65100" : "#c2185b"
    : val >= 7 ? "#2e7d32" : val >= 4 ? "#e65100" : "#c2185b";
  return (
    <div style={{ padding: "10px 0", borderBottom: ".5px solid var(--color-border-tertiary)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{sym.label}</span>
        <span style={{ fontSize: 13, fontWeight: 500, color, minWidth: 20, textAlign: "right" }}>{val}</span>
      </div>
      <input type="range" min="0" max="10" value={val} onChange={e => onChange(parseInt(e.target.value))} style={{ width: "100%" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--color-text-secondary)", marginTop: 2 }}>
        <span>{sym.low}</span>
        <span>{sym.high}</span>
      </div>
    </div>
  );
}

function SymptomsTab() {
  const phase = getPhase(TODAY);
  const cycleDay = getCycleDay(TODAY);
  const defaultGeneral = { energy: 5, fatigue: 3, brain_fog: 5, focus: 5, mood: 5, emotional_stability: 5, anxiety: 3, agitation: 3, sleep_quality: 6 };
  const defaultCycle = { cramps: 0, bloating: 2, breast_tenderness: 0, pms_mood: 2, pms_hunger: 3, pms_overwhelm: 2 };
  const [general, setGeneral] = useState(defaultGeneral);
  const [cycle, setCycle] = useState(defaultCycle);
  const [saved, setSaved] = useState(false);

  const wellbeingScore = Math.round(
    GENERAL_SYMPTOMS.map(s => s.invert ? 10 - general[s.id] : general[s.id]).reduce((a, b) => a + b, 0) / GENERAL_SYMPTOMS.length * 10
  ) / 10;

  const phaseNote = {
    menstrual: "Menstrual phase — low energy and cramps expected. Be gentle with yourself.",
    follicular: "Follicular phase — energy rising. Brain fog should be lifting.",
    ovulation: "Ovulation — peak energy window. Watch for histamine-related agitation.",
    luteal: "Luteal phase — PMS symptoms expected. Log cramps, mood swings, and overwhelm here.",
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: "1rem" }}>
        {[
          { num: wellbeingScore, lbl: "Wellbeing score" },
          { num: phaseLabel(phase), lbl: "Cycle phase" },
          { num: `Day ${cycleDay}`, lbl: "Cycle day" },
        ].map(s => (
          <div key={s.lbl} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: ".75rem", textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" }}>{s.num}</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 2 }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", background: "var(--color-background-secondary)", borderRadius: 8, padding: ".6rem .9rem", marginBottom: "1rem", lineHeight: 1.5 }}>
        {phaseNote[phase]}
      </div>

      <SectionTitle>General daily wellbeing</SectionTitle>
      <Card>
        {GENERAL_SYMPTOMS.map(s => (
          <SliderRow key={s.id} sym={s} val={general[s.id]} onChange={v => setGeneral(prev => ({ ...prev, [s.id]: v }))} />
        ))}
      </Card>

      <SectionTitle>Cycle & PMS symptoms</SectionTitle>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: ".5rem" }}>
        Rate each 0–10 where 0 = none and 10 = severe
      </div>
      <Card>
        {CYCLE_SYMPTOMS.map(s => (
          <SliderRow key={s.id} sym={s} val={cycle[s.id]} onChange={v => setCycle(prev => ({ ...prev, [s.id]: v }))} />
        ))}
      </Card>

      <button
        onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000); }}
        style={{ padding: "7px 18px", fontSize: 13, fontWeight: 500, background: colors.sage, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
        {saved ? "✓ Saved" : "Save symptoms"}
      </button>
    </div>
  );
}

function CycleTab() {
  const [viewMonth, setViewMonth] = useState(new Date(2026, 4, 1));
  const [selected, setSelected] = useState(null);
  const [flowLog, setFlowLog] = useState({});

  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();

  const logFlow = (type) => {
    if (!selected) return alert("Tap a day first");
    const key = selected.toISOString().split("T")[0];
    setFlowLog(prev => ({ ...prev, [key]: type }));
  };

  const tips = {
    menstrual: "Rest, warmth, iron critical. Lumebox on lower abdomen. Castor oil pack.",
    follicular: "Best energy window. Demanding tasks, exercise, social plans welcome.",
    ovulation: "Peak energy. Watch for histamine surge — take quercetin.",
    luteal: "PMS window. Extra quercetin, sardines every other day, PEMF Level 1-2 only.",
  };

  return (
    <div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: ".75rem" }}>
          <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
            style={{ background: "none", border: ".5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 13, color: "var(--color-text-primary)" }}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--color-text-primary)" }}>{MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}</span>
          <button onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
            style={{ background: "none", border: ".5px solid var(--color-border-tertiary)", borderRadius: 8, padding: "4px 10px", cursor: "pointer", fontSize: 13, color: "var(--color-text-primary)" }}>›</button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
          {DAYS.map(d => <div key={d} style={{ fontSize: 10, color: "var(--color-text-secondary)", textAlign: "center", padding: "2px 0" }}>{d}</div>)}
          {Array.from({ length: startDow }).map((_, i) => <div key={"e" + i} />)}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const d = i + 1;
            const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d);
            const phase = getPhase(date);
            const isToday = date.toDateString() === TODAY.toDateString();
            const isSel = selected && date.toDateString() === selected.toDateString();
            const key = date.toISOString().split("T")[0];
            const flow = flowLog[key];
            return (
              <div key={d} onClick={() => setSelected(date)}
                style={{ minHeight: 34, borderRadius: 6, background: phaseColors[phase], display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", border: (isToday || isSel) ? `2px solid ${colors.sage}` : ".5px solid transparent" }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: isToday ? colors.sage : "inherit" }}>{d}</span>
                {flow && <div style={{ width: 4, height: 4, borderRadius: "50%", background: colors.blush, marginTop: 2 }} />}
              </div>
            );
          })}
        </div>
      </Card>

      {selected && (
        <Card>
          <div style={{ fontSize: 13, display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: ".5px solid var(--color-border-tertiary)" }}>
            <span style={{ color: "var(--color-text-secondary)" }}>{selected.toDateString()}</span>
            <span style={{ fontWeight: 500 }}>Day {getCycleDay(selected)} — {phaseLabel(getPhase(selected))}</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.6, marginTop: ".5rem" }}>{tips[getPhase(selected)]}</div>
        </Card>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: ".5rem 0" }}>
        {["Light", "Moderate", "Heavy", "Clots", "Spotting", "None"].map(f => (
          <button key={f} onClick={() => logFlow(f.toLowerCase())}
            style={{ padding: "4px 10px", fontSize: 11, border: ".5px solid var(--color-border-tertiary)", borderRadius: 10, cursor: "pointer", background: "var(--color-background-primary)", color: "var(--color-text-secondary)" }}>
            {f}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: ".75rem" }}>
        {[{ bg: "#fce4ec", label: "Menstrual" }, { bg: "#e8f5e9", label: "Follicular" }, { bg: "#e3f2fd", label: "Ovulation" }, { bg: "#fff3e0", label: "Luteal" }].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "var(--color-text-secondary)" }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: l.bg }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

function BaroTab() {
  const [baro, setBaro] = useState(null);
  const [updated, setUpdated] = useState("");
  const [manual, setManual] = useState("");
  const [log, setLog] = useState([]);

  const fetch_ = () => {
    setBaro("…");
    fetch("https://api.open-meteo.com/v1/forecast?latitude=39.9784&longitude=-86.118&current=surface_pressure&timezone=America/Indianapolis")
      .then(r => r.json()).then(data => {
        const inHg = (data.current.surface_pressure * 0.02953).toFixed(2);
        setBaro(inHg);
        setUpdated("Updated " + new Date().toLocaleTimeString());
      }).catch(() => setBaro("Error"));
  };

  useEffect(() => { fetch_(); }, []);

  const baroNum = parseFloat(baro);
  const status = isNaN(baroNum) ? null : baroNum >= 29.80 ? "ok" : baroNum >= 29.50 ? "warn" : "bad";
  const statusLabel = { ok: "✓ Good — typically fine for you", warn: "⚠ Mild symptoms possible", bad: "⛔ Headache / fog / agitation risk" };
  const statusStyle = { ok: { background: colors.sageLight, color: colors.sage }, warn: { background: "#fff3e0", color: "#e65100" }, bad: { background: colors.blushLight, color: colors.blush } };

  const logBaro = () => {
    const v = parseFloat(manual);
    if (isNaN(v)) return;
    setLog(prev => [{ v, t: new Date().toLocaleString() }, ...prev].slice(0, 5));
    setManual("");
  };

  return (
    <div>
      <Card>
        <div style={{ textAlign: "center", padding: "1.5rem 0 1rem" }}>
          <div style={{ fontSize: 42, fontWeight: 400, color: "var(--color-text-primary)", letterSpacing: "-.02em" }}>
            {baro || "—"}<span style={{ fontSize: 14, color: "var(--color-text-secondary)" }}> inHg</span>
          </div>
          {status && <div style={{ margin: ".5rem auto", padding: "6px 18px", borderRadius: 20, display: "inline-block", fontSize: 13, fontWeight: 500, ...statusStyle[status] }}>{statusLabel[status]}</div>}
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: ".5rem" }}>{updated}</div>
        </div>
        <button onClick={fetch_} style={{ width: "100%", padding: "7px", fontSize: 13, background: "var(--color-background-primary)", color: colors.sage, border: `.5px solid ${colors.sage}`, borderRadius: 8, cursor: "pointer" }}>
          Refresh pressure
        </button>
      </Card>

      <SectionTitle>Your personal thresholds (Carmel, IN)</SectionTitle>
      <Card>
        {[["≥ 29.80 inHg", "Typically fine", "ok"], ["29.50 – 29.80 inHg", "Mild symptoms likely", "warn"], ["< 29.50 inHg", "Headache / fog / agitation risk", "high"]].map(([label, badge, flag]) => (
          <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: ".5px solid var(--color-border-tertiary)", fontSize: 12 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
            <Badge type={flag}>{badge}</Badge>
          </div>
        ))}
      </Card>

      <SectionTitle>Manual log</SectionTitle>
      <Card>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="number" value={manual} onChange={e => setManual(e.target.value)} placeholder="29.82" step="0.01"
            style={{ flex: 1, padding: "6px 10px", fontSize: 14, border: ".5px solid var(--color-border-tertiary)", borderRadius: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)" }} />
          <button onClick={logBaro} style={{ padding: "7px 18px", fontSize: 13, fontWeight: 500, background: colors.sage, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Log</button>
        </div>
        <div style={{ marginTop: ".75rem" }}>
          {log.length === 0 ? <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>No entries yet</span> :
            log.map((e, i) => {
              const c = e.v >= 29.80 ? colors.sage : e.v >= 29.50 ? "#e65100" : colors.blush;
              return (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderBottom: ".5px solid var(--color-border-tertiary)", fontSize: 12 }}>
                  <span style={{ color: "var(--color-text-secondary)" }}>{e.t}</span>
                  <span style={{ fontWeight: 500, color: c }}>{e.v} inHg</span>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}

// Indiana seasonal pollen context by month
const INDIANA_POLLEN_SEASON = {
  0:  { trees: "Low", grass: "None", weeds: "None", note: "January — dormant season. Indoor allergens (dust, mold) more relevant." },
  1:  { trees: "Low–Moderate", grass: "None", weeds: "None", note: "February — early tree pollen starting (elm, maple). Watch on warm days." },
  2:  { trees: "High", grass: "None", weeds: "None", note: "March — tree pollen season begins. Oak, birch, maple, elm all active." },
  3:  { trees: "Very High", grass: "Low", weeds: "None", note: "April — peak tree pollen. Oak and birch at highest. Histamine load high." },
  4:  { trees: "High", grass: "Moderate–High", weeds: "Low", note: "May — trees winding down, grass pollen ramping up strongly. Double overlap now." },
  5:  { trees: "Low", grass: "Very High", weeds: "Low", note: "June — peak grass pollen season. Timothy, bluegrass, rye all active." },
  6:  { trees: "None", grass: "High", weeds: "Moderate", note: "July — grass still high, weed pollen beginning. Humid heat amplifies symptoms." },
  7:  { trees: "None", grass: "Moderate", weeds: "High", note: "August — weeds building. Ragweed starts late August. Grass tapering." },
  8:  { trees: "None", grass: "Low", weeds: "Very High", note: "September — peak ragweed season in Indiana. Worst month for weed allergy." },
  9:  { trees: "None", grass: "None", weeds: "Moderate", note: "October — ragweed tapering. Mold spores elevated with fallen leaves." },
  10: { trees: "None", grass: "None", weeds: "Low", note: "November — season mostly over. Mold from decaying leaves still present." },
  11: { trees: "None", grass: "None", weeds: "None", note: "December — dormant. Focus on indoor air quality." },
};

const BODY_SYMPTOMS = [
  { id: "sneezing", label: "Sneezing", icon: "🤧" },
  { id: "itchy_eyes", label: "Itchy / watery eyes", icon: "👁️" },
  { id: "runny_nose", label: "Runny nose", icon: "😤" },
  { id: "skin_reaction", label: "Itchy skin / hives", icon: "🌡️" },
  { id: "head_pressure", label: "Head pressure / sinus", icon: "🤕" },
  { id: "puffy", label: "Puffy / swollen feeling", icon: "💧" },
  { id: "scratchy_throat", label: "Scratchy throat", icon: "😮" },
  { id: "brain_fog_pollen", label: "Sudden brain fog", icon: "🌫️" },
];

function AQIBadge({ val }) {
  if (val == null) return <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>—</span>;
  const v = parseInt(val);
  const { label, bg, col } = v <= 50 ? { label: "Good", bg: "#e8f5e9", col: "#2e7d32" }
    : v <= 100 ? { label: "Moderate", bg: "#fff3e0", col: "#e65100" }
    : v <= 150 ? { label: "Sensitive groups", bg: "#fce4ec", col: "#c2185b" }
    : { label: "Unhealthy", bg: "#f3e5f5", col: "#7b1fa2" };
  return (
    <span style={{ background: bg, color: col, fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 500 }}>
      {label} ({v})
    </span>
  );
}

function PollenLevelBadge({ level }) {
  const map = {
    "None":          { bg: "var(--color-background-secondary)", col: "var(--color-text-secondary)" },
    "Low":           { bg: "#e8f5e9", col: "#2e7d32" },
    "Low–Moderate":  { bg: "#f1f8e9", col: "#558b2f" },
    "Moderate":      { bg: "#fff3e0", col: "#e65100" },
    "Moderate–High": { bg: "#fbe9e7", col: "#bf360c" },
    "High":          { bg: "#fce4ec", col: "#c2185b" },
    "Very High":     { bg: "#f3e5f5", col: "#7b1fa2" },
  };
  const style = map[level] || map["None"];
  return (
    <span style={{ background: style.bg, color: style.col, fontSize: 11, padding: "2px 8px", borderRadius: 10, fontWeight: 500 }}>
      {level || "—"}
    </span>
  );
}

const HIGH_HISTAMINE_FOODS = [
  { id: "leftovers", label: "Leftovers", icon: "🍱" },
  { id: "canned_fish", label: "Canned fish / sardines", icon: "🐟" },
  { id: "fermented", label: "Fermented foods", icon: "🫙" },
  { id: "alcohol", label: "Alcohol", icon: "🍷" },
  { id: "aged_cheese", label: "Aged cheese", icon: "🧀" },
  { id: "processed_meat", label: "Processed / deli meat", icon: "🥩" },
  { id: "vinegar", label: "Vinegar / pickled foods", icon: "🥒" },
  { id: "chocolate", label: "Chocolate / cocoa", icon: "🍫" },
];

function PollenTab() {
  const [aqiData, setAqiData] = useState(null);
  const [aqiUpdated, setAqiUpdated] = useState("");
  const [tapped, setTapped] = useState({});
  const [foodTapped, setFoodTapped] = useState({});
  const [overallBurden, setOverallBurden] = useState(null);
  const [quercetinTaken, setQuercetinTaken] = useState(false);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  const month = TODAY.getMonth();
  const season = INDIANA_POLLEN_SEASON[month];
  const phase = getPhase(TODAY);

  const fetchAQI = () => {
    setAqiData("loading");
    fetch("https://air-quality-api.open-meteo.com/v1/air-quality?latitude=39.9784&longitude=-86.118&current=us_aqi,pm2_5,pm10,ozone&timezone=America/Indianapolis")
      .then(r => r.json())
      .then(d => { setAqiData(d.current); setAqiUpdated("Updated " + new Date().toLocaleTimeString()); })
      .catch(() => setAqiData("error"));
  };

  useEffect(() => { fetchAQI(); }, []);

  const toggleTap = (id) => setTapped(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleFood = (id) => setFoodTapped(prev => ({ ...prev, [id]: !prev[id] }));
  const activeTapped = BODY_SYMPTOMS.filter(s => tapped[s.id]);
  const activeFoods = HIGH_HISTAMINE_FOODS.filter(f => foodTapped[f.id]);

  const burdenOptions = [
    { id: "fine", label: "✓ Feeling fine", bg: "#e8f5e9", col: "#2e7d32" },
    { id: "mild", label: "⚡ Mild symptoms", bg: "#fff3e0", col: "#e65100" },
    { id: "flaring", label: "🔥 Flaring", bg: colors.blushLight, col: colors.blush },
  ];

  // Luteal phase warning
  const isLuteal = phase === "luteal";

  const saveLog = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div>
      {/* Seasonal pollen context */}
      <SectionTitle>Pollen season — Carmel, IN</SectionTitle>
      <Card>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: ".75rem", lineHeight: 1.6 }}>{season.note}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["Tree pollen", season.trees], ["Grass pollen", season.grass], ["Weed pollen", season.weeds]].map(([label, level]) => (
            <div key={label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: ".6rem .75rem", textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{label}</div>
              <PollenLevelBadge level={level} />
            </div>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: ".75rem" }}>
          Seasonal averages for Carmel, IN — {MONTHS[month]}. Live granular pollen counts aren't available for the US via free APIs.
        </div>
      </Card>

      {/* Live AQI */}
      <SectionTitle>Live air quality — Carmel, IN</SectionTitle>
      <Card>
        {aqiData === "loading" && <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Fetching...</div>}
        {aqiData === "error" && <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Could not load — check connection</div>}
        {aqiData && aqiData !== "loading" && aqiData !== "error" && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: ".75rem" }}>
              {[
                { label: "US Air Quality Index", val: aqiData.us_aqi, isAqi: true },
                { label: "PM2.5", val: aqiData.pm2_5 != null ? `${Math.round(aqiData.pm2_5 * 10) / 10} µg/m³` : "—" },
                { label: "PM10", val: aqiData.pm10 != null ? `${Math.round(aqiData.pm10 * 10) / 10} µg/m³` : "—" },
                { label: "Ozone", val: aqiData.ozone != null ? `${Math.round(aqiData.ozone)} µg/m³` : "—" },
              ].map(item => (
                <div key={item.label} style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: ".6rem .75rem" }}>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 4 }}>{item.label}</div>
                  {item.isAqi ? <AQIBadge val={item.val} /> : <div style={{ fontSize: 13, fontWeight: 500 }}>{item.val}</div>}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{aqiUpdated}</div>
          </>
        )}
        <button onClick={fetchAQI} style={{ width: "100%", marginTop: ".75rem", padding: "7px", fontSize: 13, background: "var(--color-background-primary)", color: colors.sage, border: `.5px solid ${colors.sage}`, borderRadius: 8, cursor: "pointer" }}>
          Refresh air quality
        </button>
      </Card>

      {/* Luteal phase warning */}
      {isLuteal && (
        <div style={{ background: colors.blushLight, borderRadius: 8, padding: ".7rem 1rem", marginBottom: ".75rem", fontSize: 12, color: colors.blush, lineHeight: 1.6 }}>
          <strong style={{ fontWeight: 600 }}>⚠ Luteal phase — histamine rules active.</strong> Sardines every other day only. No leftovers. No fermented foods. Estrogen is amplifying your mast cell reactivity right now.
        </div>
      )}

      {/* Overall burden — simple 3-tap */}
      <SectionTitle>Overall histamine burden today</SectionTitle>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        {burdenOptions.map(o => (
          <button key={o.id} onClick={() => setOverallBurden(overallBurden === o.id ? null : o.id)}
            style={{ flex: 1, padding: "10px 8px", fontSize: 12, fontWeight: overallBurden === o.id ? 600 : 400, borderRadius: 10, cursor: "pointer",
              border: overallBurden === o.id ? `2px solid ${o.col}` : ".5px solid var(--color-border-tertiary)",
              background: overallBurden === o.id ? o.bg : "var(--color-background-primary)",
              color: overallBurden === o.id ? o.col : "var(--color-text-secondary)", transition: "all .12s" }}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Body symptoms — tap what you notice */}
      <SectionTitle>What are you noticing? <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>(tap all that apply)</span></SectionTitle>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: ".75rem" }}>
        {BODY_SYMPTOMS.map(s => (
          <button key={s.id} onClick={() => toggleTap(s.id)}
            style={{ padding: "7px 12px", fontSize: 12, borderRadius: 20, cursor: "pointer",
              border: tapped[s.id] ? `1.5px solid ${colors.blush}` : ".5px solid var(--color-border-tertiary)",
              background: tapped[s.id] ? colors.blushLight : "var(--color-background-primary)",
              color: tapped[s.id] ? colors.blush : "var(--color-text-secondary)",
              fontWeight: tapped[s.id] ? 500 : 400, transition: "all .12s" }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {/* High histamine foods eaten today */}
      <SectionTitle>High-histamine foods eaten today</SectionTitle>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: ".6rem" }}>
        Tap anything you had — helps identify your load
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: ".75rem" }}>
        {HIGH_HISTAMINE_FOODS.map(f => (
          <button key={f.id} onClick={() => toggleFood(f.id)}
            style={{ padding: "7px 12px", fontSize: 12, borderRadius: 20, cursor: "pointer",
              border: foodTapped[f.id] ? `1.5px solid ${colors.gold}` : ".5px solid var(--color-border-tertiary)",
              background: foodTapped[f.id] ? colors.goldLight : "var(--color-background-primary)",
              color: foodTapped[f.id] ? colors.gold : "var(--color-text-secondary)",
              fontWeight: foodTapped[f.id] ? 500 : 400, transition: "all .12s" }}>
            {f.icon} {f.label}
          </button>
        ))}
      </div>

      {/* Quercetin check */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--color-background-secondary)", borderRadius: 10, padding: ".75rem 1rem", marginBottom: ".75rem" }}>
        <input type="checkbox" checked={quercetinTaken} onChange={e => setQuercetinTaken(e.target.checked)}
          style={{ width: 16, height: 16, cursor: "pointer", accentColor: colors.sage, flexShrink: 0 }} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>Quercetin + Bromelain taken today</div>
          <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginTop: 1 }}>Your primary mast cell stabiliser — especially important on high pollen or high AQI days</div>
        </div>
      </div>

      {/* Summary if anything tapped */}
      {(activeTapped.length > 0 || activeFoods.length > 0) && (
        <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: ".7rem .9rem", marginBottom: ".75rem", fontSize: 12, lineHeight: 1.7 }}>
          {activeTapped.length > 0 && <div><strong style={{ color: "var(--color-text-primary)" }}>Symptoms:</strong> {activeTapped.map(s => s.label).join(", ")}</div>}
          {activeFoods.length > 0 && <div><strong style={{ color: "var(--color-text-primary)" }}>Foods:</strong> {activeFoods.map(f => f.label).join(", ")}</div>}
          {!quercetinTaken && <div style={{ color: colors.blush, marginTop: 2 }}>⚠ Quercetin not yet taken — consider taking it now</div>}
        </div>
      )}

      <textarea value={notes} onChange={e => setNotes(e.target.value)}
        placeholder="Anything else — where you went, how long outside, how you feel overall..."
        style={{ width: "100%", minHeight: 60, padding: "8px 10px", fontSize: 13, border: ".5px solid var(--color-border-tertiary)", borderRadius: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} />
      <button onClick={saveLog} style={{ marginTop: ".75rem", padding: "7px 18px", fontSize: 13, fontWeight: 500, background: colors.sage, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>
        {saved ? "✓ Saved" : "Save today's log"}
      </button>

      {/* Histamine profile */}
      <SectionTitle>Your histamine sensitivity profile</SectionTitle>
      <Card>
        <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.8 }}>
          <div style={{ marginBottom: ".4rem" }}><strong style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>Why you're sensitive:</strong> FCER1A (reactive mast cells, 2 effect alleles) + AOC1 (low DAO enzyme) = histamine released easily and cleared slowly. ESR1 variant means estrogen directly amplifies mast cell activity.</div>
          <div style={{ marginBottom: ".4rem" }}><strong style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>Your triggers:</strong> Pollen + barometric drops + estrogen spikes + high-histamine foods + stress — often stack.</div>
          <div><strong style={{ color: "var(--color-text-primary)", fontWeight: 500 }}>Note:</strong> Your symptoms aren't classic allergy (sneezing). More likely fatigue, agitation, brain fog, and crawling-out-of-skin feeling — especially in luteal phase.</div>
        </div>
      </Card>
    </div>
  );
}

function MealsTab() {
  const [meals, setMeals] = useState([]);
  const [text, setText] = useState("");
  const [time, setTime] = useState("Breakfast");
  const phase = getPhase(TODAY);

  const add = () => {
    if (!text.trim()) return;
    setMeals(prev => [{ text, time, ts: Date.now() }, ...prev]);
    setText("");
  };

  return (
    <div>
      <SectionTitle>Log a meal</SectionTitle>
      <Card>
        <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
          <select value={time} onChange={e => setTime(e.target.value)}
            style={{ padding: "6px 8px", fontSize: 12, border: ".5px solid var(--color-border-tertiary)", borderRadius: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)", cursor: "pointer" }}>
            {["Breakfast", "Snack", "Lunch", "Dinner", "Evening snack"].map(o => <option key={o}>{o}</option>)}
          </select>
          <input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === "Enter" && add()} placeholder="What did you eat?"
            style={{ flex: 1, padding: "6px 10px", fontSize: 13, border: ".5px solid var(--color-border-tertiary)", borderRadius: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)" }} />
          <button onClick={add} style={{ padding: "6px 14px", fontSize: 13, fontWeight: 500, background: colors.sage, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", flexShrink: 0 }}>Add</button>
        </div>
        {meals.length === 0 ? <div style={{ fontSize: 12, color: "var(--color-text-secondary)", padding: ".5rem 0" }}>No meals logged today</div> :
          meals.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: ".5px solid var(--color-border-tertiary)" }}>
              <span style={{ fontSize: 10, background: "var(--color-background-secondary)", padding: "2px 7px", borderRadius: 8, color: "var(--color-text-secondary)", flexShrink: 0 }}>{m.time}</span>
              <span style={{ fontSize: 13, flex: 1 }}>{m.text}</span>
              <button onClick={() => setMeals(prev => prev.filter((_, j) => j !== i))} style={{ fontSize: 16, color: "var(--color-text-secondary)", background: "none", border: "none", cursor: "pointer", padding: "0 2px", lineHeight: 1 }}>×</button>
            </div>
          ))}
      </Card>

      <SectionTitle>Supplement interactions to remember</SectionTitle>
      <Card>
        {[["Iron (7am)", "No dairy within 1hr, no tea/coffee within 2hr"], ["Magnesium (bedtime)", "Full day separation from iron"], ["Before carb-heavy meals", "Take GlucoBitters"], ["After any meal", "10-15 min walk (IL6 blood sugar superpower)"]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: ".5px solid var(--color-border-tertiary)", fontSize: 12 }}>
            <span style={{ color: "var(--color-text-secondary)" }}>{k}</span>
            <span style={{ fontWeight: 500, fontSize: 12 }}>{v}</span>
          </div>
        ))}
      </Card>

      <SectionTitle>Priority foods today</SectionTitle>
      <Card>
        <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: ".5rem", textTransform: "uppercase", letterSpacing: ".05em" }}>{phaseLabel(phase)} phase priorities</div>
        {PRIORITY_FOODS[phase].map(f => (
          <div key={f} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: ".5px solid var(--color-border-tertiary)", fontSize: 13 }}>
            <span>✓ {f}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function ResultsTab() {
  return (
    <div>
      <SectionTitle>Everlywell — May 2026</SectionTitle>
      <Card>
        {EVERLYWELL.map(r => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: ".5px solid var(--color-border-tertiary)" }}>
            <div>
              <div style={{ fontSize: 13, color: "var(--color-text-primary)" }}>{r.name}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{r.ref}</div>
            </div>
            <Badge type={r.flag}>{r.val}</Badge>
          </div>
        ))}
      </Card>

      <SectionTitle>Other confirmed results</SectionTitle>
      <Card>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0" }}>
          <div>
            <div style={{ fontSize: 13 }}>Ferritin (March 2026)</div>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>Optimal: 70–100 ng/mL</div>
          </div>
          <Badge type="low">18 ng/mL</Badge>
        </div>
      </Card>

      <SectionTitle>Pending / In Progress</SectionTitle>
      <Card>
        {PENDING.map(r => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "7px 0", borderBottom: ".5px solid var(--color-border-tertiary)" }}>
            <div>
              <div style={{ fontSize: 13 }}>{r.name}</div>
              <div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>{r.ref}</div>
            </div>
            <Badge type="pending">{r.val}</Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}

function NotesTab() {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState([]);
  const dateStr = TODAY.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

  const save = () => {
    if (!note.trim()) return;
    setSaved(prev => [{ date: dateStr, text: note, ts: Date.now() }, ...prev].slice(0, 10));
    alert("Note saved!");
  };

  return (
    <div>
      <SectionTitle>Daily note — {dateStr}</SectionTitle>
      <Card>
        <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="How are you feeling today? Any notable symptoms, wins, or observations..."
          style={{ width: "100%", minHeight: 140, padding: "8px 10px", fontSize: 13, border: ".5px solid var(--color-border-tertiary)", borderRadius: 8, background: "var(--color-background-primary)", color: "var(--color-text-primary)", fontFamily: "inherit", resize: "vertical", lineHeight: 1.6, boxSizing: "border-box" }} />
        <div style={{ display: "flex", gap: 8, marginTop: ".75rem" }}>
          <button onClick={save} style={{ padding: "7px 18px", fontSize: 13, fontWeight: 500, background: colors.sage, color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Save note</button>
        </div>
      </Card>

      <SectionTitle>Recent notes</SectionTitle>
      {saved.length === 0 ? <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>No notes yet</div> :
        saved.map((n, i) => (
          <Card key={i} style={{ marginBottom: ".5rem" }}>
            <div style={{ fontSize: 11, color: "var(--color-text-secondary)", marginBottom: ".35rem" }}>{n.date}</div>
            <div style={{ fontSize: 13, lineHeight: 1.6 }}>{n.text}</div>
          </Card>
        ))}
    </div>
  );
}

const GENETIC_PATHWAYS = [
  {
    id: "methylation",
    label: "Methylation & Folate",
    icon: "🧬",
    impact: "high",
    summary: "Folic acid from supplements is largely unusable. Requires 5-MTHF methylfolate directly.",
    supplement: "Methyl Guard Plus",
    test: "Homocysteine (Ulta Lab Tests) — confirms methylation correction is working",
    variants: [
      { gene: "MTHFR rs1801131", alleles: "1 effect allele", effect: "Modest reduction in active folate production, slightly elevated homocysteine risk" },
      { gene: "DHFR rs70991108", alleles: "2 effect alleles", effect: "SIGNIFICANT — synthetic folic acid largely unusable. Must use 5-MTHF methylfolate", severity: "high" },
      { gene: "MTHFD1 rs2236225", alleles: "2 effect alleles", effect: "Reduced folate processing, increased choline reliance, raises homocysteine risk" },
      { gene: "PEMT rs7946", alleles: "1 effect allele", effect: "Less efficient internal choline production — daily eggs are critical" },
    ],
  },
  {
    id: "iron",
    label: "Iron Absorption",
    icon: "🔩",
    impact: "high",
    summary: "Body actively blocks iron absorption even when deficient. Ferritin at 18 — confirmed deficiency.",
    supplement: "Iron Bisglycinate + Vitamin C",
    test: "Ferritin recheck mid-June (Quest, 11911 N Meridian St) — target 70+",
    variants: [
      { gene: "TMPRSS6 rs855791", alleles: "2 effect alleles", effect: "Higher hepcidin blocks iron absorption even when deficient — most significant iron variant", severity: "high" },
      { gene: "TF rs3811647", alleles: "2 effect alleles", effect: "Reduced transferrin function — less efficient iron transport through bloodstream" },
      { gene: "TFR2", alleles: "variant", effect: "Reduced cellular iron uptake efficiency" },
      { gene: "BTBD9", alleles: "variant", effect: "Iron stored but not efficiently delivered to tissues" },
    ],
  },
  {
    id: "detox",
    label: "Detoxification",
    icon: "🧹",
    impact: "high",
    summary: "Primary detox weakness. Estrogen metabolites, heavy metals, and BPA clear slowly.",
    supplement: "NAC (glutathione support) + cruciferous vegetables daily",
    test: "GGT (in Choose Health Metabolic panel) — liver detox marker",
    variants: [
      { gene: "GSTP1 rs1695", alleles: "2 effect alleles", effect: "SIGNIFICANT — reduced Phase 2 detox of heavy metals, BPA, mercury, estrogen metabolites", severity: "high" },
      { gene: "GSTP1 rs1138272", alleles: "1 effect allele", effect: "Additional modest reduction in GSTP1 activity" },
      { gene: "CYP1B1 rs1056836", alleles: "1 effect allele", effect: "Slightly increased toxic 4-OH estrogen intermediate production" },
      { gene: "COMT rs4680", alleles: "1 effect allele", effect: "Medium-speed dopamine and estrogen clearance — stress depletes this pathway" },
      { gene: "CYP1A1 rs1048943", alleles: "1 effect allele", effect: "Reduced breakdown of PAHs — avoid charred meats" },
      { gene: "NQO1 rs1800566", alleles: "1 effect allele", effect: "Reduced benzene detox and antioxidant recycling" },
    ],
  },
  {
    id: "vitd",
    label: "Vitamin D",
    icon: "☀️",
    impact: "high",
    summary: "Triple impairment: poor conversion, poor transport, and poor receptor response. Almost certainly deficient.",
    supplement: "Vitamin D3 — current 1000 IU likely insufficient, may need 4000–5000 IU",
    test: "Vitamin D 25-OH (Everlywell ordered — URGENT)",
    variants: [
      { gene: "CYP2R1 rs10741657", alleles: "2 effect alleles", effect: "Reduced liver conversion of Vitamin D to active form", severity: "high" },
      { gene: "GC rs7041 + rs2282679", alleles: "2+1 effect alleles", effect: "Reduced Vitamin D Binding Protein — poor transport through bloodstream" },
      { gene: "VDR rs1544410 + rs731236", alleles: "1+1 effect alleles", effect: "Reduced receptor response — cells don't use Vitamin D efficiently even when present" },
    ],
  },
  {
    id: "brain",
    label: "Brain Chemistry",
    icon: "🧠",
    impact: "high",
    summary: "Low dopamine density, reduced serotonin production, and impaired GABA — amplified during luteal phase.",
    supplement: "PharmaGABA + Amino Complex + Methyl Guard Plus",
    test: "No direct blood test — monitor via symptom tracking (mood, focus, sleep)",
    variants: [
      { gene: "QDPR rs1111875", alleles: "2 effect alleles", effect: "Reduced BH4 recycling — BH4 is the fuel for making dopamine, serotonin, melatonin, nitric oxide", severity: "high" },
      { gene: "DRD2 rs1800497", alleles: "2 effect alleles", effect: "Lower dopamine receptor density — affects motivation, working memory, focus, reward" },
      { gene: "TPH2 rs4570625", alleles: "1 effect allele", effect: "Slightly reduced serotonin production — amplified pre-menstrually" },
      { gene: "SLC6A4", alleles: "2 effect alleles", effect: "Lower serotonin transporter signalling — stress-related mood symptoms and disrupted sleep architecture" },
      { gene: "GABR variants", alleles: "multiple", effect: "Less efficient GABA receptors — brain calming system needs more signal to activate" },
      { gene: "ASMT rs4986938", alleles: "1 effect allele", effect: "Reduced melatonin conversion from serotonin — affects sleep onset and circadian rhythm" },
      { gene: "GSK3B", alleles: "variant", effect: "40% higher inflammatory signalling in mood pathways — depression vulnerability and mood instability" },
    ],
  },
  {
    id: "histamine",
    label: "Histamine",
    icon: "🌿",
    impact: "medium",
    summary: "Produced in excess and cleared slowly. Estrogen surges directly amplify mast cell reactivity.",
    supplement: "Quercetin + Bromelain + dietary management",
    test: "No direct blood test — track via pollen tab body check-in",
    variants: [
      { gene: "FCER1A", alleles: "variant", effect: "Reactive mast cells — histamine released more easily in response to triggers" },
      { gene: "AOC1 rs10156191 + rs2052129", alleles: "1+1 effect alleles", effect: "Reduced DAO enzyme — histamine cleared more slowly from the gut" },
      { gene: "MAOB", alleles: "variant", effect: "Reduced breakdown of histamine in the brain" },
      { gene: "HNMT", alleles: "variant", effect: "Reduced intracellular histamine clearance" },
    ],
  },
  {
    id: "hormones",
    label: "Hormones",
    icon: "⚖️",
    impact: "high",
    summary: "Estrogen dominance confirmed (263.38 HIGH). Genetic variants impair estrogen clearance.",
    supplement: "Flow Balance + Liver Tincture + cruciferous vegetables",
    test: "Estradiol — confirmed HIGH on Everlywell May 2026. Serum Progesterone Day 21 (next cycle)",
    variants: [
      { gene: "COMT rs4680", alleles: "1 effect allele", effect: "Slower estrogen breakdown — contributes to estrogen dominance" },
      { gene: "CYP1B1 rs1056836", alleles: "1 effect allele", effect: "Produces more 4-OH estrogen (carcinogenic metabolite) relative to 2-OH" },
      { gene: "GSTP1 rs1695", alleles: "2 effect alleles", effect: "Impairs Phase 2 conjugation — estrogen metabolites not fully cleared", severity: "high" },
      { gene: "MAOA", alleles: "variant", effect: "Affects estrogen-driven mood pathways — emotional responses more intense and slower to settle" },
    ],
  },
  {
    id: "nutrients",
    label: "Nutrient Absorption",
    icon: "🥗",
    impact: "medium",
    summary: "Multiple absorption impairments — B6, Vitamin K, Omega-3 conversion, and Vitamin A from plants all affected.",
    supplement: "Fish Oil (direct EPA/DHA) + Thyrocsin (B6 as P5P) + eggs daily (preformed Vit A)",
    test: "Vitamin D (Everlywell) — overlaps nutrient panel. Future: full micronutrient panel",
    variants: [
      { gene: "BCO1 (multiple)", alleles: "2+ effect alleles", effect: "Very inefficient beta-carotene to Vitamin A conversion — plant sources of Vit A essentially useless. Needs eggs, liver, dairy" },
      { gene: "FADS1 rs174537", alleles: "2 effect alleles", effect: "Very poor conversion of plant omega-3s to EPA/DHA — needs direct fish sources" },
      { gene: "ALPL + NBPF3 (multiple)", alleles: "multiple", effect: "Significant B6 deficiency risk — combined variants. Thyrocsin provides P5P (active B6)" },
      { gene: "VKORC1 rs7294", alleles: "2 effect alleles", effect: "Less efficient Vitamin K recycling — lower bone density risk" },
      { gene: "APOA1 rs670", alleles: "2 effect alleles", effect: "High-dose fish oil may lower HDL — moderate dose only, fish-first approach" },
    ],
  },
  {
    id: "cardiovascular",
    label: "Cardiovascular",
    icon: "❤️",
    impact: "low",
    summary: "Several protective variants. Mild clotting tendency worth noting. Salt sensitivity high.",
    supplement: "Fish Oil (moderate) + consistent exercise",
    test: "Cholesterol/Lipids panel (in Choose Health Metabolic) — mailed May 24",
    variants: [
      { gene: "PCSK9 rs562556", alleles: "1 effect allele", effect: "Protective — moderately lower LDL and mild cardiovascular benefit" },
      { gene: "ACE + AGT variants", alleles: "variants", effect: "High salt sensitivity — target under 1500mg/day. Cook from scratch." },
      { gene: "SERPINE1 (PAI-1)", alleles: "variant", effect: "Slightly slower clot dissolution — mild clotting tendency" },
      { gene: "IL6 rs1800795", alleles: "GG genotype", effect: "STRENGTH — greatest blood glucose reduction from exercise of any variant" },
    ],
  },
  {
    id: "longevity",
    label: "Strengths & Longevity",
    icon: "✨",
    impact: "strength",
    summary: "Several significant longevity and performance variants working in your favour.",
    supplement: "Exercise (ACE endurance variant) + antioxidant-rich diet",
    test: "HbA1c + Fasting Glucose (in Choose Health Metabolic) — longevity markers",
    variants: [
      { gene: "ACE rs4343", alleles: "I/I genotype", effect: "STRENGTH — endurance athlete variant. Cardiovascular system adapts exceptionally to sustained aerobic exercise" },
      { gene: "BPIFB4 rs2070325", alleles: "AG", effect: "STRENGTH — increased longevity protein. Reduced arterial plaque, significantly reduced frailty in old age" },
      { gene: "IGF1R rs2229765", alleles: "AG", effect: "STRENGTH — centenarian variant. Found more frequently in people living to 100+" },
      { gene: "SIRT1 rs3758391", alleles: "CT", effect: "STRENGTH — lower cardiovascular mortality, better cognitive function with ageing" },
      { gene: "CETP rs5882", alleles: "AG", effect: "STRENGTH — higher HDL association, longer lifespan association" },
      { gene: "NRF2 pathway", alleles: "activated", effect: "STRENGTH — quercetin and red light therapy activate this pathway for antioxidant protection" },
    ],
  },
];

function GeneticsTab() {
  const [expanded, setExpanded] = useState(null);
  const [filter, setFilter] = useState("all");

  const impactOrder = { high: 0, medium: 1, low: 2, strength: 3 };
  const impactStyle = {
    high:     { bg: "#fce4ec", color: "#c2185b", label: "Needs support" },
    medium:   { bg: "#fff3e0", color: "#e65100", label: "Monitor" },
    low:      { bg: "#e8f5e9", color: "#2e7d32", label: "Mild" },
    strength: { bg: colors.sageLight, color: colors.sage, label: "Strength" },
  };

  const variantSeverityColor = s => s === "high" ? colors.blush : "var(--color-text-secondary)";

  const filtered = GENETIC_PATHWAYS
    .filter(p => filter === "all" || p.impact === filter)
    .sort((a, b) => impactOrder[a.impact] - impactOrder[b.impact]);

  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginBottom: ".75rem", lineHeight: 1.6 }}>
        Source: PlexusDX genetic reports (May 2026) — 150+ insights across 14 pathways, 49 peptides, 48 genes, 57 SNPs. Tap any pathway to expand variants.
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: "1rem" }}>
        {[["all", "All pathways"], ["high", "Needs support"], ["medium", "Monitor"], ["strength", "Strengths"]].map(([val, lbl]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding: "5px 12px", fontSize: 11, borderRadius: 20, cursor: "pointer", border: filter === val ? "none" : ".5px solid var(--color-border-tertiary)", background: filter === val ? colors.sage : "var(--color-background-primary)", color: filter === val ? "#fff" : "var(--color-text-secondary)", fontWeight: filter === val ? 500 : 400 }}>
            {lbl}
          </button>
        ))}
      </div>

      {filtered.map(pathway => {
        const isOpen = expanded === pathway.id;
        const imp = impactStyle[pathway.impact];
        return (
          <div key={pathway.id} style={{ marginBottom: ".5rem" }}>
            <div onClick={() => setExpanded(isOpen ? null : pathway.id)}
              style={{ background: "var(--color-background-primary)", border: ".5px solid var(--color-border-tertiary)", borderRadius: isOpen ? "12px 12px 0 0" : 12, padding: ".9rem 1.25rem", cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{pathway.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: "var(--color-text-primary)" }}>{pathway.label}</span>
                  <span style={{ background: imp.bg, color: imp.color, fontSize: 10, padding: "2px 7px", borderRadius: 8, fontWeight: 500 }}>{imp.label}</span>
                  <span style={{ fontSize: 11, color: "var(--color-text-secondary)", marginLeft: "auto" }}>{pathway.variants.length} variants {isOpen ? "▲" : "▼"}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--color-text-secondary)", lineHeight: 1.5 }}>{pathway.summary}</div>
              </div>
            </div>

            {isOpen && (
              <div style={{ background: "var(--color-background-primary)", border: ".5px solid var(--color-border-tertiary)", borderTop: "none", borderRadius: "0 0 12px 12px", padding: "0 1.25rem 1rem" }}>

                {/* Variants */}
                <div style={{ marginBottom: ".75rem" }}>
                  {pathway.variants.map((v, i) => (
                    <div key={i} style={{ padding: "7px 0", borderBottom: ".5px solid var(--color-border-tertiary)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", background: "var(--color-background-secondary)", padding: "1px 6px", borderRadius: 4, color: "var(--color-text-primary)" }}>{v.gene}</span>
                        <span style={{ fontSize: 10, color: "var(--color-text-secondary)" }}>{v.alleles}</span>
                        {v.severity === "high" && <span style={{ fontSize: 10, background: colors.blushLight, color: colors.blush, padding: "1px 6px", borderRadius: 6, fontWeight: 500 }}>significant</span>}
                      </div>
                      <div style={{ fontSize: 12, color: variantSeverityColor(v.severity), lineHeight: 1.5 }}>{v.effect}</div>
                    </div>
                  ))}
                </div>

                {/* What you're doing */}
                <div style={{ background: colors.sageLight, borderRadius: 8, padding: ".6rem .9rem", marginBottom: ".5rem" }}>
                  <div style={{ fontSize: 10, color: colors.sage, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>What you're doing about it</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{pathway.supplement}</div>
                </div>

                {/* Associated test */}
                <div style={{ background: "var(--color-background-secondary)", borderRadius: 8, padding: ".6rem .9rem" }}>
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 3 }}>Associated test</div>
                  <div style={{ fontSize: 12, color: "var(--color-text-primary)", lineHeight: 1.5 }}>{pathway.test}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

const TABS = [
  { id: "checklist", label: "Protocol" },
  { id: "symptoms", label: "Symptoms" },
  { id: "cycle", label: "Cycle" },
  { id: "baro", label: "Barometric" },
  { id: "pollen", label: "Pollen" },
  { id: "meals", label: "Meals" },
  { id: "results", label: "Lab Results" },
  { id: "genetics", label: "Genetics" },
  { id: "notes", label: "Notes" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("checklist");
  const [checks, setChecks] = useState({});
  const dateStr = TODAY.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const renderTab = () => {
    switch (activeTab) {
      case "checklist": return <ChecklistTab checks={checks} setChecks={setChecks} />;
      case "symptoms": return <SymptomsTab />;
      case "cycle": return <CycleTab />;
      case "baro": return <BaroTab />;
      case "pollen": return <PollenTab />;
      case "meals": return <MealsTab />;
      case "results": return <ResultsTab />;
      case "genetics": return <GeneticsTab />;
      case "notes": return <NotesTab />;
      default: return null;
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: ".5rem 0 3rem", fontFamily: "var(--font-sans)" }}>
      <div style={{ padding: "1.25rem 0 .75rem", borderBottom: ".5px solid var(--color-border-tertiary)", marginBottom: "1rem" }}>
        <h1 style={{ fontSize: 17, fontWeight: 500, color: "var(--color-text-primary)", letterSpacing: ".01em" }}>Amber's Health Tracker</h1>
        <p style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>{dateStr}</p>
      </div>

      <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: ".5rem", marginBottom: "1.25rem", scrollbarWidth: "none" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ flexShrink: 0, padding: "6px 14px", fontSize: 12, border: ".5px solid var(--color-border-tertiary)", borderRadius: 20, cursor: "pointer", background: activeTab === t.id ? colors.sage : "var(--color-background-primary)", color: activeTab === t.id ? "#fff" : "var(--color-text-secondary)", transition: "all .15s" }}>
            {t.label}
          </button>
        ))}
      </div>

      {renderTab()}
    </div>
  );
}
