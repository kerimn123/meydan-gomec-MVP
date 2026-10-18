import { useMemo, useState } from 'react';
import { View, Text, Pressable, Linking, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { useStore } from '../store';
import { ISLETMELER, PAYLASIM_TURLERI, KULLANICILAR } from '../data';
import { Screen, Card, Badge, Muted, H2, H3, Btn, Row, Chips, Field, Label, Notice, Eyebrow, T, Empty, s as ui } from '../ui';
import { relDay, fmtShort, isOpen, GUNLER, money, d, newId } from '../util';

const isl = (id) => ISLETMELER.find((x) => x.id === id);
const bugunSaat = (b) => {
  const h = b.hours[new Date().getDay()];
  if (!h) return 'Bugün kapalı';
  if (h[0] === '00:00' && h[1] === '23:59') return '24 saat açık';
  return `Bugün ${h[0]}–${h[1]}`;
};
const turRenk = { 'Kampanya': C.amberDark, 'Menü': C.blue, 'Çalışma saatleri': C.ok, 'Duyuru': C.muted };

function PaylasimKart({ p, onPress, showBiz = true }) {
  const b = isl(p.isletmeId);
  const acik = isOpen(b.hours);
  return (
    <Card onPress={onPress}>
      {showBiz ? (
        <Row style={{ justifyContent: 'space-between' }}>
          <Row style={{ flex: 1, gap: 8 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: C.green, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: C.amber, fontWeight: '800' }}>{b.ad[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontWeight: '800', color: C.text }} numberOfLines={1}>{b.ad}</Text>
              <Muted style={{ fontSize: 12 }}>{b.tur} · {b.mahalle}</Muted>
            </View>
          </Row>
          <Badge text={acik ? 'Açık' : 'Kapalı'} />
        </Row>
      ) : null}
      <Text style={{ color: turRenk[p.tur] || C.muted, fontWeight: '800', fontSize: 13 }}>{p.tur.toUpperCase()}</Text>
      <H3>{p.baslik}</H3>
      <Muted numberOfLines={3}>{p.metin}</Muted>
      <Muted style={{ fontSize: 12 }}>{relDay(p.tarih)} · {fmtShort(p.gecerlilik)} tarihine kadar geçerli</Muted>
    </Card>
  );
}

export function ESList({ params }) {
  const { hesap, paylasimlar, push } = useStore();
  const kurumsal = hesap === 'kurumsal';
  const [sekme, setSekme] = useState(params?.mine && kurumsal ? 'İşletmem' : 'Paylaşımlar');
  const [tur, setTur] = useState('Tümü');
  const [ara, setAra] = useState('');
  const [acikOnly, setAcikOnly] = useState(false);
  const benimId = KULLANICILAR.kurumsal.isletmeId;

  const sekmeler = kurumsal ? ['İşletmem', 'Paylaşımlar', 'İşletmeler'] : ['Paylaşımlar', 'İşletmeler'];
  const posts = paylasimlar.filter((p) => tur === 'Tümü' || p.tur === tur);
  const q = ara.toLocaleLowerCase('tr');
  const bizler = ISLETMELER.filter((b) => (!q || (b.ad + ' ' + b.tur + ' ' + b.tanitim).toLocaleLowerCase('tr').includes(q)) && (!acikOnly || isOpen(b.hours)));

  return (
    <Screen title="Esnaf Rehberi" subtitle="Gömeç işletmeleri"
      footer={kurumsal ? <Btn title="Yeni paylaşım" icon="add-circle-outline" onPress={() => push('ES_New')} /> : null}>
      <Chips items={sekmeler} value={sekme} onChange={setSekme} />

      {sekme === 'İşletmem' ? (
        <>
          <Card style={{ backgroundColor: C.green, borderColor: C.green }}>
            <Text style={{ color: C.light, fontSize: 18, fontWeight: '800' }}>{isl(benimId).ad}</Text>
            <Text style={{ color: C.lightMuted }}>{isl(benimId).adres} · {bugunSaat(isl(benimId))}</Text>
            <Row style={{ marginTop: 6, gap: 16 }}>
              <View><Text style={{ color: C.amber, fontSize: 20, fontWeight: '800' }}>{paylasimlar.filter((p) => p.isletmeId === benimId).length}</Text><Text style={{ color: C.lightMuted, fontSize: 12 }}>Paylaşım</Text></View>
              <View><Text style={{ color: C.amber, fontSize: 20, fontWeight: '800' }}>1.284</Text><Text style={{ color: C.lightMuted, fontSize: 12 }}>Görüntülenme (30 gün)</Text></View>
              <View><Text style={{ color: C.amber, fontSize: 20, fontWeight: '800' }}>212</Text><Text style={{ color: C.lightMuted, fontSize: 12 }}>Takipçi</Text></View>
            </Row>
          </Card>
          <Eyebrow>Paylaşımlarım</Eyebrow>
          {paylasimlar.filter((p) => p.isletmeId === benimId).map((p) => (
            <PaylasimKart key={p.id} p={p} showBiz={false} onPress={() => push('ES_Detail', { id: benimId })} />
          ))}
        </>
      ) : null}

      {sekme === 'Paylaşımlar' ? (
        <>
          <Chips items={['Tümü', ...PAYLASIM_TURLERI]} value={tur} onChange={setTur} />
          {posts.length === 0 ? <Empty text="Bu türde paylaşım yok." /> : null}
          {posts.map((p) => <PaylasimKart key={p.id} p={p} onPress={() => push('ES_Detail', { id: p.isletmeId })} />)}
        </>
      ) : null}

      {sekme === 'İşletmeler' ? (
        <>
          <View style={[ui.input, { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 }]}>
            <Ionicons name="search-outline" size={20} color={C.blue} />
            <TextInput value={ara} onChangeText={setAra} placeholder="Neye ihtiyacınız var? Örn: elektrik, fırın" placeholderTextColor={C.faint}
              style={{ flex: 1, fontSize: 15, color: C.text, paddingVertical: 6 }} />
          </View>
          <Chips items={['Tümü', 'Şimdi açık']} value={acikOnly ? 'Şimdi açık' : 'Tümü'} onChange={(v) => setAcikOnly(v === 'Şimdi açık')} />
          <Muted>{bizler.length} işletme</Muted>
          {bizler.map((b) => {
            const acik = isOpen(b.hours);
            return (
              <Card key={b.id} onPress={() => push('ES_Detail', { id: b.id })}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <H3 style={{ flex: 1 }}>{b.ad}</H3>
                  <Badge text={acik ? 'Açık' : 'Kapalı'} />
                </Row>
                <Muted>{b.tur} · {b.mahalle} · Yetkili: {b.yetkili}</Muted>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Muted>{bugunSaat(b)}</Muted>
                  <Pressable onPress={() => Linking.openURL(`tel:${b.tel.replace(/\s/g, '')}`)} style={{ flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: C.blue, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
                    <Ionicons name="call" size={14} color="#FFF" />
                    <Text style={{ color: '#FFF', fontWeight: '800' }}>Ara</Text>
                  </Pressable>
                </Row>
              </Card>
            );
          })}
        </>
      ) : null}
    </Screen>
  );
}

export function ESDetail({ params }) {
  const { paylasimlar, showToast } = useStore();
  const [takip, setTakip] = useState(false);
  const b = isl(params.id);
  if (!b) return <Screen title="İşletme"><Empty text="İşletme bulunamadı." /></Screen>;
  const posts = paylasimlar.filter((p) => p.isletmeId === b.id);
  const acik = isOpen(b.hours);
  const bugun = new Date().getDay();
  const sira = [1, 2, 3, 4, 5, 6, 0];
  return (
    <Screen title={b.ad} subtitle={`${b.tur} · ${b.mahalle}`}>
      <Card style={{ backgroundColor: C.green, borderColor: C.green }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={{ color: C.light, fontSize: 20, fontWeight: '800', flex: 1 }}>{b.ad}</Text>
          <Badge text={acik ? 'Açık' : 'Kapalı'} />
        </Row>
        <Text style={{ color: C.lightMuted, fontSize: 14 }}>{b.tanitim}</Text>
        <Text style={{ color: C.lightMuted, fontSize: 14 }}>{b.adres} · {b.mahalle} Mahallesi</Text>
        <Text style={{ color: C.lightMuted, fontSize: 14 }}>Yetkili: {b.yetkili}</Text>
      </Card>
      <Row>
        <Btn title="Ara" icon="call" onPress={() => Linking.openURL(`tel:${b.tel.replace(/\s/g, '')}`)} style={{ flex: 1 }} />
        <Btn title={takip ? 'Takiptesiniz' : 'Takip et'} variant="outline" icon={takip ? 'notifications' : 'notifications-outline'}
          onPress={() => { setTakip(!takip); if (!takip) showToast(`${b.ad} paylaşımları size bildirilecek`); }} style={{ flex: 1 }} />
      </Row>
      <Muted>Telefon: {b.tel}</Muted>

      <Eyebrow>Çalışma saatleri</Eyebrow>
      <Card>
        {sira.map((g) => {
          const h = b.hours[g];
          return (
            <Row key={g} style={{ justifyContent: 'space-between' }}>
              <T style={g === bugun ? { fontWeight: '800' } : null}>{GUNLER[g]}{g === bugun ? ' (bugün)' : ''}</T>
              <T style={[{ color: h ? C.text : C.faint }, g === bugun ? { fontWeight: '800' } : null]}>
                {h ? (h[0] === '00:00' && h[1] === '23:59' ? '24 saat' : `${h[0]}–${h[1]}`) : 'Kapalı'}
              </T>
            </Row>
          );
        })}
      </Card>

      <Eyebrow>Paylaşımlar</Eyebrow>
      {posts.length === 0 ? <Empty text="Henüz paylaşım yok." /> : null}
      {posts.map((p) => (
        <Card key={p.id}>
          <Text style={{ color: turRenk[p.tur], fontWeight: '800', fontSize: 13 }}>{p.tur.toUpperCase()}</Text>
          <H3>{p.baslik}</H3>
          {p.menu ? (
            <View style={{ gap: 6, marginTop: 4 }}>
              {p.menu.map(([ad, fiyat]) => (
                <Row key={ad} style={{ justifyContent: 'space-between' }}>
                  <T style={{ flex: 1 }}>{ad}</T>
                  <T style={{ fontWeight: '800' }}>{money(fiyat)}</T>
                </Row>
              ))}
            </View>
          ) : <T>{p.metin}</T>}
          <Muted style={{ fontSize: 12 }}>{relDay(p.tarih)} · {fmtShort(p.gecerlilik)} tarihine kadar</Muted>
        </Card>
      ))}
    </Screen>
  );
}

export function ESNew({ params }) {
  const { setPaylasimlar, pop, replace, showToast } = useStore();
  const [tur, setTur] = useState(params?.tur || 'Kampanya');
  const [baslik, setBaslik] = useState(params?.baslik || '');
  const [metin, setMetin] = useState(params?.metin || '');
  const [menu, setMenu] = useState('');
  const [sure, setSure] = useState('1 hafta');
  const [gorsel, setGorsel] = useState(false);
  const sureGun = { '1 gün': 1, '1 hafta': 7, '1 ay': 30, '3 ay': 90 }[sure];

  const menuSatir = useMemo(() => menu.split('\n').map((l) => l.trim()).filter(Boolean).map((l) => {
    const m = l.match(/^(.*?)[\s\-–:]+(\d+(?:[.,]\d+)?)\s*(?:tl|₺)?$/i);
    return m ? [m[1].trim(), Number(m[2].replace(',', '.'))] : [l, 0];
  }), [menu]);

  const hazir = baslik.trim().length > 3 && (tur === 'Menü' ? menuSatir.length > 0 : metin.trim().length > 5);

  const paylas = () => {
    setPaylasimlar((l) => [{
      id: 'p' + newId(), isletmeId: KULLANICILAR.kurumsal.isletmeId, tur, baslik,
      metin: tur === 'Menü' ? menuSatir.map((m) => m[0]).join('\n') : metin,
      menu: tur === 'Menü' ? menuSatir : undefined,
      tarih: new Date(), gecerlilik: d(sureGun, 23, 59),
    }, ...l]);
    pop();
    showToast('Paylaşımınız yayınlandı');
  };

  return (
    <Screen title="Yeni paylaşım" subtitle={KULLANICILAR.kurumsal.ad} footer={<Btn title="Paylaş" icon="send" disabled={!hazir} onPress={paylas} />}>
      <Btn title="Metni yapay zekâ ile oluştur" variant="outline" icon="sparkles-outline" onPress={() => replace('DK_Form', { tur: 'paylasim', donus: 'ES_New', onDeger: { tur } })} />
      <Label>Paylaşım türü</Label>
      <Chips items={PAYLASIM_TURLERI} value={tur} onChange={setTur} scroll={false} />
      <Field label="Başlık" value={baslik} onChangeText={setBaslik} placeholder={tur === 'Menü' ? 'Örn: Bugünün menüsü' : tur === 'Çalışma saatleri' ? 'Örn: Kış dönemi çalışma saatleri' : 'Örn: Hafta içi %20 indirim'} />
      {tur === 'Menü' ? (
        <Field label="Menü (her satıra bir ürün ve fiyat)" multiline value={menu} onChangeText={setMenu} placeholder={'Mercimek çorbası - 60\nKarnıyarık - 160\nSütlaç - 70'} />
      ) : (
        <Field label="Açıklama" multiline value={metin} onChangeText={setMetin} placeholder="Paylaşımınızın ayrıntıları" />
      )}
      {tur === 'Menü' && menuSatir.length ? (
        <Card>
          <Muted>Önizleme</Muted>
          {menuSatir.map(([ad, f], i) => (
            <Row key={i} style={{ justifyContent: 'space-between' }}><T style={{ flex: 1 }}>{ad}</T><T style={{ fontWeight: '800' }}>{f ? money(f) : '—'}</T></Row>
          ))}
        </Card>
      ) : null}
      <Pressable onPress={() => setGorsel(!gorsel)} style={{ height: 110, borderRadius: 14, borderWidth: 2, borderStyle: 'dashed', borderColor: gorsel ? C.ok : '#B4ADA0', alignItems: 'center', justifyContent: 'center', backgroundColor: gorsel ? C.okSoft : 'transparent' }}>
        <Ionicons name={gorsel ? 'image' : 'image-outline'} size={28} color={gorsel ? C.ok : C.faint} />
        <Muted>{gorsel ? 'Görsel eklendi' : 'Görsel ekle'}</Muted>
      </Pressable>
      <Label>Yayında kalma süresi</Label>
      <Chips items={['1 gün', '1 hafta', '1 ay', '3 ay']} value={sure} onChange={setSure} />
      <Notice icon="checkmark-done-outline">Paylaşımlar yapay zekâ ön kontrolünden geçer; belediyenin belirlediği kurallara uygun içerikler doğrudan yayınlanır.</Notice>
    </Screen>
  );
}
