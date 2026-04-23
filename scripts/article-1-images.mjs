import { generateImage } from "./gen-article-images.mjs";

const images = [
  {
    filename: "article-1-stem-trimming.jpg",
    prompt: "Close-up of hands cutting a red rose stem at a 45-degree angle with sharp floral scissors underwater in a glass bowl, water droplets visible, clear technique demonstration, professional florist technique, bright clean background, educational how-to photography",
  },
  {
    filename: "article-1-flower-food-vase.jpg",
    prompt: "Glass vase with crystal-clear water and a small white flower food sachet being poured in, fresh red roses leaning against the vase ready to be arranged, clean white marble countertop, soft natural light, step-by-step flower care concept, bright and clean",
  },
  {
    filename: "article-1-roses-refrigerator.jpg",
    prompt: "Fresh red rose bouquet loosely wrapped in kraft paper sitting inside an open refrigerator shelf, cold environment flower preservation concept, clear refrigerator shelves visible, professional florist overnight storage trick, clean modern kitchen setting",
  },
];

console.log("Generating Article 1 dedicated images...");
for (const img of images) {
  await generateImage(img.prompt, img.filename);
}
console.log("Done.");
