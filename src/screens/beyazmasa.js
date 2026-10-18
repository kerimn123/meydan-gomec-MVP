import { useMemo, useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { useStore } from '../store';
import { BEYAZ_MASA_KATEGORILER, KATEGORI_BIRIM, HEDEF_GUN, MAHALLELER, SOKAKLAR } from '../data';
import { Screen, Card, Badge, Muted, H3, Btn, Row, Chips, Field, Label, Notice, Timeline, Empty, Eyebrow, T } from '../ui';
import { fmt, duration, maskPII, suggestBirim, newId } from '../util';
import { BIRIMLER } from '../data_mvp';
import { dokumanUret } from '../ai';

const ADIMLAR = ['İşleme alındı', 'Talep karşılandı', 'Kapatıldı'];

function hedefTarih(t) {
  const x = new Date(t.olaylar[0].at);
  x.setDate(x.getDate() + (HEDEF_GUN[t.kategori] || 5));
  return x;
}

function slaOzet(t) {
  const acilis = t.olaylar[0].at;
  const hedefGun = HEDEF_GUN[t.kategori] || 5;
  if (t.durum === 'Kapatıldı') {
    const kapanis = t.olaylar[t.olaylar.length - 1].at;
    const sure = (kapanis - acilis) / 86400000;
    return { text: `${duration(acilis, kapanis)} içinde sonuçlandı`, ok: sure <= hedefGun };
  }
  const kalanMs = hedefTarih(t) - new Date();
  if (kalanMs < 0) return { text: `Hedef süre ${duration(hedefTarih(t), new Date())} aşıldı`, ok: false };
  return { text: `Hedef ${hedefGun} gün · ${duration(new Date(), hedefTarih(t))} kaldı`, ok: true };
}

export function BMList() {
  const { talepler, push } = useStore();
  const [filtre, setFiltre] = useState('Açık');
  const liste = talepler.filter((t) => t.sahip === 'ben').filter((t) => filtre === 'Tümü' || (filtre === 'Açık' ? t.durum !== 'Kapatıldı' : t.durum === 'Kapatıldı'));
  return (
    <Screen title="Beyaz Masa" subtitle="Taleplerim" footer={<Btn title="Yeni talep oluştur" icon="add-circle-outline" onPress={() => push('BM_New')} />}>
      <Chips items={['Açık', 'Kapalı', 'Tümü']} value={filtre} onChange={setFiltre} />
      {liste.length === 0 ? <Empty text="Bu filtrede talep yok." /> : null}
      {liste.map((t) => {
        const sla = slaOzet(t);
        return (
          <Card key={t.id} onPress={() => push('BM_Detail', { id: t.id })}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Muted>#{t.id} · {t.kategori}</Muted>
              <Badge text={t.durum} />
            </Row>
            <T numberOfLines={2} style={{ fontWeight: '600' }}>{t.metin}</T>
            <Row style={{ gap: 6 }}>
              <Ionicons name="location-outline" size={15} color={C.faint} />
              <Muted style={{ flex: 1 }} numberOfLines={1}>{t.mahalle} · {t.sokak}</Muted>
            </Row>
            <Row style={{ gap: 6 }}>
              <Ionicons name="time-outline" size={15} color={sla.ok ? C.blue : C.red} />
              <Text style={{ fontSize: 13, color: sla.ok ? C.blue : C.red, fontWeight: '700' }}>{sla.text}</Text>
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}

export function BMDetail({ params }) {
  const { talepler } = useStore();
  const t = talepler.find((x) => x.id === params.id);
  if (!t) return <Screen title="Talep"><Empty text="Talep bulunamadı." /></Screen>;
  const yapilan = t.olaylar.map((o) => o.label);
  const pending = ADIMLAR.filter((a) => !yapilan.some((y) => y.startsWith(a)));
  const sla = slaOzet(t);
  const acilis = t.olaylar[0].at;

  const eposta = (BIRIMLER[t.tenant] || []).find((b) => b.ad === t.birim)?.eposta;

  return (
    <Screen title={`Talep #${t.id}`} subtitle={t.birim}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Badge text={t.durum} />
        <Badge text={`Öncelik: ${t.oncelik}`} fg={t.oncelik === 'Yüksek' ? C.red : C.muted} bg={t.oncelik === 'Yüksek' ? C.redSoft : C.bg2} />
      </Row>
      <Card style={{ backgroundColor: sla.ok ? C.blueSoft : C.redSoft, borderColor: 'transparent' }}>
        <Row>
          <Ionicons name="timer-outline" size={22} color={sla.ok ? C.blue : C.red} />
          <H3 style={{ flex: 1 }}>{sla.text}</H3>
        </Row>
        <Muted>Hedef süre: {HEDEF_GUN[t.kategori] || 5} gün · Açılış: {fmt(acilis)}</Muted>
      </Card>

      <Eyebrow>Süreç</Eyebrow>
      <Card>
        <Timeline items={t.olaylar} pending={pending} />
      </Card>

      {t.aciklama ? (
        <Card style={{ backgroundColor: C.amberSoft, borderColor: 'transparent' }}>
          <Text style={{ color: C.amberDark, fontWeight: '800' }}>Belediye açıklaması</Text>
          <T>{t.aciklama}</T>
        </Card>
      ) : null}

      <Eyebrow>Talep bilgileri</Eyebrow>
      <Card>
        <T>{t.metin}</T>
        {t.foto ? <FotoKutusu /> : null}
        <Bilgi icon="pricetag-outline" text={t.kategori} />
        <Bilgi icon="business-outline" text={t.birim} />
        <Bilgi icon="location-outline" text={`${t.mahalle} Mahallesi · ${t.sokak}`} />
        <Bilgi icon={t.kanal === 'Sesli mesaj' ? 'mic-outline' : t.kanal === 'Fotoğraf' ? 'camera-outline' : 'create-outline'} text={`Kanal: ${t.kanal}`} />
      </Card>

      {eposta ? <Notice tone="blue" icon="mail-outline">Talebiniz {eposta} adresine iletildi. Birim durumu güncelledikçe size bildirim gönderilir.</Notice> : null}
      {pending.length ? (
        <Notice icon="swap-horizontal">Demo: Çıkış yapıp “Belediye personeli” olarak (örneğin Fen İşleri) giriş yaparsanız bu talebi işleyip kapatabilirsiniz.</Notice>
      ) : null}
    </Screen>
  );
}

function Bilgi({ icon, text }) {
  return (
    <Row style={{ gap: 8 }}>
      <Ionicons name={icon} size={16} color={C.faint} />
      <Muted style={{ flex: 1 }}>{text}</Muted>
    </Row>
  );
}

function FotoKutusu() {
  return (
    <View style={{ height: 140, borderRadius: 12, backgroundColor: '#7E958D', justifyContent: 'flex-end', padding: 8, overflow: 'hidden' }}>
      <View style={{ position: 'absolute', left: 30, top: 24, width: 46, height: 46, borderRadius: 23, backgroundColor: '#A9BBB4', opacity: 0.9 }} />
      <View style={{ position: 'absolute', right: 40, top: 40, width: 90, height: 60, borderRadius: 8, backgroundColor: '#5E756D' }} />
      <Badge text="Yüzler bulanıklaştırıldı" fg={C.light} bg={C.green} />
    </View>
  );
}

export function BMNew({ params }) {
  const { setTalepler, pop, push, showToast } = useStore();
  const [kategori, setKategori] = useState(null);
  const [metin, setMetin] = useState(params?.metin || '');
  const [kanal, setKanal] = useState('Yazılı');
  const [duzenleniyor, setDuzenleniyor] = useState(false);
  const [v, setV] = useState(0);
  const [orijinal, setOrijinal] = useState(null);
  const [foto, setFoto] = useState(0); // 0 yok, 1 işleniyor, 2 hazır
  const [konumModu, setKonumModu] = useState('Liste');
  const [mahalle, setMahalle] = useState(null);
  const [sokak, setSokak] = useState(null);
  const [haritaPin, setHaritaPin] = useState(null);

  const ai = useMemo(() => suggestBirim(metin), [metin]);
  const pii = useMemo(() => maskPII(metin), [metin]);
  const kat = kategori || ai?.kategori || 'Diğer';
  const birim = KATEGORI_BIRIM[kat];
  const konumTamam = konumModu === 'Harita' ? !!haritaPin : !!(mahalle && sokak);
  const hazir = metin.trim().length >= 10 && konumTamam;

  const resmiDil = () => {
    if (metin.trim().length < 5) return;
    setDuzenleniyor(true);
    setTimeout(() => {
      const yer = konumModu === 'Harita' && haritaPin ? `${haritaPin.mahalle} Mahallesi, ${haritaPin.sokak}` : mahalle ? `${mahalle} Mahallesi${sokak ? ', ' + sokak : ''}` : '';
      const kaynak = orijinal ?? metin;
      setOrijinal(kaynak);
      setMetin(dokumanUret('dilekce', { konu: kat, yer, anlatim: kaynak }, v).metin);
      setV(v + 1);
      setDuzenleniyor(false);
    }, 900);
  };

  const fotoEkle = () => {
    setFoto(1);
    setTimeout(() => setFoto(2), 1200);
    if (kanal === 'Yazılı') setKanal('Fotoğraf');
  };

  const gonder = () => {
    const now = new Date();
    const id = newId();
    const m = konumModu === 'Harita' ? haritaPin.mahalle : mahalle;
    const so = konumModu === 'Harita' ? `${haritaPin.sokak} (haritadan işaretlendi)` : sokak;
    const t = {
      id, tenant: 'gomec', sahip: 'ben', basvuran: 'A*** D***', kategori: kat, birim, oncelik: ai?.oncelik || 'Orta', kanal, metin: pii.masked,
      mahalle: m, sokak: so, foto: foto === 2, durum: 'Birime iletildi',
      olaylar: [
        { label: 'Oluşturuldu', at: now },
        { label: `${birim}’ne iletildi`, at: new Date(now.getTime() + 60000) },
      ],
    };
    setTalepler((l) => [t, ...l]);
    pop();
    push('BM_Detail', { id });
    showToast(`Talebiniz alındı · #${id}`);
  };

  return (
    <Screen title="Yeni talep" subtitle="Beyaz Masa" footer={<Btn title="Talebi gönder" icon="send" disabled={!hazir} onPress={gonder} />}>
      <Label>Talebinizi anlatın</Label>
      <Field multiline value={metin} onChangeText={(x) => { setMetin(x); if (x.trim().length < 3) setOrijinal(null); }} placeholder="Örn: Sokağımızdaki lamba üç gündür yanmıyor." />
      <Row>
        <Btn title={duzenleniyor ? 'Yazılıyor…' : 'Resmî dile çevir'} variant="outline" icon="sparkles-outline" onPress={resmiDil} style={{ flex: 1 }} />
        <Btn title={foto === 2 ? 'Fotoğraf eklendi' : 'Fotoğraf ekle'} variant="outline" icon="camera-outline" onPress={fotoEkle} style={{ flex: 1 }} />
      </Row>
      <Muted style={{ fontSize: 13 }}>“Resmî dile çevir” metninizi yapay zekâ ile dilekçe diline dönüştürür; konum seçiliyse metne ekler.</Muted>
      {foto === 1 ? <Notice tone="blue" icon="scan-outline">Fotoğraf işleniyor: yüzler ve plakalar bulanıklaştırılıyor…</Notice> : null}
      {foto === 2 ? <FotoKutusu /> : null}

      {pii.found.length ? (
        <Notice tone="red" icon="shield-checkmark-outline">
          Mesajınızda kişisel veri tespit edildi ({pii.found.join(', ')}). Birime şu şekilde iletilecektir:{'\n'}“{pii.masked}”
        </Notice>
      ) : null}

      <Label>Konum</Label>
      <Chips items={['Liste', 'Harita']} value={konumModu} onChange={setKonumModu} />
      {konumModu === 'Liste' ? (
        <>
          <Muted>Mahalle seçin</Muted>
          <Chips items={MAHALLELER} value={mahalle} onChange={(m) => { setMahalle(m); setSokak(null); }} scroll={false} />
          {mahalle ? (
            <>
              <Muted>Sokak seçin</Muted>
              <Chips items={SOKAKLAR[mahalle]} value={sokak} onChange={setSokak} scroll={false} />
            </>
          ) : null}
        </>
      ) : (
        <MiniHarita pin={haritaPin} onPick={setHaritaPin} />
      )}
      <Notice tone="blue" icon="globe-outline">Konum telefonunuzdan alınmaz; ilçe dışındayken de ilçeye dair bildirim yapabilirsiniz.</Notice>

      <Label>Kategori (isteğe bağlı)</Label>
      <Chips items={BEYAZ_MASA_KATEGORILER} value={kategori} onChange={(k) => setKategori(kategori === k ? null : k)} scroll={false} />

      <Card style={{ backgroundColor: C.amberSoft, borderColor: 'transparent' }}>
        <Row>
          <Ionicons name="sparkles-outline" size={18} color={C.amberDark} />
          <Text style={{ color: C.amberDark, fontWeight: '800' }}>{kategori ? 'Seçilen birim' : 'Yapay zekâ önerisi'}</Text>
        </Row>
        <T style={{ fontWeight: '700' }}>{birim}</T>
        <Muted>Kategori: {kat} · Öncelik: {ai?.oncelik || 'Orta'} · Hedef süre: {HEDEF_GUN[kat]} gün</Muted>
      </Card>
    </Screen>
  );
}

const PINLER = [
  { x: 0.28, y: 0.32, mahalle: 'Kemalpaşa', sokak: 'Atatürk Caddesi' },
  { x: 0.62, y: 0.25, mahalle: 'Yaya', sokak: 'Cumhuriyet Caddesi' },
  { x: 0.45, y: 0.62, mahalle: 'Mithatpaşa', sokak: 'Sahil Yolu' },
  { x: 0.78, y: 0.7, mahalle: 'Karaağaç', sokak: 'Plaj Caddesi' },
  { x: 0.15, y: 0.75, mahalle: 'Mithatpaşa', sokak: 'Liman Sokak' },
];

export function MiniHarita({ pin, onPick }) {
  const [w, setW] = useState(0);
  const H = 200;
  return (
    <View>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: H, borderRadius: 14, backgroundColor: '#E4EBE3', overflow: 'hidden', borderWidth: 1, borderColor: C.line }}>
        <View style={{ position: 'absolute', left: -40, bottom: -60, width: 220, height: 160, borderRadius: 110, backgroundColor: '#BFD6E2' }} />
        <View style={{ position: 'absolute', left: 0, right: 0, top: 70, height: 10, backgroundColor: '#FFF' }} />
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: '40%', width: 10, backgroundColor: '#FFF' }} />
        <View style={{ position: 'absolute', top: 0, bottom: 0, left: '72%', width: 7, backgroundColor: '#FFF' }} />
        <View style={{ position: 'absolute', left: '40%', right: 0, top: 140, height: 7, backgroundColor: '#FFF' }} />
        {w ? PINLER.map((p, i) => (
          <Pressable key={i} onPress={() => onPick(p)} hitSlop={10}
            style={{ position: 'absolute', left: p.x * w - 14, top: p.y * H - 14, width: 28, height: 28, borderRadius: 14,
              backgroundColor: pin === p ? C.amber : 'rgba(47,111,143,0.25)', borderWidth: 2, borderColor: pin === p ? C.amberDark : C.blue,
              alignItems: 'center', justifyContent: 'center' }}>
            {pin === p ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFF' }} /> : null}
          </Pressable>
        )) : null}
      </View>
      <Muted style={{ marginTop: 6 }}>{pin ? `Seçilen konum: ${pin.mahalle} · ${pin.sokak}` : 'Haritada bir noktaya dokunun.'}</Muted>
    </View>
  );
}
