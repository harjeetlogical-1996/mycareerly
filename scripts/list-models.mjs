import https from "https";

const API_KEY = "AIzaSyB5jteecTdcJuiWOXlj3uIm4wDHS6i6gEo";

const data = await new Promise((resolve, reject) => {
  https.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`, (res) => {
    let d = "";
    res.on("data", c => d += c);
    res.on("end", () => resolve(JSON.parse(d)));
  }).on("error", reject);
});

for (const m of data.models || []) {
  const methods = m.supportedGenerationMethods || [];
  if (methods.includes("predict") || m.name.includes("imagen") || m.name.includes("image")) {
    console.log(m.name, "-", methods.join(", "));
  }
}
console.log("\nAll models:");
for (const m of data.models || []) {
  console.log(m.name, "-", (m.supportedGenerationMethods||[]).join(", "));
}
