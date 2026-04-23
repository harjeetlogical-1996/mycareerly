import { generateImage } from "./gen-article-images.mjs";

const images = [
  {
    filename: "article-22-twenty-flowers-flatlay.jpg",
    prompt: "Stunning flat lay of 20 different named flower varieties arranged artfully on a white surface including ranunculus, anemone, lisianthus, hydrangea, dahlia, iris, sweet pea, freesia, cosmos, hellebore alongside roses and tulips, professional botanical photography, vibrant colors, educational display",
  },
  {
    filename: "article-22-ranunculus-anemone-lisianthus.jpg",
    prompt: "Close-up of three beautiful intermediate flowers: pink ranunculus, purple anemone with dark center, and white lisianthus arranged together in a small vase, soft natural light, macro photography, elegant and delicate",
  },
  {
    filename: "article-22-hydrangea-dahlia-iris.jpg",
    prompt: "Beautiful arrangement of blue hydrangea, purple dahlia, and blue iris flowers in a ceramic vase on a wooden table, natural side lighting, artistic composition, flower variety guide concept",
  },
];

console.log("Generating Article 22 images...");
for (const img of images) {
  await generateImage(img.prompt, img.filename);
}
console.log("Done.");
