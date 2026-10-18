import { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { useStore, yetki } from '../store';
import { BELEDIYELER, BIRIMLER, ROLLER } from '../data_mvp';
import { HEDEF_GUN, DUYURU_KATEGORILER, MAHALLELER } from '../data';
import { Screen, Card, Badge, Muted, H2, H3, Btn, Row, Chips, Field, Label, Notice, Eyebrow, T, Empty, Timeline } from '../ui';
import { fmt, duration, newId, relDay } from '../util';

const belediyeAdi = (id) => BELEDIYELER.find((b) => b.id === id)?.ad || 'Meydan Platformu';
const eposta = (tenant, birim) => (BIRIMLER[tenant] || []).find((b) => b.ad === birim)?.eposta || `beyazmasa@${tenant}.bel.tr`;
const hedefTarih = (t) => new Date(t.olaylar[0].at.getTime() + (HEDEF_GUN[t.kategori] || 5) * 86400000);
const ADIMLAR = ['İşleme alındı', 'Talep karşılandı', 'Kapatıldı'];

function sla(t) {
  const acilis = t.olaylar[0].at;
  const hedef = HEDEF_GUN[t.kategori] || 5;
  if (t.durum === 'Kapatıldı') {
    const k = t.olaylar[t.olaylar.length - 1].at;
    return { durum: (k - acilis) / 86400000 <= hedef ? 'Sürede kapandı' : 'Geç kapandı', text: `${duration(acilis, k)} içinde kapandı`, ok: (k - acilis) / 86400000 <= hedef };
  }
  const kalan = hedefTarih(t) - new Date();
  if (kalan < 0) return { durum: 'Süresi aşıldı', text: `Hedef ${duration(hedefTarih(t), new Date())} aşıldı`, ok: false };
  const oran = 1 - kalan / (hedef * 86400000);
  return { durum: oran >= 0.75 ? 'Süresi yaklaşıyor' : 'Süresinde', text: `${duration(new Date(), hedefTarih(t))} kaldı (hedef ${hedef} gün)`, ok: oran < 0.75, uyari: oran >= 0.75 };
}

// ---------------- Portal ana ekranı ----------------
export function PTHome() {
  const { portalUser: u, talepler, yardimlar, ilanlar, push, setHesap, setPortalUser, resetTo } = useStore();
  const insets = useSafeAreaInsets();
  const benimTalepler = talepler.filter((t) => yetki.talepGorur(u, t));
  const acik = benimTalepler.filter((t) => t.durum !== 'Kapatıldı');
  const geciken = acik.filter((t) => !sla(t).ok);
  const bekleyenOnay = ilanlar.filter((i) => i.tenant === u.tenant && i.durum === 'Onay bekliyor');
  const yardim = yardimlar.filter((y) => yetki.yardimGorur(u, y) && !['Onaylandı', 'Sonuçlandı', 'Reddedildi'].includes(y.durum));

  const kartlar = [
    (u.rol === 'yonetici' || u.rol === 'birim') && { ad: 'Gelen kutusu', alt: 'E-postayla gelen talepler', icon: 'mail-outline', name: 'PT_Inbox', rozet: acik.length ? `${acik.length} açık` : null },
    (u.rol === 'yonetici' || u.rol === 'birim') && { ad: 'Talepler', alt: u.rol === 'birim' ? u.birim : 'Tüm birimler', icon: 'chatbubbles-outline', name: 'PT_Talepler', rozet: geciken.length ? `${geciken.length} uyarı` : null },
    u.rol === 'sosyal' && { ad: 'Sosyal yardım', alt: 'Başvuru değerlendirme', icon: 'heart-outline', name: 'PT_Yardimlar', rozet: yardim.length ? `${yardim.length} bekleyen` : null },
    yetki.onaylar(u) && { ad: 'Onay kuyruğu', alt: 'Vatandaş duyuruları', icon: 'checkmark-done-outline', name: 'PT_Onay', rozet: bekleyenOnay.length ? `${bekleyenOnay.length} bekliyor` : null },
    yetki.duyuruYayinlar(u) && { ad: 'Duyuru yayınla', alt: 'Anlık bildirim', icon: 'megaphone-outline', name: 'PT_Duyuru' },
    yetki.raporGorur(u) && { ad: 'Raporlar', alt: 'Süre ve birim performansı', icon: 'bar-chart-outline', name: 'PT_Rapor' },
    u.rol === 'platform' && { ad: 'Belediyeler', alt: 'Tenant ve paket yönetimi', icon: 'business-outline', name: 'PT_Platform' },
  ].filter(Boolean);

  const cikis = () => { setPortalUser(null); setHesap(null); resetTo('Home'); };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <View style={[p.top, { paddingTop: insets.top + 14 }]}>
        <Row style={{ justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <Text style={p.eyebrow}>MEYDAN · YÖNETİM PORTALI</Text>
            <Text style={p.title}>{belediyeAdi(u.tenant)}</Text>
          </View>
          <Pressable onPress={cikis} style={p.iconBtn} accessibilityLabel="Çıkış"><Ionicons name="log-out-outline" size={22} color={C.light} /></Pressable>
        </Row>
        <View style={p.user}>
          <Ionicons name="person-circle-outline" size={34} color={C.amber} />
          <View style={{ flex: 1 }}>
            <Text style={p.userName}>{u.ad} · {u.unvan}</Text>
            <Text style={p.userSub}>{ROLLER[u.rol].ad}{u.birim ? ` · ${u.birim}` : ''}</Text>
          </View>
        </View>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 24 }}>
        <Notice tone="blue" icon="shield-checkmark-outline">Yetki kapsamınız: {ROLLER[u.rol].aciklama}</Notice>
        <View style={p.grid}>
          {kartlar.map((k) => (
            <Pressable key={k.name} onPress={() => push(k.name)} style={({ pressed }) => [p.tile, pressed && { opacity: 0.75 }]}>
              <Ionicons name={k.icon} size={26} color={C.blue} />
              <Text style={p.tileT}>{k.ad}</Text>
              <Text style={p.tileS} numberOfLines={2}>{k.alt}</Text>
              {k.rozet ? <Badge text={k.rozet} fg={C.amberDark} bg={C.amberSoft} style={{ marginTop: 4 }} /> : null}
            </Pressable>
          ))}
        </View>
        {u.rol !== 'platform' ? (
          <Card>
            <H3>Pilot dönemde nasıl çalışır?</H3>
            <Muted>1. Vatandaşın talebi ilgili birimin e-posta adresine düşer.</Muted>
            <Muted>2. E-postadaki güvenli bağlantıyla giriş yapmadan “İşleme al” veya “Kapat” denir.</Muted>
            <Muted>3. Her adım vatandaşa bildirim olarak gider; süre aşımında Beyaz Masa sorumlusu uyarılır.</Muted>
          </Card>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ---------------- Gelen kutusu (e-posta simülasyonu) ----------------
export function PTInbox() {
  const { portalUser: u, talepler, push } = useStore();
  const liste = talepler.filter((t) => yetki.talepGorur(u, t)).sort((a, b) => b.olaylar[0].at - a.olaylar[0].at);
  const adres = eposta(u.tenant, u.birim || 'Beyaz Masa');
  return (
    <Screen title="Gelen kutusu" subtitle={adres}>
      <Notice tone="blue" icon="mail-outline">Pilotta talepler birimlerin mevcut kurumsal e-posta adreslerine gelir. Ek bir yazılım kurmak gerekmez.</Notice>
      <Card style={{ backgroundColor: C.bg2, borderColor: 'transparent' }}>
        <Row style={{ justifyContent: 'space-between' }}><Text style={{ fontWeight: '800', color: C.text }}>Meydan · Günlük özet</Text><Muted>08:00</Muted></Row>
        <Muted>{liste.filter((t) => t.durum !== 'Kapatıldı').length} açık talep · {liste.filter((t) => t.durum !== 'Kapatıldı' && !sla(t).ok).length} süre uyarısı</Muted>
      </Card>
      {liste.map((t) => {
        const st = sla(t);
        return (
          <Card key={t.id} onPress={() => push('PT_Email', { id: t.id })}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Text style={{ fontWeight: t.durum === 'Birime iletildi' ? '800' : '600', color: C.text }}>Meydan Beyaz Masa</Text>
              <Muted style={{ fontSize: 12 }}>{relDay(t.olaylar[0].at)}</Muted>
            </Row>
            <T numberOfLines={1} style={{ fontWeight: t.durum === 'Birime iletildi' ? '800' : '400' }}>[#{t.id}] {t.kategori} · {t.mahalle}</T>
            <Muted numberOfLines={1}>{t.metin}</Muted>
            <Row style={{ gap: 6 }}>
              <Badge text={t.durum} />
              {t.durum !== 'Kapatıldı' && !st.ok ? <Badge text={st.durum} fg={C.red} bg={C.redSoft} /> : null}
            </Row>
          </Card>
        );
      })}
    </Screen>
  );
}

export function PTEmail({ params }) {
  const { portalUser: u, talepler, push } = useStore();
  const t = talepler.find((x) => x.id === params.id);
  if (!t || !yetki.talepGorur(u, t)) return <Screen title="E-posta"><Empty text="Bu kayda erişim yetkiniz yok." icon="lock-closed-outline" /></Screen>;
  const st = sla(t);
  return (
    <Screen title="E-posta" subtitle={`[#${t.id}] ${t.kategori}`}>
      <Card>
        <Muted>Kimden: Meydan Beyaz Masa &lt;bildirim@meydan.app&gt;</Muted>
        <Muted>Kime: {eposta(t.tenant, t.birim)}</Muted>
        <Muted>Bilgi: {eposta(t.tenant, 'Beyaz Masa')}</Muted>
        <T style={{ fontWeight: '800', marginTop: 6 }}>[Meydan #{t.id}] {t.kategori} · {t.mahalle} Mah. · Hedef {HEDEF_GUN[t.kategori] || 5} gün</T>
      </Card>
      <Card>
        <T>Sayın {t.birim} yetkilisi,</T>
        <T>Meydan üzerinden biriminize yeni bir talep iletilmiştir.</T>
        <View style={{ backgroundColor: C.bg, borderRadius: 10, padding: 10, gap: 4 }}>
          <Muted>Talep</Muted><T>{t.metin}</T>
          <Muted>Konum</Muted><T>{t.mahalle} Mahallesi · {t.sokak}</T>
          <Muted>Başvuran</Muted><T>{t.basvuran} (iletişim uygulama üzerinden)</T>
          <Muted>Öncelik / Hedef</Muted><T>{t.oncelik} · {st.text}</T>
          {t.foto ? <Muted>Ek: 1 fotoğraf (yüzler ve plakalar bulanıklaştırıldı)</Muted> : null}
        </View>
        <Row>
          <Btn title="İşleme al" onPress={() => push('PT_TalepDetay', { id: t.id, via: 'eposta' })} style={{ flex: 1 }} />
          <Btn title="Kapat" variant="outline" onPress={() => push('PT_TalepDetay', { id: t.id, via: 'eposta', kapat: true })} style={{ flex: 1 }} />
        </Row>
        <Muted style={{ fontSize: 12 }}>Bu e-postadaki bağlantılar yalnızca bu talebe özeldir, 7 gün geçerlidir ve her işlem kayıt altına alınır. Hedef sürenin %75’i dolduğunda hatırlatma, süre aşıldığında Beyaz Masa sorumlusuna uyarı e-postası gönderilir.</Muted>
      </Card>
    </Screen>
  );
}

// ---------------- Talepler ----------------
export function PTTalepler() {
  const { portalUser: u, talepler, push } = useStore();
  const [f, setF] = useState('Açık');
  const kapsam = talepler.filter((t) => yetki.talepGorur(u, t));
  const liste = kapsam.filter((t) => {
    const st = sla(t);
    if (f === 'Açık') return t.durum !== 'Kapatıldı';
    if (f === 'Uyarı') return t.durum !== 'Kapatıldı' && !st.ok;
    return t.durum === 'Kapatıldı';
  }).sort((a, b) => hedefTarih(a) - hedefTarih(b));
  return (
    <Screen title="Talepler" subtitle={u.rol === 'birim' ? u.birim : belediyeAdi(u.tenant)}>
      <Chips items={['Açık', 'Uyarı', 'Kapalı']} value={f} onChange={setF} />
      <Muted>{liste.length} talep · hedef süresi en yakın olan üstte</Muted>
      {liste.length === 0 ? <Empty text="Bu filtrede talep yok." /> : null}
      {liste.map((t) => {
        const st = sla(t);
        return (
          <Card key={t.id} onPress={() => push('PT_TalepDetay', { id: t.id })} highlight={!st.ok && t.durum !== 'Kapatıldı'}>
            <Row style={{ justifyContent: 'space-between' }}>
              <Muted>#{t.id} · {t.kategori}</Muted>
              <Badge text={t.durum} />
            </Row>
            <T numberOfLines={2} style={{ fontWeight: '600' }}>{t.metin}</T>
            <Muted numberOfLines={1}>{t.mahalle} · {t.sokak}{u.rol === 'yonetici' ? ` · ${t.birim}` : ''}</Muted>
            <Text style={{ fontSize: 13, fontWeight: '700', color: st.ok ? C.blue : C.red }}>{st.durum} · {st.text}</Text>
          </Card>
        );
      })}
    </Screen>
  );
}

export function PTTalepDetay({ params }) {
  const { portalUser: u, talepler, setTalepler, showToast } = useStore();
  const t = talepler.find((x) => x.id === params.id);
  const [kapatPanel, setKapatPanel] = useState(!!params.kapat);
  const [aktarPanel, setAktarPanel] = useState(false);
  const [sonuc, setSonuc] = useState('Talep karşılandı');
  const [aciklama, setAciklama] = useState('');
  const [bildir, setBildir] = useState(true);
  const [hedefBirim, setHedefBirim] = useState(null);
  if (!t || !yetki.talepGorur(u, t)) return <Screen title="Talep"><Empty text="Bu kayda erişim yetkiniz yok." icon="lock-closed-outline" /></Screen>;

  const yapilan = t.olaylar.map((o) => o.label);
  const pending = t.durum === 'Kapatıldı' ? [] : ADIMLAR.filter((a) => !yapilan.some((y) => y.startsWith(a)));
  const st = sla(t);
  const ekle = (label, patch = {}) => setTalepler((l) => l.map((x) => (x.id === t.id ? { ...x, ...patch, olaylar: [...x.olaylar, { label: `${label} · ${u.ad}`, at: new Date() }] } : x)));

  const islemeAl = () => { ekle('İşleme alındı', { durum: 'İşlemde' }); showToast('Vatandaşa bildirildi: talebiniz işleme alındı'); };
  const karsilandi = () => { ekle('Talep karşılandı', { durum: 'Karşılandı' }); showToast('Vatandaşa bildirildi: talebiniz karşılandı'); };
  const kapat = () => {
    const not = aciklama.trim() || (sonuc === 'Görev alanı dışında' ? 'Talebiniz belediyemizin görev alanı dışındadır; ilgili kuruma iletilmesi önerilir.' : sonuc === 'Mükerrer talep' ? 'Aynı konuda daha önce açılmış bir talep bulunmaktadır; işlemler o talep üzerinden yürütülmektedir.' : null);
    setTalepler((l) => l.map((x) => (x.id === t.id ? {
      ...x, durum: 'Kapatıldı', aciklama: not, sonuc,
      olaylar: [...x.olaylar, ...(yapilan.some((y) => y.startsWith('Talep karşılandı')) || sonuc !== 'Talep karşılandı' ? [] : [{ label: `Talep karşılandı · ${u.ad}`, at: new Date() }]), { label: `Kapatıldı (${sonuc}) · ${u.ad}`, at: new Date() }],
    } : x)));
    setKapatPanel(false);
    showToast(bildir ? 'Talep kapatıldı · vatandaşa bildirim gönderildi' : 'Talep kapatıldı');
  };
  const aktar = () => {
    ekle(`${hedefBirim}’ne aktarıldı`, { birim: hedefBirim });
    setAktarPanel(false);
    showToast(`Talep ${hedefBirim} birimine aktarıldı`);
  };

  return (
    <Screen title={`Talep #${t.id}`} subtitle={t.birim}>
      {params.via === 'eposta' ? <Notice tone="green" icon="link-outline">E-postadaki güvenli bağlantıyla açıldı. Giriş gerekmez; bağlantı yalnızca bu talep için 7 gün geçerlidir.</Notice> : null}
      <Row style={{ justifyContent: 'space-between' }}>
        <Badge text={t.durum} />
        <Badge text={st.durum} fg={st.ok ? C.blue : C.red} bg={st.ok ? C.blueSoft : C.redSoft} />
      </Row>
      <Card>
        <T style={{ fontWeight: '700' }}>{t.metin}</T>
        <Muted>{t.kategori} · Öncelik {t.oncelik} · {t.kanal}</Muted>
        <Muted>{t.mahalle} Mahallesi · {t.sokak}</Muted>
        <Muted>Başvuran: {t.basvuran} · kişisel veriler maskelenmiştir</Muted>
        <Muted>Hedef süre: {HEDEF_GUN[t.kategori] || 5} gün · {st.text}</Muted>
      </Card>

      {t.durum !== 'Kapatıldı' && !kapatPanel && !aktarPanel ? (
        <View style={{ gap: 8 }}>
          {t.durum === 'Birime iletildi' ? <Btn title="İşleme al" icon="play" onPress={islemeAl} /> : null}
          {t.durum === 'İşlemde' ? <Btn title="Karşılandı olarak işaretle" icon="checkmark" onPress={karsilandi} /> : null}
          <Btn title="Talebi kapat" variant="outline" icon="checkmark-done" onPress={() => setKapatPanel(true)} />
          {yetki.talepAktarir(u) ? <Btn title="Başka birime aktar" variant="ghost" icon="swap-horizontal" onPress={() => setAktarPanel(true)} /> : null}
        </View>
      ) : null}

      {kapatPanel ? (
        <Card style={{ borderColor: C.blue, borderWidth: 2 }}>
          <H3>Talebi kapat</H3>
          <Label>Sonuç</Label>
          <Chips items={['Talep karşılandı', 'Görev alanı dışında', 'Mükerrer talep']} value={sonuc} onChange={setSonuc} scroll={false} />
          <Field label="Vatandaşa açıklama (isteğe bağlı)" multiline value={aciklama} onChangeText={setAciklama} placeholder="Örn: Arızalı armatür değiştirilmiştir." />
          <Pressable onPress={() => setBildir(!bildir)}>
            <Row><Ionicons name={bildir ? 'checkbox' : 'square-outline'} size={22} color={C.blue} /><T>Vatandaşa bildirim gönder</T></Row>
          </Pressable>
          <Row>
            <Btn title="Vazgeç" variant="outline" onPress={() => setKapatPanel(false)} style={{ flex: 1 }} />
            <Btn title="Kapat" onPress={kapat} style={{ flex: 1 }} />
          </Row>
        </Card>
      ) : null}

      {aktarPanel ? (
        <Card style={{ borderColor: C.blue, borderWidth: 2 }}>
          <H3>Başka birime aktar</H3>
          <Chips items={(BIRIMLER[t.tenant] || []).map((b) => b.ad).filter((b) => b !== t.birim && b !== 'Sosyal Yardım Birimi')} value={hedefBirim} onChange={setHedefBirim} scroll={false} />
          <Row>
            <Btn title="Vazgeç" variant="outline" onPress={() => setAktarPanel(false)} style={{ flex: 1 }} />
            <Btn title="Aktar" disabled={!hedefBirim} onPress={aktar} style={{ flex: 1 }} />
          </Row>
        </Card>
      ) : null}

      {t.aciklama ? (
        <Card style={{ backgroundColor: C.amberSoft, borderColor: 'transparent' }}>
          <Text style={{ color: C.amberDark, fontWeight: '800' }}>Vatandaşa iletilen açıklama</Text>
          <T>{t.aciklama}</T>
        </Card>
      ) : null}
      <Eyebrow>İşlem kaydı</Eyebrow>
      <Card><Timeline items={t.olaylar} pending={pending} /></Card>
    </Screen>
  );
}

// ---------------- Sosyal yardım ----------------
export function PTYardimlar() {
  const { portalUser: u, yardimlar, push } = useStore();
  const liste = yardimlar.filter((y) => yetki.yardimGorur(u, y));
  return (
    <Screen title="Sosyal yardım" subtitle={belediyeAdi(u.tenant)}>
      <Notice tone="blue" icon="lock-closed-outline">Sosyal yardım başvuruları özel nitelikli kişisel veri içerebilir. E-postayla yalnızca başvuru numarası ve güvenli bağlantı gönderilir; bağlantı personelin SMS doğrulamasıyla açılır.</Notice>
      {liste.map((y) => (
        <Card key={y.id} onPress={() => push('PT_YardimDetay', { id: y.id })} highlight={y.durum === 'Alındı'}>
          <Row style={{ justifyContent: 'space-between' }}><H3>{y.tur}</H3><Badge text={y.durum} /></Row>
          <Muted>{y.id} · {y.basvuran} · {y.hane} kişilik hane</Muted>
          <Muted>Başvuru: {fmt(y.olaylar[0].at)} · Hedef {y.hedefGun} gün</Muted>
        </Card>
      ))}
    </Screen>
  );
}

export function PTYardimDetay({ params }) {
  const { portalUser: u, yardimlar, setYardimlar, showToast } = useStore();
  const y = yardimlar.find((x) => x.id === params.id);
  const [panel, setPanel] = useState(null); // 'eksik' | 'onay' | 'red'
  const [metin, setMetin] = useState('');
  if (!y || !yetki.yardimGorur(u, y)) return <Screen title="Başvuru"><Empty text="Bu kayda erişim yetkiniz yok." icon="lock-closed-outline" /></Screen>;
  const bitti = ['Onaylandı', 'Sonuçlandı', 'Reddedildi'].includes(y.durum);
  const guncelle = (durum, label, patch = {}) => {
    setYardimlar((l) => l.map((x) => (x.id === y.id ? { ...x, durum, ...patch, olaylar: [...x.olaylar, { label: `${label} · ${u.ad}`, at: new Date() }] } : x)));
    setPanel(null); setMetin('');
    showToast(`Vatandaşa bildirildi: ${label.toLocaleLowerCase('tr')}`);
  };
  return (
    <Screen title={y.tur} subtitle={y.id}>
      <Row style={{ justifyContent: 'space-between' }}><Badge text={y.durum} /><Muted>Geçen süre: {duration(y.olaylar[0].at, new Date())}</Muted></Row>
      <Card>
        <Muted>Başvuran</Muted><T>{y.basvuran} · {y.hane} kişilik hane</T>
        <Muted>Açıklama</Muted><T>{y.aciklama}</T>
        <Muted>Belgeler</Muted><T>Başvuruya yüklenen belgeler güvenli alanda görüntülenir.</T>
      </Card>
      {!bitti && !panel ? (
        <View style={{ gap: 8 }}>
          {y.durum === 'Alındı' ? <Btn title="İncelemeye al" icon="play" onPress={() => guncelle('İncelemede', 'İncelemeye alındı')} /> : null}
          <Btn title="Eksik belge iste" variant="outline" icon="document-attach-outline" onPress={() => setPanel('eksik')} />
          <Row>
            <Btn title="Onayla" icon="checkmark" onPress={() => setPanel('onay')} style={{ flex: 1 }} />
            <Btn title="Reddet" variant="outline" icon="close" onPress={() => setPanel('red')} style={{ flex: 1 }} />
          </Row>
        </View>
      ) : null}
      {panel ? (
        <Card style={{ borderColor: C.blue, borderWidth: 2 }}>
          <H3>{panel === 'eksik' ? 'Eksik belge iste' : panel === 'onay' ? 'Başvuruyu onayla' : 'Başvuruyu reddet'}</H3>
          <Field multiline value={metin} onChangeText={setMetin} label={panel === 'eksik' ? 'İstenen belge' : panel === 'onay' ? 'Vatandaşa açıklama (isteğe bağlı)' : 'Ret gerekçesi'}
            placeholder={panel === 'eksik' ? 'Örn: Güncel ikametgâh belgesi' : panel === 'onay' ? 'Örn: Teslimat için sizinle iletişime geçilecektir.' : 'Örn: Hane geliri yardım ölçütlerinin üzerindedir.'} />
          <Row>
            <Btn title="Vazgeç" variant="outline" onPress={() => setPanel(null)} style={{ flex: 1 }} />
            <Btn title="Gönder" disabled={panel !== 'onay' && !metin.trim()} style={{ flex: 1 }} onPress={() => (
              panel === 'eksik' ? guncelle('Eksik belge', 'Eksik belge istendi', { eksik: metin })
                : panel === 'onay' ? guncelle('Onaylandı', 'Onaylandı', { sonuc: metin || 'Başvurunuz onaylanmıştır.' })
                  : guncelle('Reddedildi', 'Reddedildi', { sonuc: metin })
            )} />
          </Row>
        </Card>
      ) : null}
      <Eyebrow>İşlem kaydı</Eyebrow>
      <Card><Timeline items={y.olaylar} /></Card>
    </Screen>
  );
}

// ---------------- Onay kuyruğu ----------------
export function PTOnay() {
  const { portalUser: u, ilanlar, setIlanlar, showToast } = useStore();
  const [redId, setRedId] = useState(null);
  const [gerekce, setGerekce] = useState('');
  const liste = ilanlar.filter((i) => i.tenant === u.tenant && i.durum === 'Onay bekliyor');
  const karar = (i, durum) => {
    setIlanlar((l) => l.map((x) => (x.id === i.id ? { ...x, durum, tarih: durum === 'Yayında' ? new Date() : x.tarih, redGerekce: durum === 'Reddedildi' ? gerekce : undefined } : x)));
    setRedId(null); setGerekce('');
    showToast(durum === 'Yayında' ? 'Duyuru yayınlandı · sahibine bildirildi' : 'Duyuru reddedildi · gerekçe sahibine iletildi');
  };
  return (
    <Screen title="Onay kuyruğu" subtitle="Vatandaş duyuruları">
      {liste.length === 0 ? <Empty text="Onay bekleyen duyuru yok." icon="checkmark-done-outline" /> : null}
      {liste.map((i) => (
        <Card key={i.id}>
          <Row style={{ justifyContent: 'space-between' }}><Text style={{ color: C.amberDark, fontWeight: '800' }}>{i.kategori}</Text><Muted>{relDay(i.tarih)}</Muted></Row>
          <H3>{i.baslik}</H3>
          <T>{i.metin}</T>
          <Muted>{i.mahalle} · Gönderen: {i.basvuran}{i.fiyat ? ` · ${i.fiyat}` : ''}</Muted>
          <Row style={{ gap: 14 }}>
            <Row style={{ gap: 4 }}><Ionicons name="checkmark-circle" size={16} color={C.ok} /><Muted style={{ fontSize: 13 }}>Kişisel veri yok</Muted></Row>
            <Row style={{ gap: 4 }}><Ionicons name="checkmark-circle" size={16} color={C.ok} /><Muted style={{ fontSize: 13 }}>Uygunsuz içerik yok</Muted></Row>
          </Row>
          {redId === i.id ? (
            <>
              <Field label="Ret gerekçesi" value={gerekce} onChangeText={setGerekce} placeholder="Örn: Ticari reklam niteliği taşıyor." />
              <Row>
                <Btn title="Vazgeç" variant="outline" onPress={() => setRedId(null)} style={{ flex: 1 }} />
                <Btn title="Reddet" disabled={!gerekce.trim()} onPress={() => karar(i, 'Reddedildi')} style={{ flex: 1 }} />
              </Row>
            </>
          ) : (
            <Row>
              <Btn title="Onayla ve yayınla" onPress={() => karar(i, 'Yayında')} style={{ flex: 2 }} />
              <Btn title="Reddet" variant="outline" onPress={() => setRedId(i.id)} style={{ flex: 1 }} />
            </Row>
          )}
        </Card>
      ))}
    </Screen>
  );
}

// ---------------- Duyuru yayınla ----------------
export function PTDuyuru() {
  const { portalUser: u, setDuyurular, pop, showToast } = useStore();
  const [baslik, setBaslik] = useState('');
  const [metin, setMetin] = useState('');
  const [kat, setKat] = useState('Genel');
  const [hedef, setHedef] = useState('Tüm ilçe');
  const [mahalle, setMahalle] = useState(null);
  const [onemli, setOnemli] = useState(false);
  const b = BELEDIYELER.find((x) => x.id === u.tenant);
  const hazir = baslik.trim().length > 3 && metin.trim().length > 10 && (hedef === 'Tüm ilçe' || mahalle);
  const yayinla = () => {
    setDuyurular((l) => [{ id: 'd' + newId(), tenant: u.tenant, kategori: kat, onemli, tarih: new Date(), mahalleler: hedef === 'Tüm ilçe' ? 'Tüm ilçe' : mahalle, baslik, metin }, ...l]);
    showToast(`Duyuru yayınlandı · ${hedef === 'Tüm ilçe' ? b?.kullanici?.toLocaleString('tr-TR') : '~' + Math.round((b?.kullanici || 0) / 9)} kişiye bildirim`);
    pop();
  };
  return (
    <Screen title="Duyuru yayınla" subtitle={belediyeAdi(u.tenant)} footer={<Btn title="Yayınla ve bildir" icon="megaphone" disabled={!hazir} onPress={yayinla} />}>
      <Field label="Başlık" value={baslik} onChangeText={setBaslik} placeholder="Örn: İlaçlama çalışması" />
      <Field label="Duyuru metni" multiline value={metin} onChangeText={setMetin} placeholder="Duyurunun ayrıntıları" />
      <Label>Kategori</Label>
      <Chips items={DUYURU_KATEGORILER.filter((k) => k !== 'Tümü' && k !== 'Önemli')} value={kat} onChange={setKat} scroll={false} />
      <Label>Hedef kitle</Label>
      <Chips items={['Tüm ilçe', 'Mahalle seç']} value={hedef} onChange={setHedef} />
      {hedef === 'Mahalle seç' ? <Chips items={MAHALLELER} value={mahalle} onChange={setMahalle} scroll={false} /> : null}
      <Pressable onPress={() => setOnemli(!onemli)}>
        <Row><Ionicons name={onemli ? 'checkbox' : 'square-outline'} size={22} color={C.blue} /><T>Önemli duyuru olarak işaretle (ana sayfada öne çıkar)</T></Row>
      </Pressable>
    </Screen>
  );
}

// ---------------- Raporlar ----------------
export function PTRapor() {
  const { portalUser: u, talepler } = useStore();
  const k = talepler.filter((t) => yetki.talepGorur(u, t));
  const kapali = k.filter((t) => t.durum === 'Kapatıldı');
  const surede = kapali.filter((t) => sla(t).ok).length;
  const ort = kapali.length ? kapali.reduce((s, t) => s + (t.olaylar[t.olaylar.length - 1].at - t.olaylar[0].at), 0) / kapali.length : 0;
  const birimler = {};
  k.forEach((t) => {
    birimler[t.birim] = birimler[t.birim] || { acik: 0, kapali: 0 };
    birimler[t.birim][t.durum === 'Kapatıldı' ? 'kapali' : 'acik'] += 1;
  });
  const max = Math.max(1, ...Object.values(birimler).map((x) => x.acik + x.kapali));
  return (
    <Screen title="Raporlar" subtitle={belediyeAdi(u.tenant)}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {[[k.length, 'Toplam talep'], [k.length - kapali.length, 'Açık'], [kapali.length ? `%${Math.round((surede / kapali.length) * 100)}` : '—', 'Hedef sürede kapanan'], [kapali.length ? duration(0, ort) : '—', 'Ortalama çözüm']].map(([v, l]) => (
          <View key={l} style={{ width: '47%', flexGrow: 1, backgroundColor: C.card, borderRadius: 14, borderWidth: 1, borderColor: C.line, padding: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: C.text }}>{v}</Text>
            <Muted>{l}</Muted>
          </View>
        ))}
      </View>
      <Eyebrow>Birime göre talepler</Eyebrow>
      <Card>
        {Object.entries(birimler).map(([b, x]) => (
          <View key={b} style={{ gap: 4, marginBottom: 6 }}>
            <Row style={{ justifyContent: 'space-between' }}><T style={{ flex: 1 }}>{b}</T><Muted>{x.acik} açık · {x.kapali} kapalı</Muted></Row>
            <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, backgroundColor: C.bg2, overflow: 'hidden' }}>
              <View style={{ width: `${(x.kapali / max) * 100}%`, backgroundColor: C.blue }} />
              <View style={{ width: `${(x.acik / max) * 100}%`, backgroundColor: C.amber }} />
            </View>
          </View>
        ))}
        <Muted style={{ fontSize: 12 }}>Mavi: kapalı · Turuncu: açık</Muted>
      </Card>
      <Notice tone="blue" icon="mail-outline">Bu rapor her ayın ilk günü Belediye Başkanına e-posta ile özet olarak gönderilir.</Notice>
    </Screen>
  );
}

// ---------------- Platform yönetimi ----------------
export function PTPlatform() {
  const { talepler } = useStore();
  return (
    <Screen title="Belediyeler" subtitle="Meydan platform yönetimi">
      <Notice tone="blue" icon="shield-checkmark-outline">Platform yöneticisi yalnızca toplu sayıları görür; vatandaşların kişisel verilerine erişemez. Destek gerektiğinde belediyenin onayıyla süreli ve kayıtlı erişim açılır.</Notice>
      {BELEDIYELER.map((b) => {
        const acik = talepler.filter((t) => t.tenant === b.id && t.durum !== 'Kapatıldı').length;
        return (
          <Card key={b.id}>
            <Row style={{ justifyContent: 'space-between' }}><H3>{b.ad}</H3><Badge text={`${b.paket} paketi`} fg={C.blue} bg={C.blueSoft} /></Row>
            <Muted>{b.il} · {b.alanAdi}</Muted>
            <Row style={{ gap: 18 }}>
              <View><Text style={{ fontSize: 20, fontWeight: '800', color: C.text }}>{b.kullanici.toLocaleString('tr-TR')}</Text><Muted style={{ fontSize: 12 }}>Kayıtlı vatandaş</Muted></View>
              <View><Text style={{ fontSize: 20, fontWeight: '800', color: C.text }}>{b.esnaf}</Text><Muted style={{ fontSize: 12 }}>Esnaf</Muted></View>
              <View><Text style={{ fontSize: 20, fontWeight: '800', color: C.text }}>{acik}</Text><Muted style={{ fontSize: 12 }}>Açık talep</Muted></View>
            </Row>
            <Muted style={{ fontSize: 12 }}>Birim sayısı: {(BIRIMLER[b.id] || []).length} · Veriler ayrı tenant alanında tutulur</Muted>
          </Card>
        );
      })}
      <Btn title="Yeni belediye ekle" variant="outline" icon="add" onPress={() => {}} />
    </Screen>
  );
}

const p = StyleSheet.create({
  top: { backgroundColor: C.green, paddingHorizontal: 16, paddingBottom: 16, gap: 12 },
  eyebrow: { color: C.amber, fontSize: 12, fontWeight: '800', letterSpacing: 1.5 },
  title: { color: C.light, fontSize: 24, fontWeight: '800' },
  iconBtn: { padding: 8, borderRadius: 12, backgroundColor: C.green2 },
  user: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: C.green2, borderRadius: 16, padding: 12 },
  userName: { color: C.light, fontSize: 15, fontWeight: '800' },
  userSub: { color: C.lightMuted, fontSize: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { width: '47%', flexGrow: 1, backgroundColor: C.card, borderRadius: 18, borderWidth: 1, borderColor: C.line, padding: 14, gap: 4, minHeight: 116 },
  tileT: { fontSize: 16, fontWeight: '800', color: C.text, marginTop: 6 },
  tileS: { fontSize: 13, color: C.muted },
});
