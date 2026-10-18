import { useMemo, useState } from 'react';
import { View, Text, Pressable, TextInput, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { useStore } from '../store';
import { ISLETMELER } from '../data';
import { TAKVIM } from '../data_mvp';
import { aramaYap } from '../ai';
import { Screen, Card, Badge, Muted, H3, Btn, Row, Chips, Notice, Eyebrow, T, s as ui } from '../ui';
import { isOpen, relDay } from '../util';

const ONERILER = ['sigorta attı', 'kombi bakımı', 'nöbetçi eczane', 'su kesintisi', 'nikâh', 'emlak vergisi', 'kahvaltı'];

const bugunSaat = (b) => {
  const h = b.hours[new Date().getDay()];
  if (!h) return 'Bugün kapalı';
  if (h[0] === '00:00' && h[1] === '23:59') return '24 saat açık';
  return `Bugün ${h[0]}–${h[1]}`;
};

const HIZMET_HEDEF = {
  'İlçe Takvimi': ['TK_List', 'Takvimi aç'],
  'Sosyal Yardım Birimi': ['SY_New', 'Başvuru yap'],
  'Mali Hizmetler': ['OD_List', 'Ödemelerimi gör'],
};

export function SRScreen({ params }) {
  const { push, duyurular } = useStore();
  const [q, setQ] = useState(params?.q || '');
  const sonuc = useMemo(() => aramaYap(q, { isletmeler: ISLETMELER, duyurular: duyurular.filter((d) => d.tenant === 'gomec'), takvim: TAKVIM }), [q, duyurular]);

  return (
    <Screen title="Akıllı Arama" subtitle="Yapay zekâ destekli">
      <View style={[ui.input, { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4, borderColor: C.blue, borderWidth: 2 }]}>
        <Ionicons name="search-outline" size={20} color={C.blue} />
        <TextInput autoFocus value={q} onChangeText={setQ} placeholder="Neye ihtiyacınız var?" placeholderTextColor={C.faint}
          style={{ flex: 1, fontSize: 16, color: C.text, paddingVertical: 8 }} />
        {q ? <Pressable onPress={() => setQ('')} hitSlop={10}><Ionicons name="close-circle" size={20} color={C.faint} /></Pressable> : null}
      </View>
      {!sonuc ? (
        <>
          <Muted>Örnek aramalar</Muted>
          <Chips items={ONERILER} value={null} onChange={setQ} scroll={false} />
          <Notice tone="blue" icon="sparkles-outline">Gündelik dille yazabilirsiniz: “sigorta attı” yazarsanız elektrik ustalarını, “kombi” yazarsanız tesisatçıları getiririz.</Notice>
        </>
      ) : null}

      {sonuc?.yorum ? (
        <Card style={{ backgroundColor: C.amberSoft, borderColor: 'transparent' }}>
          <Row><Ionicons name="sparkles" size={18} color={C.amberDark} /><T style={{ flex: 1 }}>{sonuc.yorum}</T></Row>
        </Card>
      ) : null}

      {sonuc?.hiz.length ? <Eyebrow>Belediye hizmetleri</Eyebrow> : null}
      {sonuc?.hiz.map((h) => {
        const hedef = HIZMET_HEDEF[h.birim];
        return (
          <Card key={h.baslik}>
            <H3>{h.baslik}</H3>
            <Muted>{h.birim}</Muted>
            <T>{h.metin}</T>
            {hedef ? <Btn title={hedef[1]} variant="outline" onPress={() => push(hedef[0])} /> : null}
          </Card>
        );
      })}

      {sonuc?.isl.length ? <Eyebrow>İşletmeler · {sonuc.isl.length}</Eyebrow> : null}
      {sonuc?.isl.map((b) => {
        const acik = isOpen(b.hours);
        return (
          <Card key={b.id} onPress={() => push('ES_Detail', { id: b.id })}>
            <Row style={{ justifyContent: 'space-between' }}>
              <H3 style={{ flex: 1 }}>{b.ad}</H3>
              <Badge text={acik ? 'Açık' : 'Kapalı'} />
            </Row>
            <Muted>{b.tur} · {b.mahalle} · Usta/yetkili: {b.yetkili}</Muted>
            <Row style={{ justifyContent: 'space-between' }}>
              <View>
                <Muted>{bugunSaat(b)}</Muted>
                <Text selectable style={{ color: C.text, fontWeight: '700' }}>{b.tel}</Text>
              </View>
              <Pressable onPress={() => Linking.openURL(`tel:${b.tel.replace(/\s/g, '')}`)} style={{ flexDirection: 'row', gap: 4, alignItems: 'center', backgroundColor: C.blue, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
                <Ionicons name="call" size={14} color="#FFF" />
                <Text style={{ color: '#FFF', fontWeight: '800' }}>Ara</Text>
              </Pressable>
            </Row>
          </Card>
        );
      })}

      {sonuc?.tak.length ? <Eyebrow>İlçe takvimi</Eyebrow> : null}
      {sonuc?.tak.map((k) => (
        <Card key={k.id} onPress={() => push('TK_Detail', { id: k.id })}>
          <H3>{k.baslik}</H3>
          <Muted>{relDay(k.bas)} · {k.kaynak}</Muted>
        </Card>
      ))}

      {sonuc?.duy.length ? <Eyebrow>Belediye duyuruları</Eyebrow> : null}
      {sonuc?.duy.map((d) => (
        <Card key={d.id} onPress={() => push('DY_Detail', { id: d.id })}>
          <H3>{d.baslik}</H3>
          <Muted>{relDay(d.tarih)}</Muted>
        </Card>
      ))}

      {sonuc ? (
        <Card style={{ backgroundColor: C.blueSoft, borderColor: 'transparent' }}>
          <T style={{ fontWeight: '700' }}>{sonuc.bos ? 'Aradığınızı bulamadık.' : 'Aradığınızı bulamadınız mı?'}</T>
          <Muted>Talebinizi Beyaz Masa’ya yazın; ilgili birime iletelim.</Muted>
          <Btn title="Beyaz Masa’ya yaz" variant="outline" icon="chatbubbles-outline" onPress={() => push('BM_New', { metin: q })} />
        </Card>
      ) : null}
    </Screen>
  );
}
