import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { useStore } from '../store';
import { KULLANICILAR } from '../data';
import { PORTAL_KULLANICILARI, BELEDIYELER, ROLLER, TAKVIM } from '../data_mvp';
import { Card, Badge, Muted, H3, Btn, Row } from '../ui';
import { dayDiff, fmtShort, money, relDay } from '../util';
import { etkiler } from './takvim';

export function LoginScreen() {
  const { setHesap, setPortalUser, resetTo } = useStore();
  const insets = useSafeAreaInsets();
  const [tip, setTip] = useState('bireysel');
  const [kimlik, setKimlik] = useState('');
  const [tel, setTel] = useState('');
  const [kodGonderildi, setKod] = useState(false);

  const giris = () => { resetTo('Home'); setHesap(tip); };
  const personel = (u) => { resetTo('Home'); setPortalUser(u); setHesap('portal'); };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: C.green }} contentContainerStyle={{ padding: 24, paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24, gap: 16 }} keyboardShouldPersistTaps="handled">
      <Text style={l.eyebrow}>Gömeç Belediyesi</Text>
      <Text style={l.logo}>Meydan</Text>
      <Text style={l.tag}>Gömeç’in dijital meydanı</Text>
      <View style={l.panel}>
        <View style={l.seg}>
          {[['bireysel', 'Bireysel'], ['kurumsal', 'Kurumsal'], ['belediye', 'Belediye']].map(([t, ad]) => (
            <Pressable key={t} onPress={() => setTip(t)} style={[l.segBtn, tip === t && l.segOn]}>
              <Text style={[l.segT, tip === t && { color: C.light }]}>{ad}</Text>
            </Pressable>
          ))}
        </View>
        {tip !== 'belediye' ? (
          <>
            <Text style={l.label}>{tip === 'bireysel' ? 'T.C. Kimlik No' : 'VKN veya TCKN'}</Text>
            <TextInput style={l.input} value={kimlik} onChangeText={setKimlik} keyboardType="number-pad" maxLength={11}
              placeholder={tip === 'bireysel' ? '11 haneli numara' : '10 veya 11 haneli numara'} placeholderTextColor={C.faint} />
            <Text style={l.label}>Cep telefonu</Text>
            <TextInput style={l.input} value={tel} onChangeText={setTel} keyboardType="phone-pad" placeholder="05__ ___ __ __" placeholderTextColor={C.faint} />
            {kodGonderildi ? (
              <>
                <Text style={l.label}>SMS onay kodu</Text>
                <TextInput style={l.input} defaultValue="246810" keyboardType="number-pad" />
                <Btn title="Giriş yap" onPress={giris} />
              </>
            ) : <Btn title="SMS onay kodu gönder" onPress={() => setKod(true)} />}
            <Pressable onPress={giris}><Text style={l.demo}>Demo hesabıyla hızlı giriş</Text></Pressable>
          </>
        ) : (
          <>
            <Text style={l.hint}>Belediye personeli kurum e-postası ve SMS doğrulamasıyla giriş yapar. Demoda bir rol seçin; her rol yalnızca kendi belediyesini ve yetki alanını görür.</Text>
            {PORTAL_KULLANICILARI.map((u) => (
              <Pressable key={u.id} onPress={() => personel(u)} style={({ pressed }) => [l.user, pressed && { opacity: 0.7 }]}>
                <Ionicons name={u.rol === 'platform' ? 'planet-outline' : 'person-circle-outline'} size={28} color={C.blue} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: '800', color: C.text }}>{u.ad} · {u.unvan}</Text>
                  <Text style={{ color: C.muted, fontSize: 13 }}>{u.tenant ? BELEDIYELER.find((b) => b.id === u.tenant).ad : 'Meydan'} · {ROLLER[u.rol].ad}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={C.faint} />
              </Pressable>
            ))}
          </>
        )}
      </View>
      <Text style={l.foot}>Demo sürüm · Tüm veriler örnektir</Text>
    </ScrollView>
  );
}

const MODULLER = {
  bireysel: [
    { name: 'BM_List', ad: 'Beyaz Masa', alt: 'Talep ve şikâyet', icon: 'chatbubbles-outline' },
    { name: 'DY_List', ad: 'Belediye Duyuruları', alt: 'Resmî duyurular', icon: 'megaphone-outline' },
    { name: 'OD_List', ad: 'Ödemelerim', alt: 'Hatırlatma ve ödeme', icon: 'wallet-outline' },
    { name: 'SY_List', ad: 'Sosyal Yardım', alt: 'Başvuru ve takip', icon: 'heart-outline' },
    { name: 'IL_List', ad: 'Vatandaş Duyuruları', alt: 'Vefat, davet, satılık…', icon: 'newspaper-outline' },
    { name: 'TK_List', ad: 'İlçe Takvimi', alt: 'Kesinti ve nöbetçi eczane', icon: 'calendar-outline' },
    { name: 'ES_List', ad: 'Esnaf Rehberi', alt: 'İşletmeler ve saatler', icon: 'storefront-outline' },
    { name: 'DK_Home', ad: 'Yapay zekâ ile yaz', alt: 'Dilekçe, duyuru metni', icon: 'sparkles-outline' },
  ],
  kurumsal: [
    { name: 'OD_List', ad: 'Ödeme Yönlendirme', alt: 'Kira, işgaliye, vergi', icon: 'wallet-outline' },
    { name: 'ES_List', ad: 'Esnaf Rehberi', alt: 'İşletmem ve paylaşımlar', icon: 'storefront-outline', params: { mine: true } },
    { name: 'DK_Home', ad: 'Yapay zekâ ile yaz', alt: 'Paylaşım, dilekçe', icon: 'sparkles-outline' },
    { name: 'DY_List', ad: 'Belediye Duyuruları', alt: 'Resmî duyurular', icon: 'megaphone-outline' },
    { name: 'TK_List', ad: 'İlçe Takvimi', alt: 'Kesinti ve eczane', icon: 'calendar-outline' },
    { name: 'BM_List', ad: 'Beyaz Masa', alt: 'Talep ve şikâyet', icon: 'chatbubbles-outline' },
  ],
};

export function HomeScreen() {
  const st = useStore();
  const { hesap, setHesap, push, talepler, yardimlar, odemeler, okunanDuyurular, duyurular, showToast, bolgeler, aktifBolge, ilanlar } = st;
  const insets = useSafeAreaInsets();
  const user = KULLANICILAR[hesap];
  const acikTalep = talepler.filter((t) => t.sahip === 'ben' && t.durum !== 'Kapatıldı').length;
  const bekleyenOdeme = odemeler[hesap].filter((o) => o.durum !== 'Ödendi');
  const enYakin = [...bekleyenOdeme].sort((a, b) => a.sonGun - b.sonGun)[0];
  const gomecDuyuru = duyurular.filter((d) => d.tenant === 'gomec');
  const okunmamis = gomecDuyuru.filter((d) => !okunanDuyurular[d.id]).length;
  const onemli = [...gomecDuyuru].sort((a, b) => b.tarih - a.tarih).find((d) => d.onemli);
  const b = bolgeler[aktifBolge];
  const kesinti = TAKVIM.filter((k) => (k.tur === 'Elektrik' || k.tur === 'Su') && k.bit >= new Date() && etkiler(k, b)).sort((x, y) => x.bas - y.bas)[0];

  const sayac = {
    BM_List: acikTalep ? `${acikTalep} açık talep` : null,
    SY_List: yardimlar.some((y) => y.sahip === 'ben' && y.durum === 'Eksik belge') ? 'Eksik belge var' : null,
    DY_List: okunmamis ? `${okunmamis} yeni` : null,
    OD_List: bekleyenOdeme.length ? `${bekleyenOdeme.length} bekleyen` : null,
    IL_List: ilanlar.some((i) => i.sahip === 'ben' && i.durum === 'Onay bekliyor') ? 'Onay bekleyen' : null,
  };

  const hesapDegistir = () => {
    const yeni = hesap === 'bireysel' ? 'kurumsal' : 'bireysel';
    setHesap(yeni);
    showToast(yeni === 'kurumsal' ? 'Kurumsal hesaba geçildi' : 'Bireysel hesaba geçildi');
  };
  const saat = (dt) => `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[h.top, { paddingTop: insets.top + 14 }]}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View>
            <Text style={h.logo}>Meydan</Text>
            <Text style={h.sub}>Gömeç Belediyesi</Text>
          </View>
          <Row>
            <Pressable onPress={hesapDegistir} style={h.iconBtn} accessibilityLabel="Hesap değiştir"><Ionicons name="swap-horizontal" size={22} color={C.light} /></Pressable>
            <Pressable onPress={() => setHesap(null)} style={h.iconBtn} accessibilityLabel="Çıkış"><Ionicons name="log-out-outline" size={22} color={C.light} /></Pressable>
          </Row>
        </Row>
        <Pressable onPress={hesapDegistir} style={h.user}>
          <Ionicons name={hesap === 'bireysel' ? 'person-circle-outline' : 'business-outline'} size={34} color={C.amber} />
          <View style={{ flex: 1 }}>
            <Text style={h.userName}>{user.ad}</Text>
            <Text style={h.userSub}>{hesap === 'bireysel' ? 'Bireysel hesap' : 'Kurumsal hesap'} · {user.kimlik}</Text>
          </View>
          <Text style={h.switchT}>Değiştir</Text>
        </Pressable>
        <Pressable onPress={() => push('SR')} style={h.search} accessibilityLabel="Akıllı arama">
          <Ionicons name="search-outline" size={20} color={C.blue} />
          <Text style={{ color: C.faint, fontSize: 15, flex: 1 }}>Neye ihtiyacınız var?</Text>
          <Ionicons name="sparkles" size={16} color={C.amber} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: insets.bottom + 24 }}>
        {kesinti ? (
          <Card onPress={() => push('TK_Detail', { id: kesinti.id })} style={{ backgroundColor: C.amberSoft, borderColor: 'transparent' }}>
            <Row>
              <Ionicons name={kesinti.tur === 'Elektrik' ? 'flash' : 'water'} size={18} color={C.amberDark} />
              <Text style={{ color: C.amberDark, fontWeight: '800', fontSize: 13 }}>{relDay(kesinti.bas).toUpperCase()} · {saat(kesinti.bas)}–{saat(kesinti.bit)}</Text>
            </Row>
            <Text style={{ fontSize: 16, fontWeight: '800', color: C.text }}>Bölgenizde {kesinti.tur.toLocaleLowerCase('tr')} kesintisi</Text>
            <Muted>{b.ad} · {b.mahalle} · Kaynak: {kesinti.kaynak}</Muted>
          </Card>
        ) : null}

        {onemli ? (
          <Card onPress={() => push('DY_Detail', { id: onemli.id })} style={{ backgroundColor: C.green, borderColor: C.green }}>
            <Row>
              <Ionicons name="megaphone" size={18} color={C.amber} />
              <Text style={{ color: C.amber, fontWeight: '800', fontSize: 13 }}>ÖNEMLİ DUYURU · {relDay(onemli.tarih).toUpperCase()}</Text>
            </Row>
            <Text style={{ color: C.light, fontSize: 17, fontWeight: '800' }}>{onemli.baslik}</Text>
            <Text style={{ color: C.lightMuted, fontSize: 14 }} numberOfLines={2}>{onemli.metin}</Text>
          </Card>
        ) : null}

        <View style={h.grid}>
          {MODULLER[hesap].map((m) => (
            <Pressable key={m.name} onPress={() => push(m.name, m.params || {})} style={({ pressed }) => [h.tile, pressed && { opacity: 0.75 }]}>
              <Ionicons name={m.icon} size={28} color={m.name === 'DK_Home' ? C.amberDark : C.blue} />
              <Text style={h.tileT}>{m.ad}</Text>
              <Text style={h.tileS}>{m.alt}</Text>
              {sayac[m.name] ? <Badge text={sayac[m.name]} fg={C.amberDark} bg={C.amberSoft} style={{ marginTop: 4 }} /> : null}
            </Pressable>
          ))}
        </View>

        {enYakin ? (
          <Card onPress={() => push('OD_List')}>
            <Row style={{ justifyContent: 'space-between' }}>
              <H3>En yakın ödeme</H3>
              <Badge text={enYakin.durum === 'Gecikmiş' ? 'Gecikmiş' : `${dayDiff(enYakin.sonGun)} gün kaldı`}
                fg={enYakin.durum === 'Gecikmiş' ? C.red : C.amberDark} bg={enYakin.durum === 'Gecikmiş' ? C.redSoft : C.amberSoft} />
            </Row>
            <Text style={{ fontSize: 15, color: C.text }}>{enYakin.kalem}</Text>
            <Row style={{ justifyContent: 'space-between' }}>
              <Muted>Son gün: {fmtShort(enYakin.sonGun)}</Muted>
              <Text style={{ fontSize: 17, fontWeight: '800', color: C.text }}>{money(enYakin.tutar)}</Text>
            </Row>
          </Card>
        ) : null}

        <Muted style={{ textAlign: 'center', fontSize: 12, marginTop: 8 }}>MVP demo sürümü · Tüm veriler örnektir</Muted>
      </ScrollView>
    </View>
  );
}

const l = StyleSheet.create({
  eyebrow: { color: C.amber, fontWeight: '800', letterSpacing: 2, fontSize: 13, textTransform: 'uppercase' },
  logo: { color: C.light, fontSize: 52, fontWeight: '800', fontFamily: 'serif' },
  tag: { color: C.lightMuted, fontSize: 17, marginTop: -8 },
  panel: { backgroundColor: C.bg, borderRadius: 24, padding: 18, gap: 10, marginTop: 8 },
  seg: { flexDirection: 'row', backgroundColor: C.bg2, borderRadius: 14, padding: 4, marginBottom: 6 },
  segBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  segOn: { backgroundColor: C.green },
  segT: { fontSize: 14, fontWeight: '800', color: C.text },
  label: { fontSize: 14, fontWeight: '700', color: C.text },
  hint: { fontSize: 14, color: C.muted, lineHeight: 20 },
  input: { backgroundColor: '#FFF', borderWidth: 1, borderColor: C.line2, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: C.text },
  demo: { textAlign: 'center', color: C.blue, fontWeight: '800', fontSize: 15, paddingVertical: 6 },
  user: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12 },
  foot: { color: C.lightMuted, textAlign: 'center', fontSize: 13 },
});

const h = StyleSheet.create({
  top: { backgroundColor: C.green, paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  logo: { color: C.light, fontSize: 30, fontWeight: '800', fontFamily: 'serif' },
  sub: { color: C.lightMuted, fontSize: 13 },
  iconBtn: { padding: 8, borderRadius: 12, backgroundColor: C.green2 },
  user: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.green2, borderRadius: 16, padding: 12 },
  userName: { color: C.light, fontSize: 16, fontWeight: '800' },
  userSub: { color: C.lightMuted, fontSize: 12 },
  switchT: { color: C.amber, fontWeight: '800', fontSize: 13 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.bg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '47%', flexGrow: 1, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 14, gap: 4, minHeight: 120 },
  tileT: { fontSize: 16, fontWeight: '800', color: C.text, marginTop: 6 },
  tileS: { fontSize: 13, color: C.muted },
});
