const fs = require('fs');
const path = require('path');

// ==========================================
// AYARLAR: SAHNEYE ÖZEL KIRPMA (Saniye Cinsinden)
// ==========================================
// Her sahnenin başından (trimStart) ve sonundan (trimEnd) kaç saniye kesileceğini ayarlayabilirsiniz.
const sceneTrims = [
  { trimStart: 2.3, trimEnd: 0 }, // 1. Sahne (Kuş uçuşu - başlangıç olduğu için genelde başı 0 kalır)
  { trimStart: 0.0, trimEnd: 0 }, // 2. Sahne (Uzaya çıkış)
  { trimStart: 0.0, trimEnd: 0 }, // 3. Sahne (Lazer tarama)
  { trimStart: 0.0, trimEnd: 0 }, // 4. Sahne (Araca dönüşüm)
  { trimStart: 0.0, trimEnd: 0 }, // 5. Sahne (Kutuyu bulma)
  { trimStart: 0.0, trimEnd: 0 }, // 6. Sahne (Kola dönüşüm)
  { trimStart: 0.0, trimEnd: 0 }, // 7. Sahne (Geri dönüş - bitiş olduğu için genelde sonu 0 kalır)
];

const ORIGINAL_DURATION = 8.04; // Sahnelerin orijinal ham uzunluğu

// Sahnelerin başlangıç ve bitiş zamanlarını otomatik hesaplıyoruz:
const trims = sceneTrims.map(t => ({
  in: t.trimStart,
  out: ORIGINAL_DURATION - t.trimEnd
}));

// ==========================================
// KOD KISMI: AŞAĞIYA DOKUNMANIZA GEREK YOK
// ==========================================

let filterComplex = "";
let concatInputsV = "";
let concatInputsA = "";

let currentTime = 0;
const sceneStartTimes = [];

for (let i = 0; i < 7; i++) {
  const t = trims[i];
  
  // React arayüzü için saniyeleri kaydediyoruz
  sceneStartTimes.push(parseFloat(currentTime.toFixed(2)));
  
  const duration = t.out - t.in;
  currentTime += duration;

  filterComplex += `[${i}:v]trim=start=${t.in}:end=${t.out},setpts=PTS-STARTPTS[v${i}]; `;
  filterComplex += `[${i}:a]atrim=start=${t.in}:end=${t.out},asetpts=PTS-STARTPTS[a${i}]; `;
  concatInputsV += `[v${i}]`;
  concatInputsA += `[a${i}]`;
}

filterComplex += `${concatInputsV}concat=n=7:v=1:a=0[outv]; `;
filterComplex += `${concatInputsA}concat=n=7:v=0:a=1[outa]`;

const command = `ffmpeg \\
  -i public/cinematic/sahne1.mp4 \\
  -i public/cinematic/sahne2.mp4 \\
  -i public/cinematic/sahne3.mp4 \\
  -i public/cinematic/sahne4.mp4 \\
  -i public/cinematic/sahne5.mp4 \\
  -i public/cinematic/sahne6.mp4 \\
  -i public/cinematic/sahne7.mp4 \\
  -filter_complex "${filterComplex}" \\
  -map "[outv]" -map "[outa]" \\
  -c:v libx264 -preset fast -crf 23 \\
  -c:a aac -b:a 128k -y public/cinematic/full_story.mp4`;

// 1. FFmpeg bash scriptini oluştur
fs.writeFileSync('encode.sh', command);
console.log("✅ encode.sh başarıyla oluşturuldu.");

// 2. CinematicPlayer.tsx içindeki zamanlamaları OTOMATİK güncelle
const tsxPath = path.join(__dirname, 'components', 'CinematicPlayer.tsx');
let tsxContent = fs.readFileSync(tsxPath, 'utf8');

const regex = /const sceneStartTimes = \[.*?\];/;
const newArrayString = `const sceneStartTimes = [${sceneStartTimes.join(', ')}];`;

if (regex.test(tsxContent)) {
  tsxContent = tsxContent.replace(regex, newArrayString);
  fs.writeFileSync(tsxPath, tsxContent);
  console.log(`✅ CinematicPlayer.tsx güncellendi -> ${newArrayString}`);
} else {
  console.log("⚠️ CinematicPlayer.tsx içinde sceneStartTimes dizisi bulunamadı!");
}
