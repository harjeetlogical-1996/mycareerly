// Gift recommendation data: flowers tagged by recipient + occasion + budget

export type Recipient = "mom" | "partner" | "friend" | "colleague" | "anyone";
export type Occasion = "birthday" | "anniversary" | "thank-you" | "sympathy" | "congratulations" | "get-well" | "just-because";
export type Budget = 25 | 50 | 100;

export type GiftFlower = {
  name: string;
  recipients: Recipient[];
  occasions: Occasion[];
  minBudget: Budget;       // smallest budget tier where this flower fits
  meaning: string;          // 1-line gift symbolism
  why: string;              // 2-3 sentences on WHY this flower fits the recipient/occasion
  careTip: string;          // 1-line care tip (newcomer-friendly)
  vaseLife: string;         // e.g. "5-7 days"
  color: string;            // primary color hex (for swatch)
  bestSeason: string;       // e.g. "Year-round" or "Spring/Summer"
};

export const GIFT_FLOWERS: GiftFlower[] = [
  // ── ROMANTIC / PARTNER ──────────────────────────────────────────────────────
  {
    name: "Red Roses",
    recipients: ["partner"],
    occasions: ["anniversary", "birthday", "just-because"],
    minBudget: 50,
    meaning: "Passionate love and devotion",
    why: "The universal symbol of romantic love. A dozen red roses says everything words can't — perfect when you want to make your partner feel uniquely cherished.",
    careTip: "Recut stems at 45° underwater every 2-3 days for max vase life.",
    vaseLife: "7-10 days",
    color: "#C62828",
    bestSeason: "Year-round",
  },
  {
    name: "Pink Peonies",
    recipients: ["partner", "mom"],
    occasions: ["anniversary", "birthday", "just-because", "congratulations"],
    minBudget: 100,
    meaning: "Romance, prosperity, and happy marriage",
    why: "Lush, fragrant, and ridiculously photogenic. Peonies feel both elegant and abundant — they're an automatic upgrade from any standard bouquet.",
    careTip: "Buy closed buds — they'll bloom in warm water within 24-48 hours.",
    vaseLife: "5-7 days",
    color: "#F48FB1",
    bestSeason: "Spring/Early Summer",
  },
  {
    name: "Tulips",
    recipients: ["partner", "mom", "friend", "anyone"],
    occasions: ["birthday", "just-because", "thank-you", "congratulations"],
    minBudget: 25,
    meaning: "Perfect love and cheerful thoughts",
    why: "Affordable, elegant, and available in nearly every color. Tulips skip the over-the-top vibe of roses while still feeling thoughtful and hand-picked.",
    careTip: "Use COLD water and trim stems straight, not at an angle.",
    vaseLife: "5-7 days",
    color: "#E91E63",
    bestSeason: "Spring",
  },
  {
    name: "Ranunculus",
    recipients: ["partner", "mom", "friend"],
    occasions: ["anniversary", "birthday", "congratulations"],
    minBudget: 50,
    meaning: "Charm, attractiveness, and admiration",
    why: "Looks like a peony's smaller, more affordable cousin. Layers of paper-thin petals in pastels — universally loved and Instagrammable.",
    careTip: "Cool location away from heat — these are spring flowers and hate warmth.",
    vaseLife: "7-10 days",
    color: "#FFAB91",
    bestSeason: "Spring",
  },

  // ── MOM / FAMILY ────────────────────────────────────────────────────────────
  {
    name: "Hydrangeas",
    recipients: ["mom", "anyone"],
    occasions: ["birthday", "thank-you", "just-because", "congratulations"],
    minBudget: 50,
    meaning: "Gratitude, heartfelt understanding",
    why: "Big, lush, and impressive — hydrangeas fill a room and last well. Especially loved by moms who appreciate substantial, garden-style arrangements.",
    careTip: "Mist the flower heads daily — hydrangeas drink through their petals too.",
    vaseLife: "5-10 days",
    color: "#90CAF9",
    bestSeason: "Summer/Fall",
  },
  {
    name: "Lilies",
    recipients: ["mom", "anyone"],
    occasions: ["birthday", "thank-you", "sympathy", "get-well", "just-because"],
    minBudget: 50,
    meaning: "Refined beauty and devotion",
    why: "Multiple buds per stem mean they keep opening over 1-2 weeks. The fragrance is iconic and the look is timelessly elegant — a safe and impressive choice.",
    careTip: "Gently remove orange pollen anthers to prevent staining (and to last longer).",
    vaseLife: "8-14 days",
    color: "#FFFFFF",
    bestSeason: "Year-round",
  },
  {
    name: "Mixed Garden Bouquet",
    recipients: ["mom", "friend", "anyone"],
    occasions: ["birthday", "thank-you", "just-because", "get-well", "congratulations"],
    minBudget: 25,
    meaning: "Joy, abundance, and warm wishes",
    why: "A florist-curated mix gives variety and personality without committing to one flower. Affordable, always feels generous, and works for almost any recipient.",
    careTip: "Change water every 2 days and remove any wilted stems early.",
    vaseLife: "7-10 days",
    color: "#9CCC65",
    bestSeason: "Year-round",
  },
  {
    name: "Carnations",
    recipients: ["mom", "friend", "colleague", "anyone"],
    occasions: ["birthday", "thank-you", "just-because", "get-well"],
    minBudget: 25,
    meaning: "Love, fascination, and distinction",
    why: "Wildly underrated — carnations last 2+ weeks and come in stunning colors. The traditional Mother's Day flower for good reason: long-lasting and full of meaning.",
    careTip: "Cut between the knobby joints on the stem for best water uptake.",
    vaseLife: "10-14 days",
    color: "#EC407A",
    bestSeason: "Year-round",
  },

  // ── FRIENDSHIP / FRIEND ─────────────────────────────────────────────────────
  {
    name: "Sunflowers",
    recipients: ["friend", "colleague", "anyone"],
    occasions: ["birthday", "congratulations", "get-well", "thank-you", "just-because"],
    minBudget: 25,
    meaning: "Adoration, loyalty, and warmth",
    why: "Big, cheerful, and impossible to ignore. Sunflowers say 'you brighten my life' without being romantic — perfect for friends, mentors, and recovery wishes.",
    careTip: "Use a tall, heavy vase — they're top-heavy and prone to tipping.",
    vaseLife: "6-12 days",
    color: "#FDD835",
    bestSeason: "Summer/Fall",
  },
  {
    name: "Yellow Roses",
    recipients: ["friend", "colleague"],
    occasions: ["birthday", "thank-you", "congratulations", "just-because", "get-well"],
    minBudget: 50,
    meaning: "Friendship, joy, and new beginnings",
    why: "Roses without the romantic baggage. Yellow roses mean pure friendship — the perfect 'I value you' gift that won't be misread.",
    careTip: "Strip all leaves below the waterline to prevent bacteria buildup.",
    vaseLife: "7-10 days",
    color: "#FBC02D",
    bestSeason: "Year-round",
  },
  {
    name: "Gerbera Daisies",
    recipients: ["friend", "colleague", "anyone"],
    occasions: ["birthday", "get-well", "thank-you", "congratulations", "just-because"],
    minBudget: 25,
    meaning: "Cheerfulness and pure joy",
    why: "Cartoon-bright and instantly mood-lifting. Gerberas come in every color of the rainbow — fun, unfussy, and universally welcome.",
    careTip: "Use shallow water (1-2 inches) — deep water rots their stems fast.",
    vaseLife: "4-7 days",
    color: "#FF7043",
    bestSeason: "Year-round",
  },
  {
    name: "Daisies",
    recipients: ["friend", "colleague", "anyone"],
    occasions: ["birthday", "thank-you", "just-because"],
    minBudget: 25,
    meaning: "Innocence, loyal love, and purity of thought",
    why: "Simple, unfussy, and universally liked. Daisies are the friendship flower — they say 'I'm thinking of you' without big proclamations.",
    careTip: "Change water daily — daisies are bacteria-prone and fade fast in murky water.",
    vaseLife: "5-7 days",
    color: "#FFFFFF",
    bestSeason: "Spring/Summer",
  },

  // ── COLLEAGUE / PROFESSIONAL ────────────────────────────────────────────────
  {
    name: "Orchids",
    recipients: ["colleague", "anyone", "mom"],
    occasions: ["congratulations", "thank-you", "just-because", "birthday"],
    minBudget: 50,
    meaning: "Refinement, beauty, and respect",
    why: "Sophisticated and long-lasting (2-3 weeks). The classy professional gift — appropriate for anyone, never too personal, always impressive.",
    careTip: "Keep in indirect light with just an inch of water — orchids drink less than you think.",
    vaseLife: "14-21 days",
    color: "#AB47BC",
    bestSeason: "Year-round",
  },
  {
    name: "White Lilies",
    recipients: ["colleague", "anyone"],
    occasions: ["congratulations", "sympathy", "thank-you", "just-because"],
    minBudget: 50,
    meaning: "Purity, virtue, and renewal",
    why: "Polished and respectful — appropriate for both formal congratulations and sensitive moments. The professional safe-bet that never feels generic.",
    careTip: "Remove pollen anthers immediately to prevent staining clothes and surfaces.",
    vaseLife: "8-14 days",
    color: "#FAFAFA",
    bestSeason: "Year-round",
  },
  {
    name: "Succulents",
    recipients: ["colleague", "friend", "anyone"],
    occasions: ["congratulations", "thank-you", "just-because", "birthday"],
    minBudget: 25,
    meaning: "Enduring affection and resilience",
    why: "Lasting weeks-to-years instead of days. Modern, low-maintenance, and great for offices — sends a message of 'I value something that lasts'.",
    careTip: "Water sparingly — soak the soil only when dry to the touch (every 2-3 weeks).",
    vaseLife: "Months to years",
    color: "#66BB6A",
    bestSeason: "Year-round",
  },

  // ── SYMPATHY / GET WELL ─────────────────────────────────────────────────────
  {
    name: "White Roses",
    recipients: ["anyone", "colleague", "mom"],
    occasions: ["sympathy", "congratulations", "anniversary"],
    minBudget: 50,
    meaning: "Reverence, purity, and new beginnings",
    why: "Quietly powerful. White roses honor a moment without overwhelming it — appropriate for both somber and celebratory occasions when restraint matters.",
    careTip: "Display in a clean glass vase to let the petals speak for themselves.",
    vaseLife: "7-10 days",
    color: "#FAFAFA",
    bestSeason: "Year-round",
  },
  {
    name: "White Chrysanthemums",
    recipients: ["anyone"],
    occasions: ["sympathy"],
    minBudget: 25,
    meaning: "Honor, remembrance, and lamentation",
    why: "Traditional sympathy flowers across many cultures. Long-lasting and respectful — they communicate care without imposing.",
    careTip: "Cool location, away from direct sunlight, to maximize the long vase life.",
    vaseLife: "10-14 days",
    color: "#FAFAFA",
    bestSeason: "Fall",
  },
  {
    name: "Pink Gerbera Daisies",
    recipients: ["anyone", "friend"],
    occasions: ["get-well"],
    minBudget: 25,
    meaning: "Cheerfulness and recovery",
    why: "Big happy faces in cheerful pink — the visual equivalent of a hug. Hospital-friendly (low pollen, no strong scent) and impossible to dislike.",
    careTip: "Trim stem ends weekly and keep in shallow fresh water.",
    vaseLife: "4-7 days",
    color: "#F06292",
    bestSeason: "Year-round",
  },
  {
    name: "Alstroemeria",
    recipients: ["friend", "colleague", "anyone"],
    occasions: ["get-well", "thank-you", "just-because", "birthday"],
    minBudget: 25,
    meaning: "Devotion, friendship, and mutual support",
    why: "Each stem has 3-5 lily-like blooms — incredible value for the budget. Lasts 2 weeks, perfect for hospital visits or someone who needs sustained cheer.",
    careTip: "Strip lower leaves — they yellow and foul water faster than other flowers.",
    vaseLife: "10-14 days",
    color: "#FF8A65",
    bestSeason: "Year-round",
  },
];

export const RECIPIENTS: { value: Recipient; label: string; emoji: string; desc: string }[] = [
  { value: "mom",       label: "Mom (or Mother Figure)", emoji: "👩‍👧", desc: "Birthday, Mother's Day, just because" },
  { value: "partner",   label: "Partner / Spouse",       emoji: "💑",   desc: "Romantic — anniversary or surprise" },
  { value: "friend",    label: "Friend",                 emoji: "🤝",   desc: "Birthday, congrats, or thinking of you" },
  { value: "colleague", label: "Colleague / Boss",       emoji: "💼",   desc: "Professional thank-you or congrats" },
  { value: "anyone",    label: "Someone Else",           emoji: "🎁",   desc: "Show me universal options" },
];

export const OCCASIONS: { value: Occasion; label: string; emoji: string }[] = [
  { value: "birthday",        label: "Birthday",          emoji: "🎂" },
  { value: "anniversary",     label: "Anniversary",       emoji: "💕" },
  { value: "thank-you",       label: "Thank You",         emoji: "🙏" },
  { value: "congratulations", label: "Congratulations",   emoji: "🎉" },
  { value: "get-well",        label: "Get Well Soon",     emoji: "💐" },
  { value: "sympathy",        label: "Sympathy",          emoji: "🕊️" },
  { value: "just-because",    label: "Just Because",      emoji: "✨" },
];

export const BUDGETS: { value: Budget; label: string; desc: string }[] = [
  { value: 25,  label: "$25–50",   desc: "Cheerful and thoughtful" },
  { value: 50,  label: "$50–100",  desc: "Premium and impressive" },
  { value: 100, label: "$100+",    desc: "Statement-making" },
];

/**
 * Recommend top 3 flowers based on user choices.
 * Scoring: recipient match + occasion match + budget fit
 */
export function recommendFlowers(
  recipient: Recipient,
  occasion: Occasion,
  budget: Budget
): GiftFlower[] {
  const scored = GIFT_FLOWERS
    .filter((f) => f.minBudget <= budget) // budget gate
    .map((f) => {
      let score = 0;
      // Recipient match (or universal)
      if (f.recipients.includes(recipient)) score += 5;
      else if (f.recipients.includes("anyone")) score += 2;
      // Occasion match
      if (f.occasions.includes(occasion)) score += 5;
      // Budget fit (prefer flowers IN this tier, not below)
      if (f.minBudget === budget) score += 1;
      // Slight penalty if too entry-level for high budget
      if (budget === 100 && f.minBudget === 25) score -= 1;
      return { f, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((x) => x.f);
}
