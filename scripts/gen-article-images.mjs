import fs from "fs";
import path from "path";
import https from "https";

const API_KEY = "AIzaSyB5jteecTdcJuiWOXlj3uIm4wDHS6i6gEo";
const outputDir = path.join(process.cwd(), "public", "images", "articles");

export async function generateImage(prompt, filename) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1 },
    });
    const options = {
      hostname: "generativelanguage.googleapis.com",
      path: `/v1beta/models/imagen-4.0-fast-generate-001:predict?key=${API_KEY}`,
      method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (json.predictions?.[0]?.bytesBase64Encoded) {
            const buf = Buffer.from(json.predictions[0].bytesBase64Encoded, "base64");
            fs.writeFileSync(path.join(outputDir, filename), buf);
            console.log(`  ✓ ${filename} (${(buf.length / 1024).toFixed(0)}KB)`);
            resolve(filename);
          } else {
            console.error(`  ✗ ${filename}:`, JSON.stringify(json).slice(0, 200));
            reject(new Error("No image"));
          }
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// Allow running standalone: node gen-article-images.mjs <filename> <prompt>
const [,, file, ...promptParts] = process.argv;
if (file && promptParts.length) {
  generateImage(promptParts.join(" "), file)
    .then(() => console.log("Done."))
    .catch(console.error);
}
