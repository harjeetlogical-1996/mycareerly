import { generateImage } from "./gen-article-images.mjs";

const images = [
  // Fix missing referenced files
  {
    filename: "article-21-ten-flowers-guide.jpg",
    prompt: "Visual guide showing ten iconic flowers laid out in a grid on white background: rose, lily, sunflower, tulip, gerbera daisy, orchid, carnation, lavender, peony, chrysanthemum, each labeled, professional botanical infographic style, bright and educational",
  },
  {
    filename: "article-22-twenty-names.jpg",
    prompt: "Elegant flat lay display of twenty named flower varieties including ranunculus, anemone, lisianthus, hydrangea, dahlia, iris, sweet pea, freesia, cosmos, hellebore arranged on a marble surface with small name labels, botanical photography, soft natural light",
  },
  {
    filename: "article-23-az-flowers.jpg",
    prompt: "Colourful alphabet-themed floral arrangement concept showing diverse flowers from A to Z, including anemone, butterfly weed, cosmos, dahlia, echinacea arranged in a row on a white surface, professional botanical photography, vibrant educational display",
  },
  // Article 9 - 3rd image
  {
    filename: "article-9-sunflower-daisy-tulip.jpg",
    prompt: "Close-up of three most common American flowers: bright yellow sunflower, classic white daisy, and pink tulip arranged together in a clear glass vase on a wooden table, natural sunlight, fresh and vibrant lifestyle photography, American flower market concept",
  },
  // Article 13 - 3rd image
  {
    filename: "article-13-flower-color-guide.jpg",
    prompt: "Flowers organized by colour in a flat lay arrangement: red roses, orange marigolds, yellow sunflowers, green hellebores, blue delphiniums, purple lavender, pink peonies, white lilies arranged in rainbow order on white background, botanical colour chart photography",
  },
  // Article 15 - 3rd image
  {
    filename: "article-15-rose-garden-bloom.jpg",
    prompt: "Stunning English rose garden in full summer bloom with dozens of pastel pink and cream garden roses on arching stems, soft golden hour light, lush greenery background, romantic and breathtaking, most beautiful flower garden photography",
  },
  // Article 16 - 3rd image
  {
    filename: "article-16-birth-flowers-collection.jpg",
    prompt: "Twelve birth month flowers displayed in a grid: January snowdrop, February violet, March daffodil, April daisy, May lily of the valley, June rose, July delphinium, August poppy, September aster, October marigold, November chrysanthemum, December narcissus, flat lay botanical art",
  },
  // Article 18 - 3rd image
  {
    filename: "article-18-chamomile-echinacea.jpg",
    prompt: "Beautiful arrangement of medicinal flowers including chamomile with white petals and golden centre, purple echinacea coneflower, calendula marigold, and St John's wort on a rustic wooden table with dried herbs, natural herbal medicine concept, warm golden light",
  },
  // Article 19 - 3rd image
  {
    filename: "article-19-flower-details-guide.jpg",
    prompt: "Close-up botanical study of flower parts used for identification: petal arrangement, stamen, pistil, leaf shape, stem texture, shown across three different flower specimens side by side on a white background, educational scientific photography, detailed macro",
  },
  // Article 20 - 3rd image
  {
    filename: "article-20-top5-us-flowers.jpg",
    prompt: "The five most popular American flowers displayed together: classic red rose, white oriental lily, yellow sunflower, pink alstroemeria, and mixed gerbera daisy arranged in a rustic wooden crate at a US farmer's market, bright natural light, bestseller concept",
  },
];

console.log(`Generating ${images.length} missing/additional images...`);
for (const img of images) {
  await generateImage(img.prompt, img.filename);
}
console.log("All done.");
