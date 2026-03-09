import { GoogleGenerativeAI } from "@google/generative-ai";
import { Shift, WageSummary, Goals, Sale } from "./types.ts";

// --- CONFIGURATION ---
const FAST_MODEL = "gemini-3-flash-preview";
const SMART_MODEL = "gemini-3-flash-preview";

// --- MORRI PERSONALITY: Charity Fundraising Wingman ---
// MorriAI is an eccentric Icelandic fundraising boss with chaotic energy.
// NEVER use: "selja", "kaupa", "viðskiptavinur", "sala" in generic sales context
// ALWAYS use: "styrkja", "gefa", "styrktaraðili", "söfnun", "gefandi"

const MORRI_PHRASES = [
  "Now watch this drive! Lokaðu þessu.",
  "Hvern hefði grunað? Gvend hefði grunað að þú myndir landa þessu.",
  "Cock! Hringdu aftur, ekki hugsa.",
  "Hvað kallaðiru mig? Ég sver að þú kallaðir mig 'Söfnunarkóng' rétt í þessu!",
  "Gleðilegt nýtt hár! Ef þú klippir þig vel, safnaru vel.",
  "Cock! Næsti styrktaraðili er JÁ.",
  "Ekki senda email. Það er dauðinn. Biddu um pening!"
];

const FALLBACK_WINGMAN = [
  "Gleðilegt nýtt hár! Hringdu í næsta.",
  "Ekki spá í þessu. Bara hringja. Cock!",
  "Þögnin selur. Haltu kjafti eftir að þú nefnir upphæðina.",
  "Haltu áfram, þetta kemur. Gvend hefði grunað það.",
  "Skerptu á ræðunni. Slepptu 'email' vitleysunni.",
  "Brostu í gegum símann! Þau heyra það.",
  "Ertu búinn að bjóða hækkun? Now watch this drive."
];

const FALLBACK_COACH = [
  "Hlustaðu betur á styrktaraðilann.",
  "Notaðu þögnina, hún er vinur þinn.",
  "Spurðu opinna spurninga um hvers vegna þau vilja styrkja."
];

const getApiKey = (): string => {
  return import.meta.env.VITE_GEMINI_API_KEY || '';
};

const getModel = (modelName: string) => {
  const apiKey = getApiKey();
  console.log('Gemini API Key status:', apiKey ? `Loaded (${apiKey.substring(0, 10)}...)` : 'NOT LOADED');
  if (!apiKey) return null;
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: modelName });
};

const stripMarkdown = (text: string) => {
  return text.replace(/```json|```|json/g, '').trim();
};

export interface SpeechResult {
  text: string;
  sources: { title: string; uri: string }[];
}

// --- CONVERSATIONAL AI ---
export const chatWithAddi = async (history: { role: string, parts: { text: string }[] }[]) => {
  const model = getModel(FAST_MODEL);
  if (!model) return "Addi er utan þjónustusvæðis (Netvilla).";

  try {
    const lastMsg = history[history.length - 1];
    const previousHistory = history.slice(0, -1).map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: h.parts
    }));

    const chat = model.startChat({ history: previousHistory });
    const result = await chat.sendMessage(lastMsg.parts[0].text);
    return result.response.text();
  } catch (e) {
    console.error("Chat Error:", e);
    return "Samband rofnaði við Adda (Blocked/Offline).";
  }
};

// --- FUNDRAISING COACH ---
export const getSalesCoachAdvice = async (hurdles: string[]): Promise<string> => {
  const model = getModel(FAST_MODEL);

  if (!model) return FALLBACK_COACH.join("\\n");

  try {
    const prompt = `
      Þú ert MorriAI - þjálfari í fjáröflun fyrir góðgerðarfélög.
      MIKILVÆGT: Þetta er FJÁRÖFLUN, ekki sala. Notaðu orð eins og:
      - "styrktaraðili" ekki "viðskiptavinur"  
      - "styrkja" ekki "kaupa"
      - "gefa" ekki "selja"
      
      Hindranir í dag: ${hurdles.join(', ')}.
      Gefðu 3 stutt, öflug ráð (bullet points). Max 10 orð hver.
    `;
    const result = await model.generateContent(prompt);
    return result.response.text().replace(/[*#]/g, '') || FALLBACK_COACH.join("\\n");
  } catch (e) {
    return FALLBACK_COACH.sort(() => 0.5 - Math.random()).slice(0, 3).join("\\n");
  }
};

// --- MANAGER STRATEGY ---
export const getManagerCommandAnalysis = async (charityData: any) => {
  const model = getModel(SMART_MODEL);
  if (!model) return { strategicAdvice: "Gagna vantar (Offline)", topProject: "Óvíst" };

  try {
    const prompt = `Berðu saman árangur fyrir góðgerðarsöfnun: ${JSON.stringify(charityData)}. 
    Return JSON only. Format: {"topProject": "Nafn", "strategicAdvice": "Ráð"}`;
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    return JSON.parse(stripMarkdown(result.response.text()));
  } catch (e) {
    return { strategicAdvice: "Ekki náðist samband við gervigreind.", topProject: "Gagna vantar" };
  }
};

// --- SCRIPT GENERATOR ---
export const getSpeechAssistantResponse = async (mode: 'create' | 'search', project: string): Promise<SpeechResult> => {
  const model = getModel(FAST_MODEL);
  const fallback = { text: `Engin tenging. \\n\\nMundu að kynna ${project} af innlifun og útskýra áhrifin.`, sources: [] };
  if (!model) return fallback;

  try {
    const systemInstruction = `Þú ert MorriAI, háorkumaður í fjáröflun. Skrifaðu sannfærandi texta fyrir góðgerðarsöfnun.
    BANNAÐ: Orðin "selja", "kaupa", "viðskiptavinur"
    NOTAÐU: "styrkja", "gefa", "styrktaraðili", "stuðningur"`;

    const userPrompt = mode === 'create'
      ? `Skrifaðu ræðu til að fá fólk að STYRKJA ${project}. 70-100 orð. Áhersla á áhrif, ekki sölu.`
      : `Hvað gerir ${project}? Stutt yfirlit sem vekur samúð.`;

    const result = await model.generateContent([systemInstruction, userPrompt]);
    return { text: result.response.text().replace(/[*#\\-_>]/g, '').trim(), sources: [] };
  } catch (e) {
    return fallback;
  }
};

// --- SMART DASHBOARD ANALYSIS ---
export const getSmartDashboardAnalysis = async (salesToday: number, totalPeriodSales: number, goals: Goals, personality: string = 'standard') => {
  const model = getModel(FAST_MODEL);

  const fallbackAdvice = salesToday > goals.daily ? "Frábær árangur, haltu dampi!" : "Gefðu í, þú getur þetta!";
  const fallbackTrend = salesToday > (goals.daily / 2) ? "up" : "stable";

  if (!model) return { smartAdvice: fallbackAdvice, trend: fallbackTrend, motivationalQuote: "Áfram gakk!", projectedEarnings: totalPeriodSales };

  try {
    const prompt = `
      Þú ert MorriAI - fjáröflunarþjálfari fyrir góðgerðarfélög.
      MIKILVÆGT: Þetta er FJÁRÖFLUN/söfnun, ekki venjuleg sala.
      
      Í DAG: Safnað ${salesToday} kr (Markmið ${goals.daily} kr).
      MÁNUÐUR: Safnað ${totalPeriodSales} kr (Markmið ${goals.monthly} kr).
      
      Svaraðu á ÍSLENSKU í JSON.
      Format: {"smartAdvice": "stuttur hvatning (max 6 orð)", "trend": "up/down/stable", "motivationalQuote": "tilvitnun", "projectedEarnings": ${totalPeriodSales}}
    `;

    const result = await model.generateContent(prompt);
    const text = stripMarkdown((await result.response).text());
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Error:", error);
    return {
      smartAdvice: fallbackAdvice,
      trend: fallbackTrend,
      motivationalQuote: "Haltu áfram!",
      projectedEarnings: totalPeriodSales
    };
  }
};

// --- LIVE WINGMAN: MORRIAI CHARITY FUNDRAISING SYSTEM ---
interface SalesStats {
  salesToday: number;
  salesCount: number;
  hoursWorked: number;
  historicalAvg: number;
  goalToday: number;
  timeInShift: number;
}

export const getWingmanMessage = async (
  minutesSinceSale: number,
  personality: string,
  salesStats?: SalesStats
) => {
  const model = getModel(FAST_MODEL);

  // Random fallback with weighted Morri phrases (~30% chance)
  const useMorriPhrase = Math.random() < 0.3;
  const randomFallback = useMorriPhrase
    ? MORRI_PHRASES[Math.floor(Math.random() * MORRI_PHRASES.length)]
    : FALLBACK_WINGMAN[Math.floor(Math.random() * FALLBACK_WINGMAN.length)];

  if (!model) return randomFallback;

  // ========== MORRI PERSONA SYSTEM PROMPT ==========
  const morriSystemPrompt = `
    Þú ert "MorriAI" - sérvitringur yfirmaður í fjáröflun fyrir góðgerð.
    
    ======== STRANGAR REGLUR ========
    
    1. ALDREI nota þessi orð (þetta er EKKI venjuleg sala):
       - "selja", "selt", "sölu"
       - "kaupa", "keypt"  
       - "viðskiptavinur"
       - "vöru"
    
    2. ALLTAF nota þessi orð í staðinn:
       - "styrkja" / "styrkt" / "stuðningur"
       - "gefa" / "gefið"
       - "styrktaraðili" / "gefandi"
       - "söfnun" / "fjáröflun"
    
    3. HÁMARKSLENGD: 12-15 orð. Passa í lítinn tilkynningarkassa.
    
    4. MORRI CATCHPHRASES (~30% tíma, ALDREI blanda saman):
       - "Gleðilegt nýtt hár!" (random greeting)
       - "Cock!" (væg blótsyrði, eins og "helvítis")
       - "Now watch this drive!" (eftir góð ráð)
       - "Hvern hefði grunað? Gvend hefði grunað." (þegar eitthvað gengur vel)
       - "Hvað kallaðiru mig? Ég sver að þú kallaðir mig X rétt í þessu" (leiðinlegt)
    
    5. TÓNN: Háorkumaður, dónalegt húmor, íslenskur slangur, skemmtilegur.
  `;

  // If no stats provided, use basic version
  if (!salesStats) {
    try {
      const prompt = `
        ${morriSystemPrompt}
        
        SAMHENGI: Notandi hefur ekki fengið styrk í ${minutesSinceSale} mínútur.
        
        VERKEFNI: Gefðu stutt, öflugt ráð til að fá næsta styrk. Max 12 orð.
        
        GOÐ DÆMI:
        - "Cock! Hringdu aftur, ekki hugsa."
        - "Þögnin vinnur. Nefndu upphæð og haltu kjafti."
        - "Næsti styrktaraðili er JÁ. Ég finn það."
        - "Ekki senda email. Biddu um peninginn. Now watch this drive!"
        
        SLÆM DÆMI (BANNAÐ):
        - "Seldu á næsta viðskiptavin" (BANNAÐ ORÐAFORÐI)
        - "Close the deal" (ENSKIÐ Á VITLAUSUM STAÐ)
      `;
      const result = await model.generateContent(prompt);
      return (await result.response).text().replace(/["]/g, '').replace(/\n/g, ' ').trim();
    } catch (e) {
      return randomFallback;
    }
  }

  // SMART SYSTEM: Analyze performance for charity fundraising
  const { salesToday, salesCount, hoursWorked, historicalAvg, goalToday, timeInShift } = salesStats;

  const currentRate = hoursWorked > 0 ? salesToday / hoursWorked : 0;
  const performanceVsAvg = historicalAvg > 0 ? (currentRate / historicalAvg) * 100 : 100;
  const goalProgress = goalToday > 0 ? (salesToday / goalToday) * 100 : 0;
  const hoursRemaining = Math.max(0, 8 - timeInShift);
  const projectedFinal = salesToday + (currentRate * hoursRemaining);
  const onPaceForGoal = projectedFinal >= goalToday;

  try {
    const prompt = `
      ${morriSystemPrompt}
      
      ======== ÁRANGUR Í DAG ========
      - Safnað: ${salesToday} kr (${salesCount} styrktaraðilar)
      - Núverandi hraði: ${performanceVsAvg.toFixed(0)}% af meðaltali
      - Framvinda að markmiði: ${goalProgress.toFixed(0)}%
      - Mínútur síðan síðasta styrk: ${minutesSinceSale}
      - Á réttri leið: ${onPaceForGoal ? 'JÁ' : 'NEI'}
      
      ======== VERKEFNI ========
      Gefðu EITT stutt ráð í Morri-stíl. Max 12 orð.
      
      ${performanceVsAvg > 100 ? 'Þú ert að standa þig betur en venjulega - hrósaðu með Morri húmor.' : ''}
      ${performanceVsAvg < 80 ? 'Þú ert að dragast aftur úr - gefðu öflugt, beint ráð.' : ''}
      ${minutesSinceSale > 30 ? 'Langt síðan síðasta styrk - þarf brýnt ráð.' : ''}
      ${goalProgress > 90 ? 'Næstum því á markmiði - hvettu til að klára.' : ''}
      
      ======== DÆMI UM GÓÐ SVÖR ========
      - "Þú ert að rífa þetta! Hvern hefði grunað? Gvend hefði!"
      - "Cock! Hringdu núna, hugsa seinna."
      - "Nefndu upphæðina og þegiðu. Þögnin vinnur."
      - "Gleðilegt nýtt hár! Næsti er JÁ."
      - "Now watch this drive! Lokaðu á næsta."
    `;

    const result = await model.generateContent(prompt);
    return (await result.response).text().replace(/["]/g, '').replace(/\n/g, ' ').trim();
  } catch (e) {
    return randomFallback;
  }
};

// --- PRE-SHIFT BRIEFING ---
export const getPreShiftBriefing = async (yesterdaySales: number, personality: string) => {
  const model = getModel(FAST_MODEL);
  if (!model) return { title: "Góðan dag!", body: "Gangi þér vel í fjáröfluninni í dag." };

  try {
    const prompt = `
      Þú ert MorriAI - fjáröflunarþjálfari.
      Söfnun í gær: ${yesterdaySales} kr.
      
      Skrifaðu stuttan morgunkynning í Morri-stíl.
      BANNAÐ: "selja", "viðskiptavinur"
      NOTAÐU: "styrkja", "styrktaraðili", "söfnun"
      
      JSON Format: { "title": "Stutt titill (max 4 orð)", "body": "2 stuttar setningar með Morri orku" }
    `;
    const result = await model.generateContent(prompt);
    return JSON.parse(stripMarkdown((await result.response).text()));
  } catch (e) {
    return { title: "Nýr dagur!", body: "Gleymdu gærdeginum. Gleðilegt nýtt hár! Þú átt þetta." };
  }
};

// --- PROJECT INSIGHTS ---
export const getAIProjectComparison = async (sales: Sale[]) => {
  const model = getModel(FAST_MODEL);
  if (!model) return { headline: "Greining ófáanleg", tip: "Safnaðu fleiri styrkjum." };

  const summary: Record<string, number> = {};
  sales.forEach(s => summary[s.project] = (summary[s.project] || 0) + s.amount);

  try {
    const prompt = `
      Greindu söfnun fyrir góðgerðarfélög: ${JSON.stringify(summary)}.
      
      BANNAÐ: Orðið "selja"
      NOTAÐU: "söfnun", "styrkir"
      
      1. Headline (max 6 orð).
      2. Tip (max 10 orð).
      JSON Format: {"headline": "...", "tip": "..."}. Íslenska.
    `;
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    });
    return JSON.parse(stripMarkdown(result.response.text()));
  } catch (e) {
    return { headline: "Engin greining.", tip: "Haltu áfram að safna styrkjum." };
  }
};
