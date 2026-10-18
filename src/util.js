const AY = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const AY_UZUN = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const GUN = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

// Bugüne göre göreli tarih: mock veriler her gün güncel görünsün diye
export function d(days, hour = 10, minute = 0) {
  const x = new Date();
  x.setDate(x.getDate() + days);
  x.setHours(hour, minute, 0, 0);
  return x;
}

const pad = (n) => String(n).padStart(2, '0');

export function fmt(dt) {
  if (!dt) return '';
  return `${dt.getDate()} ${AY[dt.getMonth()]} · ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
}

export function fmtDay(dt) {
  if (!dt) return '';
  return `${dt.getDate()} ${AY_UZUN[dt.getMonth()]} ${GUN[dt.getDay()]}`;
}

export function fmtShort(dt) {
  return `${dt.getDate()} ${AY_UZUN[dt.getMonth()]}`;
}

export function dayDiff(dt) {
  const a = new Date();
  a.setHours(0, 0, 0, 0);
  const b = new Date(dt);
  b.setHours(0, 0, 0, 0);
  return Math.round((b - a) / 86400000);
}

export function relDay(dt) {
  const n = dayDiff(dt);
  if (n === 0) return 'Bugün';
  if (n === 1) return 'Yarın';
  if (n === -1) return 'Dün';
  if (n < 0) return `${-n} gün önce`;
  return `${n} gün sonra`;
}

export function duration(from, to) {
  const ms = Math.max(0, to - from);
  const h = Math.floor(ms / 3600000);
  const days = Math.floor(h / 24);
  const hours = h % 24;
  if (days === 0) return `${Math.max(1, hours)} saat`;
  return hours ? `${days} gün ${hours} saat` : `${days} gün`;
}

export function tl(n) {
  return '₺' + n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    .replace(/,/g, '#').replace(/\./g, ',').replace(/#/g, '.');
}

// tl() bazı cihazlarda tr-TR desteklenmezse de doğru çalışsın diye elle biçimlendirme
export function money(n) {
  const [i, f] = n.toFixed(2).split('.');
  return '₺' + i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + f;
}

// İşletme açık mı? hours: { 0..6: [ 'HH:MM', 'HH:MM' ] | null }
export function isOpen(hours, now = new Date()) {
  const h = hours[now.getDay()];
  if (!h) return false;
  const [a, b] = h;
  const cur = now.getHours() * 60 + now.getMinutes();
  const toMin = (s) => {
    const [x, y] = s.split(':').map(Number);
    return x * 60 + y;
  };
  return cur >= toMin(a) && cur < toMin(b);
}

export const GUNLER = GUN;

// ----- KVKK: kişisel veri tespiti ve maskeleme (demo amaçlı basit kurallar) -----
const RULES = [
  { name: 'IBAN', re: /\bTR\s?\d{2}(?:\s?\d{4}){5}\s?\d{2}\b/gi },
  { name: 'T.C. kimlik no', re: /\b[1-9]\d{10}\b/g },
  { name: 'Telefon', re: /\b0?\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}\b/g },
  { name: 'E-posta', re: /\b[\w.+-]+@[\w-]+\.[\w.]+\b/g },
];

export function maskPII(text) {
  const found = [];
  let out = text || '';
  RULES.forEach((r) => {
    if (out.match(r.re)) {
      found.push(r.name);
      out = out.replace(r.re, '[gizlendi]');
    }
  });
  return { masked: out, found };
}

// ----- Beyaz Masa: anahtar kelimeyle birim önerisi (gerçek üründe yapay zekâ) -----
const BIRIM_KURALLARI = [
  { birim: 'Fen İşleri Müdürlüğü', kategori: 'Yol ve kaldırım', kw: ['yol', 'çukur', 'kaldırım', 'asfalt', 'parke', 'rögar', 'kanal', 'mazgal'] },
  { birim: 'Fen İşleri Müdürlüğü', kategori: 'Aydınlatma', kw: ['lamba', 'aydınlatma', 'karanlık', 'direk', 'ışık'] },
  { birim: 'Temizlik İşleri Müdürlüğü', kategori: 'Çöp ve temizlik', kw: ['çöp', 'konteyner', 'temizlik', 'pislik', 'moloz', 'koku'] },
  { birim: 'Park ve Bahçeler Müdürlüğü', kategori: 'Park ve yeşil alan', kw: ['park', 'ağaç', 'çim', 'bank', 'salıncak', 'oyun', 'budama'] },
  { birim: 'Zabıta Müdürlüğü', kategori: 'Zabıta', kw: ['gürültü', 'işgal', 'seyyar', 'kaldırım işgali', 'fiyat', 'ruhsatsız', 'müzik'] },
  { birim: 'Veteriner İşleri', kategori: 'Sokak hayvanları', kw: ['köpek', 'kedi', 'hayvan', 'yaralı'] },
  { birim: 'Su ve Kanalizasyon (BASKİ yönlendirme)', kategori: 'Su ve kanalizasyon', kw: ['su ', 'su,', 'susuz', 'boru', 'patlak', 'kanalizasyon', 'taşma'] },
];

export function suggestBirim(text) {
  const t = ' ' + (text || '').toLocaleLowerCase('tr') + ' ';
  let best = null;
  let score = 0;
  BIRIM_KURALLARI.forEach((r) => {
    const s = r.kw.filter((k) => t.includes(k)).length;
    if (s > score) {
      score = s;
      best = r;
    }
  });
  if (!best) return null;
  const urgent = /(tehlike|acil|yaralı|patla|çökme|düştü|taşma)/.test(t);
  return { ...best, oncelik: urgent ? 'Yüksek' : 'Orta' };
}

let seq = 2000;
export const newId = () => String(++seq);
