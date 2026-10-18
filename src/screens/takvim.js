import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { useStore } from '../store';
import { TAKVIM } from '../data_mvp';
import { MAHALLELER, SOKAKLAR } from '../data';
import { Screen, Card, Badge, Muted, H2, H3, Btn, Row, Chips, Label, Notice, Eyebrow, T, Empty } from '../ui';
import { fmt, fmtDay, relDay, dayDiff } from '../util';
import { MiniHarita } from './beyazmasa';

const RENK = { Elektrik: C.amber, Su: C.blue, Eczane: C.ok, Resmî: C.green };
const IKON = { Elektrik: 'flash-outline', Su: 'water-outline', Eczane: 'medkit-outline', Resmî: 'flag-outline' };
const saat = (dt) => `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

export function etkiler(k, b) {
  return k.etki.some((e) => e.mahalle === '*' || (e.mahalle === b.mahalle && (e.sokaklar.includes('*') || e.sokaklar.includes(b.sokak))));
}
const kesinti = (k) => k.tur === 'Elektrik' || k.tur === 'Su';

export function TKList() {
  const { push, bolgeler, aktifBolge } = useStore();
  const b = bolgeler[aktifBolge];
  const [tur, setTur] = useState('Tümü');
  const [hepsi, setHepsi] = useState(false);
  const aktif = TAKVIM.filter((k) => k.bit >= new Date()).sort((x, y) => x.bas - y.bas);
  const turlu = aktif.filter((k) => tur === 'Tümü' || k.tur === tur);
  const benim = turlu.filter((k) => etkiler(k, b));
  const gizli = turlu.length - benim.length;
  const liste = hepsi ? turlu : benim;

  const gruplar = [];
  liste.forEach((k) => {
    const gun = dayDiff(k.bas) <= 0 ? 'Bugün ve devam eden' : `${relDay(k.bas)} · ${fmtDay(k.bas)}`;
    let g = gruplar.find((x) => x.gun === gun);
    if (!g) { g = { gun, items: [] }; gruplar.push(g); }
    g.items.push(k);
  });

  return (
    <Screen title="İlçe Takvimi" subtitle="Kesinti, nöbetçi eczane, resmî duyurular">
      <Card onPress={() => push('TK_Bolge')} style={{ backgroundColor: C.green, borderColor: C.green }}>
        <Row>
          <Ionicons name="location" size={20} color={C.amber} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: C.light, fontWeight: '800', fontSize: 16 }}>Bölge: {b.ad}</Text>
            <Text style={{ color: C.lightMuted, fontSize: 13 }}>{b.mahalle} Mahallesi · {b.sokak}</Text>
          </View>
          <Text style={{ color: C.amber, fontWeight: '800' }}>Değiştir</Text>
        </Row>
      </Card>
      <Chips items={['Tümü', 'Elektrik', 'Su', 'Eczane', 'Resmî']} value={tur} onChange={setTur} />
      {liste.length === 0 ? <Empty text="Bölgenizi etkileyen kayıt yok." icon="checkmark-done-outline" /> : null}
      {gruplar.map((g) => (
        <View key={g.gun} style={{ gap: 10 }}>
          <Eyebrow>{g.gun}</Eyebrow>
          {g.items.map((k) => {
            const benimki = kesinti(k) && etkiler(k, b);
            return (
              <Pressable key={k.id} onPress={() => push('TK_Detail', { id: k.id })}>
                <View style={{ backgroundColor: C.card, borderRadius: 14, borderLeftWidth: 6, borderLeftColor: RENK[k.tur], borderWidth: 1, borderColor: C.line, padding: 12, gap: 4 }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Row style={{ gap: 6, flex: 1 }}>
                      <Ionicons name={IKON[k.tur]} size={18} color={RENK[k.tur]} />
                      <H3 style={{ flex: 1 }} numberOfLines={1}>{k.baslik}</H3>
                    </Row>
                    <Ionicons name="chevron-forward" size={18} color={C.faint} />
                  </Row>
                  <Muted>{k.tur === 'Resmî' && saat(k.bas) === '00:00' ? fmtDay(k.bas) : `${saat(k.bas)}–${saat(k.bit)}`} · {k.kaynak}</Muted>
                  {benimki ? <Badge text="Bölgenizi etkiliyor" fg={C.amberDark} bg={C.amberSoft} /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      ))}
      {gizli > 0 ? (
        <Pressable onPress={() => setHepsi(!hepsi)}>
          <Text style={{ textAlign: 'center', color: C.blue, fontWeight: '800', paddingVertical: 8 }}>
            {hepsi ? 'Yalnızca bölgemi göster' : `Bölgenizi etkilemeyen ${gizli} kayıt gizlendi · Tümünü göster`}
          </Text>
        </Pressable>
      ) : null}
    </Screen>
  );
}

export function TKDetail({ params }) {
  const { bolgeler, aktifBolge, showToast } = useStore();
  const b = bolgeler[aktifBolge];
  const k = TAKVIM.find((x) => x.id === params.id);
  const [acik, setAcik] = useState(false);
  if (!k) return <Screen title="Kayıt"><Empty text="Kayıt bulunamadı." /></Screen>;
  const benimki = etkiler(k, b);
  const sureSaat = Math.round((k.bit - k.bas) / 3600000);
  return (
    <Screen title={k.tur === 'Eczane' ? 'Nöbetçi eczane' : k.tur === 'Resmî' ? 'Resmî duyuru' : `${k.tur} kesintisi`} subtitle={k.kaynak}>
      <H2>{k.baslik}</H2>
      {kesinti(k) ? <Badge text={benimki ? 'Bölgenizi etkiliyor' : 'Bölgenizi etkilemiyor'} fg={benimki ? C.amberDark : C.ok} bg={benimki ? C.amberSoft : C.okSoft} /> : null}
      <Card>
        <Row><Ionicons name="calendar-outline" size={18} color={C.blue} /><T style={{ fontWeight: '700' }}>{fmtDay(k.bas)}</T></Row>
        <Muted>{saat(k.bas)}–{saat(k.bit)}{kesinti(k) ? ` · yaklaşık ${sureSaat} saat` : ''}</Muted>
      </Card>
      <Card>
        <Muted>{kesinti(k) ? 'Kesinti nedeni' : 'Açıklama'}</Muted>
        <T>{k.aciklama}</T>
      </Card>
      {kesinti(k) ? (
        <Card>
          <Pressable onPress={() => setAcik(!acik)}>
            <Row style={{ justifyContent: 'space-between' }}>
              <H3>Etkilenen yerler</H3>
              <Ionicons name={acik ? 'chevron-up' : 'chevron-down'} size={18} color={C.faint} />
            </Row>
          </Pressable>
          {k.etki.map((e) => (
            <View key={e.mahalle} style={{ gap: 2 }}>
              <T style={{ fontWeight: '700' }}>{e.mahalle} Mahallesi</T>
              {acik || e.mahalle === b.mahalle ? (
                <Muted>{e.sokaklar.includes('*') ? 'Mahallenin tamamı' : e.sokaklar.map((x) => (x === b.sokak && e.mahalle === b.mahalle ? `${x} (sizin sokağınız)` : x)).join(', ')}</Muted>
              ) : null}
            </View>
          ))}
        </Card>
      ) : null}
      <Muted>Kaynak: {k.kaynak} · {fmt(k.yayim)} tarihinde yayımlandı</Muted>
      {kesinti(k) ? <Btn title="Başlamadan 1 saat önce hatırlat" icon="alarm-outline" onPress={() => showToast('Hatırlatıcı kuruldu')} /> : null}
      <Notice tone="blue" icon="information-circle-outline">Bilgiler ilgili kurumun duyurusundan otomatik alınır. Erteleme veya iptal olursa bildirim gönderilir.</Notice>
    </Screen>
  );
}

export function TKBolge() {
  const { bolgeler, setBolgeler, aktifBolge, setAktifBolge, pop, showToast } = useStore();
  const [ekle, setEkle] = useState(false);
  const [ad, setAd] = useState('Yazlık');
  const [mod, setMod] = useState('Liste');
  const [mahalle, setMahalle] = useState(null);
  const [sokak, setSokak] = useState(null);
  const [pin, setPin] = useState(null);
  const hazir = mod === 'Harita' ? !!pin : !!(mahalle && sokak);

  const kaydet = () => {
    const yeni = mod === 'Harita' ? { ad, mahalle: pin.mahalle, sokak: pin.sokak, kaynak: 'Haritadan işaretlendi' } : { ad, mahalle, sokak, kaynak: 'Mahalle ve sokak seçildi' };
    setBolgeler((l) => [...l, yeni]);
    setAktifBolge(bolgeler.length);
    showToast(`${ad} bölgesi eklendi`);
    pop();
  };

  return (
    <Screen title="Bölgelerim" subtitle="Takvim bu bölgeye göre süzülür" footer={ekle ? <Btn title="Bölgeyi kaydet" icon="checkmark" disabled={!hazir} onPress={kaydet} /> : null}>
      {bolgeler.map((x, i) => (
        <Card key={i} highlight={i === aktifBolge} onPress={() => { setAktifBolge(i); pop(); }}>
          <Row>
            <Ionicons name={i === aktifBolge ? 'radio-button-on' : 'radio-button-off'} size={22} color={C.blue} />
            <View style={{ flex: 1 }}>
              <H3>{x.ad}</H3>
              <Muted>{x.mahalle} · {x.sokak} · {x.kaynak}</Muted>
            </View>
          </Row>
        </Card>
      ))}
      {!ekle ? <Btn title="Yeni bölge ekle" variant="outline" icon="add" onPress={() => setEkle(true)} /> : (
        <>
          <Eyebrow>Yeni bölge</Eyebrow>
          <Label>Bölge adı</Label>
          <Chips items={['Ev', 'Aile evi', 'Yazlık', 'İşyeri']} value={ad} onChange={setAd} />
          <Chips items={['Liste', 'Harita']} value={mod} onChange={setMod} />
          {mod === 'Liste' ? (
            <>
              <Muted>Mahalle</Muted>
              <Chips items={MAHALLELER} value={mahalle} onChange={(m) => { setMahalle(m); setSokak(null); }} scroll={false} />
              {mahalle ? (<><Muted>Sokak</Muted><Chips items={SOKAKLAR[mahalle]} value={sokak} onChange={setSokak} scroll={false} /></>) : null}
            </>
          ) : <MiniHarita pin={pin} onPick={setPin} />}
          <Notice tone="blue" icon="globe-outline">İlçe dışında yaşasanız da ilçedeki evinizi veya yazlığınızı ekleyebilirsiniz.</Notice>
        </>
      )}
    </Screen>
  );
}
