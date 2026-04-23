import fs from "fs";
import path from "path";
import https from "https";

const API_KEY = "AIzaSyB5jteecTdcJuiWOXlj3uIm4wDHS6i6gEo";

async function generateImage(prompt, outputPath) {
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
            fs.writeFileSync(outputPath, buf);
            console.log(`  ✓ Saved: ${outputPath} (${(buf.length / 1024).toFixed(0)}KB)`);
            resolve(outputPath);
          } else {
            console.error("  ✗ Error:", JSON.stringify(json).slice(0, 300));
            reject(new Error("No image returned"));
          }
        } catch (e) { reject(e); }
      });
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

const publicDir = path.join(process.cwd(), "public");
const appDir = path.join(process.cwd(), "app");

console.log("Generating MyCareerly logo...");

await generateImage(
  "Minimalist flat design logo icon for a flower shop directory called MyCareerly. A single elegant stylized flower bloom with five rounded petals in warm coral salmon color (#E8705A), clean simple geometric shape, centered on a pure white square background, modern app icon style, no text, no gradients, flat vector illustration look, professional brand logo",
  path.join(publicDir, "logo.png")
);

console.log("Generating favicon (square icon)...");

await generateImage(
  "Minimalist flat app icon: single stylized flower with 5 rounded coral orange petals (#E8705A), clean geometric shape, centered on soft cream white background, modern flat design, simple bold icon, suitable for browser favicon, no text",
  path.join(appDir, "icon.png")
);

console.log("Generating Apple touch icon...");
fs.copyFileSync(path.join(appDir, "icon.png"), path.join(appDir, "apple-icon.png"));
console.log("  ✓ apple-icon.png copied from icon.png");

console.log("\nDone! Files created:");
console.log("  public/logo.png       — used in JSON-LD Organization schema");
console.log("  app/icon.png          — browser tab favicon");
console.log("  app/apple-icon.png    — Apple home screen icon");
