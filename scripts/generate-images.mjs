import fs from "fs";
import path from "path";
import https from "https";

const API_KEY = "AIzaSyB5jteecTdcJuiWOXlj3uIm4wDHS6i6gEo";

const images = [
  {
    filename: "article-26-bouquet-roses-tulips.jpg",
    prompt:
      "A beautiful hand-held flower bouquet with red roses, pink tulips, white daisies, and fresh green eucalyptus leaves, wrapped in kraft paper, natural light photography, soft background, professional florist bouquet, vibrant colors, high detail",
  },
  {
    filename: "article-26-bouquet-emoji-platforms.jpg",
    prompt:
      "A stunning mixed floral bouquet arrangement on a white marble table, featuring red roses, pink peonies, white baby's breath, and lush green foliage, soft natural light from a window, top-down flat lay photography, elegant and minimal styling",
  },
  {
    filename: "article-26-gifting-bouquet.jpg",
    prompt:
      "Person giving a colorful flower bouquet as a gift, hands holding a wrapped bouquet of roses and tulips, warm and joyful mood, soft bokeh background, lifestyle photography, celebration and gifting concept, natural light",
  },
];

async function generateImage(prompt) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1 },
    });

    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${API_KEY}`,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.predictions && json.predictions[0]?.bytesBase64Encoded) {
            resolve(json.predictions[0].bytesBase64Encoded);
          } else {
            console.error("Response:", JSON.stringify(json, null, 2));
            reject(new Error("No image data in response"));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

const outputDir = path.join(process.cwd(), "public", "images", "articles");

for (const img of images) {
  console.log(`Generating: ${img.filename}...`);
  try {
    const base64 = await generateImage(img.prompt);
    const buffer = Buffer.from(base64, "base64");
    const filePath = path.join(outputDir, img.filename);
    fs.writeFileSync(filePath, buffer);
    console.log(`✓ Saved: ${filePath} (${(buffer.length / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`✗ Failed ${img.filename}:`, err.message);
  }
}

console.log("Done.");
