import { useState } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { useStore } from '../store';
import { KULLANICILAR } from '../data';
import { Screen, Card, Badge, Muted, H3, Btn, Row, Chips, Notice, Eyebrow, T } from '../ui';
import { dayDiff, fmtShort, money } from '../util';

export function ODList() {
  const { hesap, odemeler, setOdemeler, showToast } = useStore();
  const [sekme, setSekme] = useState('Bekleyen');
  const [onay, setOnay] = useState(null);
  const liste = odemeler[hesap];
  const bekleyen = liste.filter((o) => o.durum !== 'Ödendi').sort((a, b) => a.sonGun - b.sonGun);
  const odenen = liste.filter((o) => o.durum === 'Ödendi');
  const toplam = bekleyen.reduce((t, o) => t + o.tutar, 0);
  const gosterilen = sekme === 'Bekleyen' ? bekleyen : odenen;

  const odendiSay = (o) => {
    setOdemeler((all) => ({ ...all, [hesap]: all[hesap].map((x) => x.id === o.id ? { ...x, durum: 'Ödendi', odeme: new Date() } : x) }));
    setOnay(null);
    showToast('Ödeme alındı · makbuz e-posta adresinize gönderildi');
  };

  return (
    <Screen title={hesap === 'kurumsal' ? 'Ödeme Yönlendirme' : 'Ödeme Hatırlatmaları'} subtitle={KULLANICILAR[hesap].ad}>
      <Card style={{ backgroundColor: C.green, borderColor: C.green }}>
        <Text style={{ color: C.lightMuted, fontSize: 13, fontWeight: '700' }}>BEKLEYEN TOPLAM</Text>
        <Text style={{ color: C.light, fontSize: 30, fontWeight: '800' }}>{money(toplam)}</Text>
        <Text style={{ color: C.lightMuted, fontSize: 13 }}>{bekleyen.length} kalem · bilgiler belediye kayıtlarından alınır</Text>
      </Card>
      <Chips items={['Bekleyen', 'Ödenen']} value={sekme} onChange={setSekme} />
      {gosterilen.map((o) => {
        const kalan = dayDiff(o.sonGun);
        const gecikmis = o.durum !== 'Ödendi' && kalan < 0;
        const yakin = o.durum !== 'Ödendi' && kalan >= 0 && kalan <= 14;
        const etiket = o.durum === 'Ödendi' ? 'Ödendi' : gecikmis ? 'Gecikmiş' : yakin ? 'Yaklaşıyor' : 'Bekliyor';
        return (
          <Card key={o.id} highlight={gecikmis}>
            <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <H3 style={{ flex: 1 }}>{o.kalem}</H3>
              <Badge text={etiket} />
            </Row>
            <Muted>{o.aciklama}</Muted>
            <Row style={{ justifyContent: 'space-between' }}>
              <View>
                {o.durum === 'Ödendi' ? (
                  <Muted>Ödeme: {fmtShort(o.odeme)}</Muted>
                ) : (
                  <Text style={{ fontWeight: '700', color: gecikmis ? C.red : yakin ? C.amberDark : C.muted }}>
                    Son gün {fmtShort(o.sonGun)} · {gecikmis ? `${-kalan} gün gecikti` : kalan === 0 ? 'bugün' : `${kalan} gün kaldı`}
                  </Text>
                )}
              </View>
              <Text style={{ fontSize: 18, fontWeight: '800', color: C.text }}>{money(o.tutar)}</Text>
            </Row>
            {o.durum !== 'Ödendi' && onay !== o.id ? <Btn title="Ödeme sayfasına git" icon="open-outline" onPress={() => setOnay(o.id)} /> : null}
            {onay === o.id ? (
              <View style={{ backgroundColor: C.blueSoft, borderRadius: 12, padding: 12, gap: 8 }}>
                <H3>Belediye ödeme sayfası</H3>
                <Muted>Gerçek uygulamada belediyenin mevcut ödeme sayfası açılır; kart bilgileri Meydan üzerinden geçmez.</Muted>
                <Row>
                  <Btn title="Vazgeç" variant="outline" onPress={() => setOnay(null)} style={{ flex: 1 }} />
                  <Btn title="Demo: ödendi say" onPress={() => odendiSay(o)} style={{ flex: 1 }} />
                </Row>
              </View>
            ) : null}
          </Card>
        );
      })}
      <Notice tone="blue" icon="notifications-outline">Son ödeme tarihinden 7 gün ve 1 gün önce hatırlatma bildirimi gönderilir.</Notice>
    </Screen>
  );
}
