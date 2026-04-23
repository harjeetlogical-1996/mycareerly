// Data for interactive tools: birth flowers, vase life, meanings

// ── BIRTH FLOWERS ─────────────────────────────────────────────────────────────
export type BirthFlowerEntry = {
  month: number;        // 1-12
  monthName: string;
  primary: { name: string; meaning: string; color: string; description: string };
  secondary: { name: string; meaning: string; color: string; description: string };
};

export const BIRTH_FLOWERS: BirthFlowerEntry[] = [
  {
    month: 1, monthName: "January",
    primary:   { name: "Carnation", meaning: "Love, admiration, and distinction", color: "#E8705A",
                 description: "The carnation's ruffled petals and long-lasting blooms symbolize the kind of love that grows deeper with time. Red means passionate love, pink means gratitude, white means pure affection." },
    secondary: { name: "Snowdrop", meaning: "Hope and rebirth", color: "#F4F3F0",
                 description: "As one of the first flowers to push through winter snow, the snowdrop represents new beginnings and quiet optimism — a reminder that even after the coldest days, spring returns." },
  },
  {
    month: 2, monthName: "February",
    primary:   { name: "Violet", meaning: "Modesty, faithfulness, and spiritual wisdom", color: "#8B5CF6",
                 description: "Violets have been associated with humility and sincere affection since ancient Greece. Napoleon famously left violets on Josephine's grave every year on their anniversary." },
    secondary: { name: "Primrose", meaning: "Young love and I can't live without you", color: "#F9EBE8",
                 description: "The primrose's early spring bloom made it a Victorian symbol of first love — especially yellow primroses, traditionally given to express sincere devotion." },
  },
  {
    month: 3, monthName: "March",
    primary:   { name: "Daffodil", meaning: "New beginnings and unwavering regard", color: "#FFD700",
                 description: "Bright yellow trumpets heralding spring, daffodils symbolize renewal and positivity. They're the official flower for 10th wedding anniversaries and cancer awareness." },
    secondary: { name: "Jonquil", meaning: "Desire and affection returned", color: "#FFEB3B",
                 description: "A close relative of the daffodil, jonquils have a sweeter fragrance and represent returned affection — the perfect gift when you want someone to know you appreciate their love." },
  },
  {
    month: 4, monthName: "April",
    primary:   { name: "Daisy", meaning: "Innocence, purity, and loyal love", color: "#FFFFFF",
                 description: "The simple daisy has represented innocence since ancient times. The tradition of 'he loves me, he loves me not' comes from this flower's simple beauty and universal appeal." },
    secondary: { name: "Sweet Pea", meaning: "Blissful pleasure and goodbye", color: "#F48FB1",
                 description: "With their delicate fragrance and pastel colors, sweet peas traditionally mark pleasant departures — given to wish someone well on a new journey." },
  },
  {
    month: 5, monthName: "May",
    primary:   { name: "Lily of the Valley", meaning: "Sweetness, humility, and return of happiness", color: "#FFFFFF",
                 description: "These tiny bell-shaped blooms with intoxicating fragrance were featured in Kate Middleton's royal wedding bouquet. They represent the return of joy after difficult times." },
    secondary: { name: "Hawthorn", meaning: "Hope and supreme happiness", color: "#FCE4EC",
                 description: "The hawthorn's spring bloom signals the arrival of May in Celtic tradition. Its clusters of tiny flowers represent a hope that's fulfilled and abundant happiness." },
  },
  {
    month: 6, monthName: "June",
    primary:   { name: "Rose", meaning: "Love, beauty, and romance", color: "#E8705A",
                 description: "Universally recognized as the flower of love, roses speak every language of affection. Each color carries its own meaning — red for passion, pink for admiration, white for purity, yellow for friendship." },
    secondary: { name: "Honeysuckle", meaning: "Devoted affection and everlasting bonds", color: "#FFF59D",
                 description: "Honeysuckle's climbing habit and sweet fragrance represent bonds of love that endure. In Victorian flower language, it symbolized 'generous and devoted affection.'" },
  },
  {
    month: 7, monthName: "July",
    primary:   { name: "Larkspur", meaning: "Open heart, strong bonds, and positivity", color: "#5C6BC0",
                 description: "Tall spikes of larkspur (delphinium family) symbolize an open heart and strong bonds of love. Different colors carry nuanced meanings — pink for fickleness, white for joy, purple for first love." },
    secondary: { name: "Water Lily", meaning: "Purity and enlightenment", color: "#F8BBD0",
                 description: "Rising from muddy water to bloom in pristine beauty, water lilies represent the human journey toward spiritual awakening — revered in Eastern and Western traditions alike." },
  },
  {
    month: 8, monthName: "August",
    primary:   { name: "Gladiolus", meaning: "Strength of character, integrity, and remembrance", color: "#E57373",
                 description: "The gladiolus's sword-like stems give it its name (from Latin 'gladius'). Roman gladiators wore them for victory. Today they represent moral integrity and unwavering strength." },
    secondary: { name: "Poppy", meaning: "Imagination and remembrance", color: "#E53935",
                 description: "Red poppies symbolize remembrance (especially for fallen soldiers), while other colors represent imagination, rest, and consolation." },
  },
  {
    month: 9, monthName: "September",
    primary:   { name: "Aster", meaning: "Wisdom, valor, and faith", color: "#9C27B0",
                 description: "The aster's star-shaped bloom (Greek for 'star') has symbolized the divine since ancient Greece, when they were placed on altars of the gods. Purple asters mean royalty and wisdom." },
    secondary: { name: "Morning Glory", meaning: "Affection and mortality", color: "#3F51B5",
                 description: "Morning glories open with the sunrise and close by afternoon, representing the fleeting nature of beauty and life. A poignant symbol of cherishing the moment." },
  },
  {
    month: 10, monthName: "October",
    primary:   { name: "Marigold", meaning: "Warmth, creativity, and passion", color: "#FF9800",
                 description: "Marigolds' bold gold and orange hues mirror October sunsets. In Mexican tradition, they guide the spirits of loved ones home during Día de los Muertos." },
    secondary: { name: "Cosmos", meaning: "Order, harmony, and peace", color: "#F48FB1",
                 description: "The cosmos takes its name from the Greek word for 'harmony.' Its symmetrical petals reflect the ordered beauty of the universe — perfect for peaceful souls." },
  },
  {
    month: 11, monthName: "November",
    primary:   { name: "Chrysanthemum", meaning: "Friendship, joy, and longevity", color: "#FFEB3B",
                 description: "Known as 'mum,' the chrysanthemum is the official flower of the Japanese Imperial family and represents longevity in Asian traditions. In the US, it's a symbol of friendship and cheerfulness." },
    secondary: { name: "Peony", meaning: "Prosperity, honor, and compassion", color: "#F8BBD0",
                 description: "Though peonies traditionally bloom in May-June, they're sometimes associated with late autumn through varieties. They symbolize romance, prosperity, and a happy marriage." },
  },
  {
    month: 12, monthName: "December",
    primary:   { name: "Narcissus (Paperwhite)", meaning: "Self-love, rebirth, and good wishes", color: "#FFFFFF",
                 description: "Unlike their springtime siblings, paperwhite narcissus bloom indoors in winter, representing hope during the darkest month. The scientific name comes from Greek mythology." },
    secondary: { name: "Holly", meaning: "Domestic happiness and defense", color: "#D32F2F",
                 description: "Though technically a berry-bearing plant, holly's winter bloom and bright red berries symbolize home, protection, and festive joy — the classic December greenery." },
  },
];

// ── VASE LIFE DATA ─────────────────────────────────────────────────────────────
export type VaseLifeFlower = {
  name: string;
  image?: string;
  minDays: number;
  maxDays: number;
  difficulty: "Easy" | "Moderate" | "Tricky";
  waterTemp: "Cold" | "Lukewarm" | "Warm";
  flowerFood: "Required" | "Recommended" | "Optional";
  retrimEvery: string; // "2 days", "3-4 days"
  idealLocation: string;
  tips: string[];
  avoid: string[];
};

export const VASE_LIFE_FLOWERS: VaseLifeFlower[] = [
  {
    name: "Roses",
    minDays: 7, maxDays: 10, difficulty: "Moderate",
    waterTemp: "Lukewarm", flowerFood: "Required", retrimEvery: "2 days",
    idealLocation: "Cool room away from direct sun, fruit, and heat vents",
    tips: [
      "Cut stems at 45° angle underwater — prevents air bubbles blocking water uptake",
      "Strip ALL leaves below waterline (rotting leaves kill roses fast)",
      "Change water every 2 days + retrim stems each time",
      "Revive drooping roses: recut underwater, then submerge whole stem in lukewarm water for 1 hour",
    ],
    avoid: ["Direct sunlight", "Near ripening fruit (ethylene gas)", "Cold water shock"],
  },
  {
    name: "Tulips",
    minDays: 5, maxDays: 7, difficulty: "Easy",
    waterTemp: "Cold", flowerFood: "Optional", retrimEvery: "3 days",
    idealLocation: "Cool spot — tulips droop quickly in warm rooms",
    tips: [
      "Use COLD water only — tulips are spring flowers and hate warmth",
      "Trim stems straight (not angled) — tulips drink through their stems like straws",
      "Keep stems short (4-5 inches in vase) — long stems droop dramatically",
      "Drop a penny in the water to slow down opening (old florist trick)",
    ],
    avoid: ["Warm water", "Flower food (actually shortens tulip life)", "Cramped vases (they move toward light)"],
  },
  {
    name: "Peonies",
    minDays: 5, maxDays: 7, difficulty: "Moderate",
    waterTemp: "Warm", flowerFood: "Recommended", retrimEvery: "3 days",
    idealLocation: "Cool location — warmth opens them too fast",
    tips: [
      "Buy closed buds (feel like marshmallows) for longest life",
      "Warm water helps tight buds open into full blooms in 24-48 hours",
      "Gently rinse ants off buds — they're harmless but unsightly",
      "Once fully open, move to coolest room to slow aging",
    ],
    avoid: ["Direct sun", "Hot rooms", "Cutting stems too short"],
  },
  {
    name: "Sunflowers",
    minDays: 6, maxDays: 12, difficulty: "Easy",
    waterTemp: "Lukewarm", flowerFood: "Optional", retrimEvery: "2 days",
    idealLocation: "Bright spot — they actually enjoy light (unlike most cut flowers)",
    tips: [
      "Use a tall heavy vase — sunflowers are top-heavy and tip over",
      "Change water daily — sunflowers are heavy drinkers and water gets murky fast",
      "Strip lower leaves aggressively — they foul water quickly",
      "A few drops of bleach keeps water clear longer",
    ],
    avoid: ["Shallow vases", "Stagnant water", "Small flower food packets (use your own mix)"],
  },
  {
    name: "Hydrangeas",
    minDays: 4, maxDays: 10, difficulty: "Tricky",
    waterTemp: "Cold", flowerFood: "Required", retrimEvery: "2 days",
    idealLocation: "Cool, humid area — bathrooms actually work well",
    tips: [
      "Dip stem ends in alum powder (spice aisle) before placing in vase — prevents sap seal",
      "Mist flower heads daily — hydrangeas drink through their petals",
      "If they wilt, submerge ENTIRE head in cold water for 30 minutes to revive",
      "Crush the bottom inch of stem with a hammer to maximize water uptake",
    ],
    avoid: ["Dry air", "Warm rooms", "Waiting to revive — act at first wilt sign"],
  },
  {
    name: "Lilies",
    minDays: 8, maxDays: 14, difficulty: "Easy",
    waterTemp: "Lukewarm", flowerFood: "Recommended", retrimEvery: "3-4 days",
    idealLocation: "Indirect light, cool room",
    tips: [
      "Gently remove orange pollen anthers with tissue — prevents staining everything",
      "Trim stems underwater at 45° angle",
      "Remove faded blooms as they die — new buds will open",
      "Each stem has multiple buds that open over 1-2 weeks",
    ],
    avoid: ["Pollen contact with cats (TOXIC — can cause kidney failure)", "Direct sun", "Overcrowding"],
  },
  {
    name: "Orchids",
    minDays: 14, maxDays: 21, difficulty: "Moderate",
    waterTemp: "Lukewarm", flowerFood: "Optional", retrimEvery: "Weekly",
    idealLocation: "Indirect bright light, cool room",
    tips: [
      "Orchids last LONGEST of any cut flower — 2-3 weeks easily",
      "Very little water needed — an inch or two is plenty",
      "Spray stems with water to maintain humidity",
      "Cut spent blooms individually — others continue",
    ],
    avoid: ["Overwatering", "Direct sun", "Drafts from AC/heaters"],
  },
  {
    name: "Carnations",
    minDays: 7, maxDays: 14, difficulty: "Easy",
    waterTemp: "Lukewarm", flowerFood: "Recommended", retrimEvery: "3 days",
    idealLocation: "Anywhere — carnations are nearly indestructible",
    tips: [
      "Cut between the nodes (the knobby joints on the stem) for better water uptake",
      "Carnations are the longest-lasting affordable cut flower",
      "Dyed carnations (blue, teal, rainbow) still last 1-2 weeks",
      "Great for busy households — they tolerate forgetfulness",
    ],
    avoid: ["Overthinking — these flowers are forgiving"],
  },
  {
    name: "Chrysanthemums",
    minDays: 10, maxDays: 14, difficulty: "Easy",
    waterTemp: "Lukewarm", flowerFood: "Optional", retrimEvery: "4-5 days",
    idealLocation: "Cool spot, indirect light",
    tips: [
      "Among the longest-lasting cut flowers — great value",
      "Cut stems under water and crush the ends with a hammer",
      "Remove leaves below waterline — they rot quickly in mums",
      "Work beautifully in mixed bouquets as filler",
    ],
    avoid: ["Warm water", "Deep water (1-2 inches is plenty)"],
  },
  {
    name: "Alstroemeria",
    minDays: 10, maxDays: 14, difficulty: "Easy",
    waterTemp: "Lukewarm", flowerFood: "Recommended", retrimEvery: "3 days",
    idealLocation: "Cool room, indirect light",
    tips: [
      "Also known as Peruvian lily — each stem has 3-5 lily-like blooms",
      "Excellent cut flower — lasts 2+ weeks with minimal care",
      "Strip lower leaves — they yellow and foul water",
      "Often used as filler but striking enough to stand alone",
    ],
    avoid: ["Too much light (petals fade)", "Dry rooms"],
  },
  {
    name: "Daisies",
    minDays: 5, maxDays: 7, difficulty: "Easy",
    waterTemp: "Lukewarm", flowerFood: "Optional", retrimEvery: "2-3 days",
    idealLocation: "Bright but not direct sun",
    tips: [
      "Change water daily — daisies are prone to bacteria",
      "Trim stems and remove lower leaves",
      "Daisies include many varieties: Gerbera (shorter life), Shasta (longer)",
      "Cheap, cheerful, and surprisingly long-lasting if water stays clean",
    ],
    avoid: ["Stagnant water", "Crowded vases"],
  },
  {
    name: "Gerbera Daisies",
    minDays: 4, maxDays: 7, difficulty: "Tricky",
    waterTemp: "Lukewarm", flowerFood: "Recommended", retrimEvery: "1-2 days",
    idealLocation: "Cool room, supported upright",
    tips: [
      "Weakest stems of any flower — they flop over dramatically",
      "Use a tall vase or wire support to keep heads upright",
      "Shallow water only (1-2 inches) — deep water rots stems fast",
      "Pierce stem with a pin just below the flower head to release air",
    ],
    avoid: ["Deep water", "Unsupported stems", "Warm rooms"],
  },
];

// ── FLOWER MEANINGS (CULTURAL) ────────────────────────────────────────────────
export type FlowerMeaning = {
  name: string;
  image?: string;
  victorian: string;
  japanese: string;  // Hanakotoba
  chinese: string;
  greek: string;     // classical mythology
  christian: string;
};

export const FLOWER_MEANINGS: FlowerMeaning[] = [
  {
    name: "Red Rose",
    victorian: "Passionate romantic love — the ultimate declaration of devotion.",
    japanese: "In Japan, red roses (bara) mean 'I love you' — reserved for deep romantic commitment.",
    chinese: "Symbol of prosperity, beauty, and enduring love. Associated with the goddess of beauty.",
    greek: "Sacred to Aphrodite, goddess of love — said to have sprung from her tears.",
    christian: "The blood of Christ and the sacrificial love of martyrs. Associated with Virgin Mary.",
  },
  {
    name: "White Lily",
    victorian: "Majesty, purity, and virginity. Often given at engagements and christenings.",
    japanese: "Purity, innocence — strongly associated with new beginnings and religious ceremonies.",
    chinese: "Hundred years of love. Traditionally given at weddings to wish the couple long happiness.",
    greek: "Sacred to Hera, queen of the gods — said to have sprung from her milk.",
    christian: "The Virgin Mary's flower — represents purity and the Annunciation. Featured in religious art.",
  },
  {
    name: "Chrysanthemum",
    victorian: "Cheerfulness and friendship. A Victorian favorite for expressing warm regard.",
    japanese: "The imperial family's crest — symbolizes longevity, rejuvenation, and the Emperor himself.",
    chinese: "One of the 'Four Gentlemen' in Chinese art — represents autumn, integrity, and nobility.",
    greek: "Associated with Zeus and funeral rites — remembrance and honor.",
    christian: "In European tradition, chrysanthemums are funeral flowers (especially in France and Italy).",
  },
  {
    name: "Cherry Blossom",
    victorian: "Education, spiritual beauty, and the transience of life.",
    japanese: "Sakura — the national flower. Represents the beauty and brevity of life (mono no aware).",
    chinese: "Feminine beauty, love, and sexuality. Symbol of good fortune.",
    greek: "Not native to Greece; associated later with fertility deities in Mediterranean cultures.",
    christian: "Innocence and the sweetness of Christ's love. Used in religious paintings.",
  },
  {
    name: "Sunflower",
    victorian: "Adoration, loyalty, and longevity. A symbol of devoted love that follows its object.",
    japanese: "Energy, vitality, and respect — often given on Father's Day and to honor elders.",
    chinese: "Good luck, longevity, and happiness. Associated with imperial power (yellow = emperor).",
    greek: "The myth of Clytie — a nymph turned into a sunflower for loving Apollo, forever facing him.",
    christian: "Represents the soul's devotion to God, always turning toward divine light.",
  },
  {
    name: "Lotus",
    victorian: "Not commonly used in Victorian floriography (Eastern flower).",
    japanese: "Purity and enlightenment — rising pristine from muddy water. Sacred in Buddhism.",
    chinese: "Purity, perfection, and enlightenment. Symbol of Buddhism and the summer season.",
    greek: "The lotus-eaters in Homer's Odyssey — flower of forgetfulness and contentment.",
    christian: "Not a traditional symbol but sometimes associated with resurrection (rising from murky water).",
  },
  {
    name: "Iris",
    victorian: "Faith, wisdom, and a message — the Greek goddess Iris was messenger of the gods.",
    japanese: "Courage, protection, and heroic spirit. Used in Boys' Day celebrations.",
    chinese: "Called the 'purple butterfly' — represents the vanishing beauty of spring and freedom.",
    greek: "Goddess Iris, messenger between gods and humans. Rainbow of colors = divine communication.",
    christian: "The Virgin Mary — sword-like leaves represent the sorrows of Mary's heart.",
  },
  {
    name: "Daisy",
    victorian: "Innocence, loyal love, and purity of thought. A Victorian symbol of childhood.",
    japanese: "Faith, hope, and cheerfulness — associated with good fortune.",
    chinese: "Symbol of patience, simplicity, and new beginnings.",
    greek: "Sacred to Artemis, goddess of wild nature — represents freedom and youth.",
    christian: "Humility and innocence. Associated with Mary Magdalene in some traditions.",
  },
  {
    name: "Tulip",
    victorian: "A declaration of love. Red = passion, yellow = cheerful thoughts, variegated = beautiful eyes.",
    japanese: "Charity, fame, and perfect love. Often given in romantic contexts.",
    chinese: "Symbol of perfect lover and fame — came to China via the Silk Road.",
    greek: "Not native; associated later with Ottoman symbolism of paradise and heaven.",
    christian: "Newer symbol — represents the Trinity's three persons in a single flower (Dutch tradition).",
  },
  {
    name: "Peony",
    victorian: "Bashfulness, happy marriage, and prosperity. A Victorian favorite for weddings.",
    japanese: "Good fortune, bravery, and honor — symbolic of the samurai class.",
    chinese: "The national flower of China — king of flowers. Symbol of wealth, nobility, and romance.",
    greek: "Named after Paeon, physician of the gods, who was transformed into the flower.",
    christian: "Not a traditional Christian symbol but associated with healing (due to medicinal use).",
  },
  {
    name: "Orchid",
    victorian: "Rare beauty, refinement, and ecstasy. A symbol of luxury in Victorian greenhouses.",
    japanese: "Nobility, integrity, and friendship. Among the 'Four Gentlemen' in East Asian tradition.",
    chinese: "One of the 'Four Gentlemen' — represents refinement, friendship, and quiet beauty.",
    greek: "Associated with virility in ancient Greece — name comes from 'orchis' (testicle, from bulbs).",
    christian: "Symbolizes the richness of God's creation. Less common in traditional religious symbolism.",
  },
  {
    name: "Carnation",
    victorian: "Fascination and women's love. Each color has distinct meaning in Victorian code.",
    japanese: "Love and fascination. Mother's Day flower in Japan.",
    chinese: "Love, fascination, and distinction. Ornamental.",
    greek: "From the Greek 'dianthus' meaning 'flower of the gods' — sacred to Zeus.",
    christian: "The blood and tears of Mary — legend says they sprang where her tears fell at the Crucifixion.",
  },
  {
    name: "Lavender",
    victorian: "Distrust or devotion (context-dependent). Also represents solitude and calm.",
    japanese: "Devotion, silence, and reverence. Associated with grace and cleanliness.",
    chinese: "Devotion, virtue, and quiet grace. Used in traditional medicine for calm.",
    greek: "Sacred to Hestia, goddess of hearth — represents home, calm, and purity.",
    christian: "Virtue and purity. The Virgin Mary is said to have laid Christ's swaddling clothes on lavender.",
  },
  {
    name: "Magnolia",
    victorian: "Dignity, perseverance, and love of nature. A Southern US symbol of grace.",
    japanese: "Perseverance, dignity, and beauty. Ancient flower symbol dating back millions of years.",
    chinese: "Nobility, purity, and feminine beauty. Empress flower in imperial courts.",
    greek: "Not native; later associated with feminine beauty and timeless endurance.",
    christian: "Perseverance and the rewards of a righteous life. Southern US Christian symbolism.",
  },
  {
    name: "Marigold",
    victorian: "Grief, sorrow, or jealousy. Often used in mourning bouquets.",
    japanese: "Jealousy — used to represent difficult or stubborn feelings.",
    chinese: "Not a traditional Chinese symbol — associated with longevity in some regions.",
    greek: "Sacred to Demeter — represents grief for her daughter Persephone's descent to the underworld.",
    christian: "Mary's gold — a flower dedicated to the Virgin Mary (calendula officinalis).",
  },
  {
    name: "Violet",
    victorian: "Modesty, faithfulness, and spiritual wisdom. Napoleon's beloved flower.",
    japanese: "Sincerity — used in Heian-era poetry to express honest devotion.",
    chinese: "Loyalty, fidelity, and duty. Associated with Confucian values.",
    greek: "The favorite flower of Persephone — picked when Hades abducted her to the underworld.",
    christian: "Humility and the Virgin Mary. Featured in Marian devotional art.",
  },
  {
    name: "Gardenia",
    victorian: "Secret love — traditionally given to someone you loved but couldn't openly court.",
    japanese: "Secret love and grace. Often associated with romantic confessions.",
    chinese: "Joy, fortune, and grace. Used in teas and religious offerings.",
    greek: "Not native; later associated with feminine beauty.",
    christian: "Purity and the Virgin Mary. White gardenias in religious art.",
  },
  {
    name: "Hydrangea",
    victorian: "Gratitude, understanding, and heartfelt emotion. Sometimes also boastfulness.",
    japanese: "Gratitude and apology — traditional gift to say sorry or thank you.",
    chinese: "Gratitude, heartfelt emotion, and family abundance.",
    greek: "Not a traditional classical symbol.",
    christian: "Gratitude and understanding. Sometimes represents the inclusive love of God.",
  },
  {
    name: "Poppy",
    victorian: "Consolation, imagination, and eternal sleep.",
    japanese: "Red poppies = fun-loving. White = silence. Pink = calm dreams.",
    chinese: "Beauty, success, and luxury — but also associated with controversial history.",
    greek: "Sacred to Demeter and Morpheus (god of dreams) — sleep, death, and rebirth.",
    christian: "Remembrance, especially for fallen soldiers. The red poppy = Christ's blood.",
  },
  {
    name: "Jasmine",
    victorian: "Grace, elegance, and sensuality.",
    japanese: "Purity, modesty, and grace — often worn in hair.",
    chinese: "Attachment, grace, and motherly love. Used in Chinese jasmine tea.",
    greek: "Sacred to Persian goddess Anahita; later associated with feminine beauty.",
    christian: "Divine grace and purity. Less common in Western Christian symbolism.",
  },
];
