import { useEffect, useMemo, useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { useStore } from '../store';
import { DUYURU_KATEGORILER, ILAN_KATEGORILER, MAHALLELER } from '../data';
import { Screen, Card, Badge, Muted, H2, H3, Btn, Row, Chips, Field, Label, Notice, Eyebrow, T, Empty } from '../ui';
import { fmt, relDay, maskPII, newId } from '../util';

// ---------------- BELEDİYE DUYURULARI ----------------
export function DYList() {
  const { push, okunanDuyurular, duyurular } = useStore();
  const [kat, setKat] = useState('Tümü');
  const liste = duyurular
    .filter((d) => d.tenant === 'gomec')
    .filter((d) => kat === 'Tümü' || (kat === 'Önemli' ? d.onemli : d.kategori === kat))
    .sort((a, b) => b.tarih - a.tarih);
  return (
    <Screen title="Belediye Duyuruları" subtitle="Gömeç Belediyesi">
      <Chips items={DUYURU_KATEGORILER} value={kat} onChange={setKat} />
      {liste.length === 0 ? <Empty text="Bu kategoride duyuru yok." /> : null}
      {liste.map((d) => (
        <Card key={d.id} onPress={() => push('DY_Detail', { id: d.id })} highlight={d.onemli && !okunanDuyurular[d.id]}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Row style={{ gap: 6 }}>
              {!okunanDuyurular[d.id] ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: C.amber }} /> : null}
              <Badge text={d.kategori} fg={C.blue} bg={C.blueSoft} />
              {d.onemli ? <Badge text="Önemli" fg={C.red} bg={C.redSoft} /> : null}
            </Row>
            <Muted>{relDay(d.tarih)}</Muted>
          </Row>
          <H3>{d.baslik}</H3>
          <Muted numberOfLines={2}>{d.metin}</Muted>
          <Row style={{ gap: 6 }}>
            <Ionicons name="location-outline" size={14} color={C.faint} />
            <Muted style={{ fontSize: 13 }}>{d.mahalleler}</Muted>
          </Row>
        </Card>
      ))}
    </Screen>
  );
}

export function DYDetail({ params }) {
  const { setOkunan, duyurular } = useStore();
  const d = duyurular.find((x) => x.id === params.id);
  useEffect(() => {
    if (d) setOkunan((o) => ({ ...o, [d.id]: true }));
  }, [d, setOkunan]);
  if (!d) return <Screen title="Duyuru"><Empty text="Duyuru bulunamadı." /></Screen>;
  return (
    <Screen title="Duyuru" subtitle={d.kategori}>
      <Row style={{ gap: 6 }}>
        <Badge text={d.kategori} fg={C.blue} bg={C.blueSoft} />
        {d.onemli ? <Badge text="Önemli" fg={C.red} bg={C.redSoft} /> : null}
      </Row>
      <H2>{d.baslik}</H2>
      <Muted>{fmt(d.tarih)} · {d.mahalleler}</Muted>
      <Card><T style={{ fontSize: 16, lineHeight: 24 }}>{d.metin}</T></Card>
      <Notice tone="blue" icon="notifications-outline">Bu duyuru, bildirim tercihlerinize göre telefonunuza anlık bildirim olarak gönderilmiştir.</Notice>
    </Screen>
  );
}

// ---------------- VATANDAŞ DUYURULARI ----------------
const ikonFor = (k) => ({
  'Vefat': 'flower-outline', 'Düğün': 'heart-outline', 'Sünnet': 'happy-outline', 'Hayır': 'restaurant-outline',
  'Satılık': 'pricetag-outline', 'Kiralık': 'key-outline', 'Usta aranıyor': 'hammer-outline',
  'Kayıp / Buluntu': 'search-outline', 'Yol kapanması': 'warning-outline',
}[k] || 'newspaper-outline');

const dokumanTuru = (k) => (k === 'Vefat' ? 'vefat' : ['Düğün', 'Sünnet', 'Hayır'].includes(k) ? 'davet' : ['Satılık', 'Kiralık'].includes(k) ? 'satilik' : 'davet');

function IlanKart({ i, onPress }) {
  return (
    <Card onPress={onPress}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Row style={{ gap: 6 }}>
          <Ionicons name={ikonFor(i.kategori)} size={16} color={C.amberDark} />
          <Text style={{ color: C.amberDark, fontWeight: '800', fontSize: 13 }}>{i.kategori}</Text>
        </Row>
        {i.durum !== 'Yayında' ? <Badge text={i.durum} /> : <Muted style={{ fontSize: 13 }}>{relDay(i.tarih)}</Muted>}
      </Row>
      <H3>{i.baslik}</H3>
      <Muted numberOfLines={2}>{i.metin}</Muted>
      <Row style={{ justifyContent: 'space-between' }}>
        <Muted style={{ fontSize: 13 }}>{i.mahalle} Mahallesi</Muted>
        {i.fiyat ? <Text style={{ fontWeight: '800', color: C.text }}>{i.fiyat}</Text> : null}
      </Row>
    </Card>
  );
}

export function ILList() {
  const { ilanlar, push } = useStore();
  const [kat, setKat] = useState('Tümü');
  const yayinda = ilanlar.filter((i) => i.tenant === 'gomec' && i.durum === 'Yayında').sort((a, b) => b.tarih - a.tarih);
  const liste = yayinda.filter((i) => kat === 'Tümü' || i.kategori === kat);
  const benim = ilanlar.filter((i) => i.sahip === 'ben' && i.durum !== 'Yayında');
  return (
    <Screen title="Vatandaş Duyuruları" subtitle="Belediye onaylı duyurular" footer={<Btn title="Duyuru ver" icon="add-circle-outline" onPress={() => push('IL_New')} />}>
      {benim.length ? (
        <>
          <Eyebrow>Duyurularım</Eyebrow>
          {benim.map((i) => <IlanKart key={i.id} i={i} onPress={() => push('IL_Detail', { id: i.id })} />)}
          <Eyebrow>Yayındaki duyurular</Eyebrow>
        </>
      ) : null}
      <Chips items={['Tümü', ...ILAN_KATEGORILER]} value={kat} onChange={setKat} />
      {liste.length === 0 ? <Empty text="Bu kategoride duyuru yok." /> : null}
      {liste.map((i) => <IlanKart key={i.id} i={i} onPress={() => push('IL_Detail', { id: i.id })} />)}
    </Screen>
  );
}

export function ILDetail({ params }) {
  const { ilanlar, showToast } = useStore();
  const i = ilanlar.find((x) => x.id === params.id);
  if (!i) return <Screen title="Duyuru"><Empty text="Duyuru bulunamadı." /></Screen>;
  const benim = i.sahip === 'ben';
  const mesajLabel = i.kategori === 'Vefat' ? 'Taziye mesajı gönder' : i.kategori === 'Düğün' || i.kategori === 'Sünnet' ? 'Tebrik mesajı gönder' : 'Duyuru sahibine mesaj gönder';
  return (
    <Screen title={i.kategori} subtitle={`${i.mahalle} Mahallesi`}>
      {i.durum !== 'Yayında' ? <Badge text={i.durum} /> : null}
      <H2>{i.baslik}</H2>
      <Muted>{fmt(i.tarih)}</Muted>
      {i.fiyat ? <Text style={{ fontSize: 22, fontWeight: '800', color: C.text }}>{i.fiyat}</Text> : null}
      <Card><T style={{ fontSize: 16, lineHeight: 24 }}>{i.metin}</T></Card>
      {i.durum === 'Reddedildi' && i.redGerekce ? <Notice tone="red" icon="close-circle-outline">Belediye açıklaması: {i.redGerekce}</Notice> : null}
      {benim && i.durum === 'Onay bekliyor' ? (
        <Notice icon="hourglass-outline">Duyurunuz Basın ve Halkla İlişkiler biriminin onayından sonra yayınlanacaktır. Demoda belediye portalına geçip onaylayabilirsiniz.</Notice>
      ) : null}
      {!benim ? (
        <>
          <Btn title={mesajLabel} icon="chatbubble-ellipses-outline" onPress={() => showToast('Mesajınız iletildi. Telefon numaranız paylaşılmadı.')} />
          <Btn title="Uygunsuz içeriği bildir" variant="ghost" icon="flag-outline" onPress={() => showToast('Bildiriminiz belediyeye iletildi')} />
        </>
      ) : null}
    </Screen>
  );
}

export function ILNew({ params }) {
  const { setIlanlar, pop, push, replace, showToast } = useStore();
  const [kat, setKat] = useState(params?.kategori || null);
  const [baslik, setBaslik] = useState(params?.baslik || '');
  const [metin, setMetin] = useState(params?.metin || '');
  const [mahalle, setMahalle] = useState('Kemalpaşa');
  const [fiyat, setFiyat] = useState(params?.fiyat || '');
  const pii = useMemo(() => maskPII(metin), [metin]);
  const fiyatli = kat === 'Satılık' || kat === 'Kiralık';
  const hazir = kat && baslik.trim().length > 3 && metin.trim().length > 10;

  const gonder = () => {
    const id = 'i' + newId();
    setIlanlar((l) => [{ id, tenant: 'gomec', sahip: 'ben', basvuran: 'A*** D***', kategori: kat, baslik, metin: pii.masked, mahalle, tarih: new Date(), fiyat: fiyatli && fiyat ? `₺${fiyat}` : undefined, durum: 'Onay bekliyor' }, ...l]);
    pop();
    push('IL_Detail', { id });
    showToast('Duyurunuz onaya gönderildi');
  };

  return (
    <Screen title="Duyuru ver" subtitle="Vatandaş Duyuruları" footer={<Btn title="Onaya gönder" icon="send" disabled={!hazir} onPress={gonder} />}>
      <Card style={{ backgroundColor: C.amberSoft, borderColor: 'transparent' }}>
        <Row><Ionicons name="sparkles-outline" size={18} color={C.amberDark} /><Text style={{ color: C.amberDark, fontWeight: '800' }}>Metni yapay zekâ yazsın</Text></Row>
        <Muted>Birkaç bilgi girin; vefat, davet veya satılık duyurunuzu hazır metin olarak oluşturalım.</Muted>
        <Btn title="Yapay zekâ ile oluştur" variant="outline" icon="sparkles-outline" onPress={() => replace('DK_Form', { tur: dokumanTuru(kat), donus: 'IL_New' })} />
      </Card>
      <Label>Kategori</Label>
      <Chips items={ILAN_KATEGORILER} value={kat} onChange={setKat} scroll={false} />
      <Field label="Başlık" value={baslik} onChangeText={setBaslik} placeholder="Örn: Cumartesi hayır yemeği" />
      <Field label="Duyuru metni" multiline value={metin} onChangeText={setMetin} placeholder="Duyurmak istediğiniz bilgiyi yazın." />
      {pii.found.length ? (
        <Notice tone="red" icon="shield-checkmark-outline">Metinde kişisel veri tespit edildi ({pii.found.join(', ')}). Yayında gizlenecektir. Sizinle uygulama içinden iletişim kurulabilir.</Notice>
      ) : null}
      {fiyatli ? <Field label="Fiyat (₺)" value={fiyat} onChangeText={setFiyat} keyboardType="number-pad" /> : null}
      <Label>Mahalle</Label>
      <Chips items={MAHALLELER} value={mahalle} onChange={setMahalle} />
      <Notice icon="checkmark-done-outline">Duyurunuz ön kontrolden geçer ve belediye onayından sonra yayınlanır.</Notice>
    </Screen>
  );
}
