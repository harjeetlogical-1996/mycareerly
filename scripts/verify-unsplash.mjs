import https from "https";

const CANDIDATES = [
  // Known working (from existing pool)
  "1487530811015-780780169993","1558618666-fcd25c85cd64","1501004318641-b39e6451bec6",
  "1459411621453-7b03977f4bfc","1562690868-60bbe7293e94","1518709766631-a6a7f45921c3",
  "1567696911980-2d059a096dbf","1520763185298-f1afc5b48d90","1441986300917-64674bd600d8",
  "1416879595882-3373a0480b5b","1490750967868-88df5691cc6c","1495360010541-f48722b8b4c8",
  "1519378058457-4c29a0a2efac","1453946610176-6be21147c400","1533038590840-1cde6e668a91",
  // New candidates — flower/florist/bouquet themes
  "1468327768560-75b778cbb551","1426604966848-d7adac402bff","1439372458368-d8c0e9b53fc8",
  "1449824913935-59a10b8d2000","1453847668862-487637052f8a","1509937528035-ad76254b0356",
  "1473968512647-3e447244af8f","1513279922550-250c2129b13a","1509233725247-49e657c54213",
  "1591291621084-14a5d1be00b9","1502977249166-824b3a8a4d69","1595814433087-f5cafc98d8aa",
  "1507019403355-a74c8eb9e9f7","1465495976277-4387d4b0e4a6","1465145782121-8ba9b4d21a9e",
  "1462143338528-eca9936a4d09","1508610048659-a06b669e3321","1563241527-3004b7be0ffd",
  "1612336307429-8a898d10e223","1506103475781-edc99ec8e3ea","1527254432845-0af58d66e1f9",
  "1519722417352-7d6959729417","1523884998687-47f70e7b2a99","1557177324-7eaca5d4ddf3",
  "1509623938665-da23b9b65c69","1553062407-98eeb64c6a62",
  // Florist storefronts & interiors
  "1554977014-c0fc824e0e94","1556228453-efd6c1ff04f6","1549497538-87c75e2166f4",
  "1604488175348-1ff83e2eb395","1541958474-dd1f066f8fbb","1508784411316-02b8cd4d3a3a",
  "1588002030290-e6796e21f53f","1518562180175-34a163b1a9a6","1457089328389-d0b95ffa4f0e",
  // Wedding flowers
  "1606216794074-735e91aa2c92","1519741497674-611481863552","1526662092594-e98c1e356d6a",
  "1491438590914-bc09fcaaf77a","1519225421980-715cb0215aed",
];

function check(id) {
  return new Promise((resolve) => {
    const url = `https://images.unsplash.com/photo-${id}?w=200&q=50`;
    https.get(url, (res) => {
      resolve({ id, ok: res.statusCode === 200, status: res.statusCode });
      res.resume();
    }).on("error", () => resolve({ id, ok: false, status: 0 }));
  });
}

const results = await Promise.all(CANDIDATES.map(check));
const working = results.filter(r => r.ok).map(r => r.id);
const broken = results.filter(r => !r.ok);

console.log(`✅ Working: ${working.length}/${CANDIDATES.length}`);
if (broken.length) {
  console.log(`❌ Broken (${broken.length}):`);
  broken.forEach(b => console.log(`   ${b.id} → ${b.status}`));
}
console.log("\n// Working pool:");
console.log(JSON.stringify(working, null, 2));
