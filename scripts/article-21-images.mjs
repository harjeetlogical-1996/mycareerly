import { generateImage } from "./gen-article-images.mjs";

const images = [
  {
    filename: "article-21-ten-flowers-collection.jpg",
    prompt: "Flat lay arrangement of 10 different flower varieties including rose, lily, sunflower, tulip, gerbera daisy, orchid, carnation, lavender, peony, and chrysanthemum on a white marble surface, professional botanical photography, vibrant colors, clean composition, educational display",
  },
  {
    filename: "article-21-rose-lily-sunflower.jpg",
    prompt: "Beautiful close-up of three beginner flowers: red rose, white oriental lily, and yellow sunflower arranged together in a glass vase, natural window light, soft focus background, fresh and vibrant, lifestyle photography",
  },
  {
    filename: "article-21-peony-orchid-lavender.jpg",
    prompt: "Elegant arrangement of peony, orchid, and lavender flowers side by side on a wooden table, soft natural light, minimal styling, pastel color palette, close-up macro photography, beginner flower guide concept",
  },
];

console.log("Generating Article 21 images...");
for (const img of images) {
  await generateImage(img.prompt, img.filename);
}
console.log("Done.");
