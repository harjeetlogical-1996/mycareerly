import { generateImage } from "./gen-article-images.mjs";

const images = [
  // Article 23 - A to Z
  {
    filename: "article-23-az-alphabet-flowers.jpg",
    prompt: "Elegant flat lay of diverse flowers arranged in alphabet order concept, featuring anemone, bird of paradise, carnation, dahlia, echinacea, freesia, gardenia, hydrangea, iris, jasmine on white marble surface, professional botanical photography, vibrant and colorful",
  },
  {
    filename: "article-23-rare-exotic-flowers.jpg",
    prompt: "Close-up collection of rare and exotic flowers including protea, hellebore, lotus, passionflower, and bird of paradise arranged together on a dark background, dramatic lighting, luxury floral photography",
  },
  {
    filename: "article-23-wildflower-collection.jpg",
    prompt: "Beautiful wildflower bouquet featuring Queen Anne's lace, cosmos, yarrow, nigella love-in-a-mist, sweet pea, and buttercups in a rustic mason jar, soft natural light, countryside cottagecore aesthetic",
  },
  // Article 24 - Red Rose
  {
    filename: "article-24-red-rose-closeup.jpg",
    prompt: "Stunning close-up macro photograph of a single perfect red rose in full bloom with dewdrops on petals, deep velvety red color, dark green leaves, dramatic lighting, shallow depth of field, romantic and luxurious",
  },
  {
    filename: "article-24-red-rose-varieties.jpg",
    prompt: "Collection of different red rose varieties displayed side by side: hybrid tea rose, garden rose, spray rose, and climbing rose blooms on white background, botanical illustration style photography, professional florist display",
  },
  {
    filename: "article-24-red-rose-bouquet-valentines.jpg",
    prompt: "Luxurious bouquet of two dozen red roses wrapped in kraft paper with red ribbon, on a wooden table with candlelight, romantic Valentine's Day gifting concept, warm golden light, elegant and passionate",
  },
  // Article 25 - Cherry Blossom
  {
    filename: "article-25-cherry-blossom-tree.jpg",
    prompt: "Breathtaking cherry blossom sakura tree in full peak bloom against a bright blue sky, pink and white flowers covering every branch, soft petals falling, Japanese spring concept, beautiful and serene",
  },
  {
    filename: "article-25-cherry-blossom-branch.jpg",
    prompt: "Close-up of cherry blossom sakura branch with delicate pale pink flowers and buds in various stages of opening, soft bokeh background, macro photography, ethereal and delicate, spring beauty",
  },
  {
    filename: "article-25-washington-dc-cherry-blossoms.jpg",
    prompt: "Cherry blossom trees in full bloom lining a pathway in a public park, pink canopy of flowers overhead, people walking beneath in spring, Washington DC inspired landscape, golden hour light, stunning and memorable",
  },
];

console.log(`Generating ${images.length} images for articles 23, 24, 25...`);
for (const img of images) {
  await generateImage(img.prompt, img.filename);
}
console.log("All done.");
