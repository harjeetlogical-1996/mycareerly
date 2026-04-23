import { generateImage } from "./gen-article-images.mjs";

const covers = [
  {
    filename: "cover-1-roses-fresh.jpg",
    prompt: "Perfectly arranged dozen red roses standing tall in a spotlessly clean crystal-clear glass vase filled with fresh water, white marble countertop, bright natural window light, professional florist setup, vibrant red petals with green leaves, flower care concept",
  },
  {
    filename: "cover-2-spring-flowers.jpg",
    prompt: "Stunning spring flower bouquet overflowing with pink tulips, yellow daffodils, purple hyacinths, white ranunculus, and blue muscari, wrapped in soft tissue paper, golden hour sunlight, fresh and vibrant, gifting concept",
  },
  {
    filename: "cover-3-diy-arrangement.jpg",
    prompt: "Woman's hands carefully arranging a colorful flower bouquet in a glass vase on a wooden table, surrounded by loose flowers, greenery stems, and floral scissors, DIY flower arranging tutorial, bright airy lifestyle photography",
  },
  {
    filename: "cover-4-wedding-flowers.jpg",
    prompt: "Spectacular wedding floral arch completely covered in white and blush garden roses, peonies, ranunculus, and trailing eucalyptus greenery, elegant outdoor ceremony backdrop, soft dreamy lighting, luxury wedding floristry",
  },
  {
    filename: "cover-5-gifting-bouquet.jpg",
    prompt: "Luxurious flower bouquet wrapped elegantly in kraft paper tied with a satin ribbon, featuring garden roses, lavender, eucalyptus, and wildflowers, placed on a rustic wooden surface with a handwritten gift card, warm golden light, gifting concept",
  },
  {
    filename: "cover-6-grow-roses.jpg",
    prompt: "Beautiful home rose garden with lush pink and red roses in full bloom growing on a garden bed, gardener's hands tending the plants with pruning shears, warm summer sunlight, English cottage garden aesthetic",
  },
  {
    filename: "cover-7-popular-flowers.jpg",
    prompt: "Vibrant display of the world's most popular flowers at a flower market: red roses, yellow sunflowers, pink tulips, white lilies, and purple lavender arranged in separate buckets, colorful and abundant, professional flower market photography",
  },
  {
    filename: "cover-8-favorite-flowers.jpg",
    prompt: "Elegant flat lay of the most iconic and beloved flowers of all time: classic red rose, white lily, yellow sunflower, purple lavender, pink peony, orange marigold, blue hydrangea arranged in a beautiful pattern on white marble, timeless beauty",
  },
  {
    filename: "cover-9-common-flowers.jpg",
    prompt: "Friendly neighborhood flower shop window display showing the five most common American flowers: red roses, pink carnations, white chrysanthemums, colorful tulips, and oriental lilies in glass vases, American florist shop aesthetic",
  },
  {
    filename: "cover-10-twenty-flower-names.jpg",
    prompt: "Educational botanical flat lay of twenty distinctly different named flower varieties arranged neatly on cream background with small handwritten name labels, including rose, tulip, lily, orchid, peony, hydrangea, dahlia, sunflower, lavender, and more, professional botanical photography",
  },
  {
    filename: "cover-11-many-petals.jpg",
    prompt: "Extreme close-up macro photograph of a pale pink ranunculus flower showing dozens of delicate layered petals spiraling from center, dewdrops on petals, dark background for contrast, professional macro flower photography, lush and textural",
  },
  {
    filename: "cover-12-beginner-flowers.jpg",
    prompt: "Cheerful beginner-friendly flower collection displayed in a row of small glass bottles: rose, sunflower, tulip, gerbera daisy, carnation, lavender, lily, orchid, chrysanthemum, peony on a bright white background, educational and colorful",
  },
  {
    filename: "cover-13-flower-reference.jpg",
    prompt: "Comprehensive visual flower reference display showing flowers organized by type and colour on a light background: red roses, orange marigolds, yellow sunflowers, green hellebores, blue delphiniums, purple lavender, pink peonies, white lilies, elegant and educational",
  },
  {
    filename: "cover-14-beautiful-flowers.jpg",
    prompt: "Dramatic showcase of the world's most breathtakingly beautiful flowers: exotic bird of paradise, lush garden rose, vibrant purple lotus, elegant white calla lily, and delicate cherry blossom, dramatic dark background with studio lighting, luxury flower portrait photography",
  },
  {
    filename: "cover-15-prettiest-flowers.jpg",
    prompt: "Stunning romantic arrangement of the prettiest flowers chosen by professional florists: blush garden roses, pale pink ranunculus, sweet peas, white anemones with dark centres, lisianthus, and trailing eucalyptus in a clear glass vase, soft natural window light",
  },
  {
    filename: "cover-16-forget-me-not.jpg",
    prompt: "Beautiful close-up cluster of delicate blue forget-me-not wildflowers with tiny yellow centres growing in a natural meadow setting, soft focus bokeh green background, morning light, spring wildflower photography, ethereal and delicate",
  },
  {
    filename: "cover-17-most-beautiful.jpg",
    prompt: "Dramatic single garden rose in full bloom, photographed as a fine art portrait: deep blush pink petals unfolding in perfect spiral formation, dewdrops catching light, velvety texture, dark moody background, professional award-winning flower photography",
  },
  {
    filename: "cover-18-medicinal-flowers.jpg",
    prompt: "Beautiful herbal medicine flat lay: fresh lavender sprigs, chamomile flowers, purple echinacea coneflowers, calendula marigolds, and elderflowers arranged around a mortar and pestle on a rustic wooden surface, natural light, botanical apothecary aesthetic",
  },
  {
    filename: "cover-19-identify-flowers.jpg",
    prompt: "Person holding a smartphone with a plant identification app scanning a wildflower bouquet, flowers in focus and phone screen visible with flower name labels, outdoor nature setting, bright daylight, flower identification technology concept",
  },
  {
    filename: "cover-20-top5-us-flowers.jpg",
    prompt: "The five bestselling flowers at an American flower market: long-stem red roses, pink alstroemeria, yellow sunflowers, white oriental lilies, and colorful gerbera daisies displayed together in front of an American florist shop, bright and inviting, best sellers concept",
  },
  {
    filename: "cover-21-beginner-guide.jpg",
    prompt: "Bright and friendly collection of ten easy-to-find beginner flowers arranged in individual small vases: red rose, white lily, yellow sunflower, pink tulip, orange gerbera daisy, purple orchid, pink carnation, lavender, blush peony, white chrysanthemum, colourful educational display",
  },
  {
    filename: "cover-22-twenty-descriptions.jpg",
    prompt: "Abundant flat lay of 20 different flower varieties with rich textures: ranunculus, anemone, lisianthus, hydrangea, dahlia, iris, sweet pea, freesia, cosmos, hellebore alongside roses and tulips, white surface, professional botanical photography, colourful and educational",
  },
  {
    filename: "cover-23-az-complete.jpg",
    prompt: "Spectacular A to Z flower alphabet concept: a long table displaying flowers starting from A to Z — anemone, bird of paradise, carnation, dahlia, echinacea, freesia, gardenia all the way through to zinnia — vibrant and colourful, educational botanical display",
  },
  {
    filename: "cover-24-red-rose.jpg",
    prompt: "Perfect single red rose in full velvety bloom photographed as a dramatic close-up portrait, deep crimson petals with subtle gradient to near-black at edges, single green leaf visible, black background, water droplets on petals, fine art rose photography, passionate and timeless",
  },
  {
    filename: "cover-25-cherry-blossom.jpg",
    prompt: "Magnificent cherry blossom sakura tree in absolute peak bloom, branches completely covered with thousands of pale pink and white flowers, blue sky background with soft clouds, fallen petals drifting in the air, Japanese spring concept, breathtaking and serene",
  },
  {
    filename: "cover-26-bouquet-emoji.jpg",
    prompt: "Beautiful fresh flower bouquet identical to the bouquet emoji concept — featuring red roses, pink flowers, green leaves, and colorful mixed blooms tied together, displayed on a white background alongside a smartphone showing the bouquet emoji, modern and vibrant",
  },
];

console.log(`Generating ${covers.length} cover images for all 26 articles...`);
for (const img of covers) {
  await generateImage(img.prompt, img.filename);
}
console.log("All covers done.");
