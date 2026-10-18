import { createContext, useContext, useMemo, useState, useCallback } from 'react';
import * as D from './data';
import * as M from './data_mvp';

const Ctx = createContext(null);

// Vatandaş uygulaması ve belediye portalı aynı (mock) veri deposunu paylaşır;
// böylece demoda bir talep vatandaştan birime, birimden vatandaşa canlı olarak akar.
export function StoreProvider({ children }) {
  const [hesap, setHesap] = useState(null); // 'bireysel' | 'kurumsal' | 'portal' | null
  const [portalUser, setPortalUser] = useState(null);
  const [stack, setStack] = useState([{ name: 'Home', params: {} }]);

  const [talepler, setTalepler] = useState(() => [
    ...D.TALEPLER.map((t) => ({ ...t, tenant: 'gomec', sahip: 'ben', basvuran: 'A*** D***' })),
    ...M.DIGER_TALEPLER,
  ]);
  const [yardimlar, setYardimlar] = useState(() => [
    ...D.YARDIM_BASVURULARI.map((y) => ({ ...y, tenant: 'gomec', sahip: 'ben', basvuran: 'A*** D***' })),
    ...M.DIGER_YARDIMLAR,
  ]);
  const [duyurular, setDuyurular] = useState(() => D.DUYURULAR.map((x) => ({ ...x, tenant: 'gomec' })));
  const [ilanlar, setIlanlar] = useState(() => [
    ...D.BENIM_ILANLARIM.map((i) => ({ ...i, tenant: 'gomec', sahip: 'ben', basvuran: 'A*** D***' })),
    ...M.DIGER_ILANLAR_BEKLEYEN.map((i) => ({ ...i, sahip: 'diger' })),
    ...D.ILANLAR.map((i) => ({ ...i, tenant: 'gomec', sahip: 'diger' })),
  ]);
  const [paylasimlar, setPaylasimlar] = useState(D.PAYLASIMLAR);
  const [odemeler, setOdemeler] = useState(D.ODEMELER);
  const [okunanDuyurular, setOkunan] = useState({});
  const [bolgeler, setBolgeler] = useState([
    { ad: 'Ev', mahalle: 'Kemalpaşa', sokak: 'Atatürk Caddesi', kaynak: 'Haritadan işaretlendi' },
    { ad: 'Aile evi', mahalle: 'Karaağaç', sokak: 'Plaj Caddesi', kaynak: 'Mahalle ve sokak seçildi' },
  ]);
  const [aktifBolge, setAktifBolge] = useState(0);
  const [toast, setToast] = useState(null);

  const push = useCallback((name, params = {}) => setStack((s) => [...s, { name, params }]), []);
  const pop = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const replace = useCallback((name, params = {}) => setStack((s) => [...s.slice(0, -1), { name, params }]), []);
  const resetTo = useCallback((name = 'Home', params = {}) => setStack([{ name, params }]), []);

  const showToast = useCallback((msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const value = useMemo(() => ({
    hesap, setHesap, portalUser, setPortalUser, stack, push, pop, replace, resetTo, toast, showToast,
    talepler, setTalepler, yardimlar, setYardimlar, duyurular, setDuyurular, ilanlar, setIlanlar,
    paylasimlar, setPaylasimlar, odemeler, setOdemeler, okunanDuyurular, setOkunan,
    bolgeler, setBolgeler, aktifBolge, setAktifBolge,
  }), [hesap, portalUser, stack, push, pop, replace, resetTo, toast, showToast, talepler, yardimlar, duyurular,
    ilanlar, paylasimlar, odemeler, okunanDuyurular, bolgeler, aktifBolge]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useStore = () => useContext(Ctx);

// ---------------- Yetki kapsamı ----------------
// Her portal kullanıcısı yalnızca kendi belediyesinin (tenant) ve rolünün izin verdiği kayıtları görür.
export const yetki = {
  talepGorur: (u, t) => !!u && u.rol !== 'platform' && t.tenant === u.tenant && (u.rol === 'yonetici' || (u.rol === 'birim' && t.birim === u.birim)),
  talepAktarir: (u) => u?.rol === 'yonetici',
  yardimGorur: (u, y) => !!u && u.rol === 'sosyal' && y.tenant === u.tenant,
  onaylar: (u) => u?.rol === 'yonetici' || u?.rol === 'onay',
  duyuruYayinlar: (u) => u?.rol === 'yonetici' || u?.rol === 'onay',
  raporGorur: (u) => u?.rol === 'yonetici',
};
