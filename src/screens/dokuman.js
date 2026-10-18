import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { useStore } from '../store';
import { DOKUMAN_TURLERI } from '../data_mvp';
import { DOKUMAN_ALANLARI, dokumanUret } from '../ai';
import { Screen, Card, Muted, H3, Btn, Row, Chips, Field, Label, Notice, Eyebrow, T } from '../ui';

export function DKHome() {
  const { push, hesap } = useStore();
  const turler = DOKUMAN_TURLERI.filter((t) => t.kim.includes(hesap));
  return (
    <Screen title="Yapay zekâ ile yaz" subtitle="Doküman oluşturma">
      <Notice tone="blue" icon="sparkles-outline">Ne yazmak istediğinizi seçin, birkaç bilgi girin; metni yapay zekâ hazırlasın. Metni gönderimden önce dilediğiniz gibi düzenleyebilirsiniz.</Notice>
      {turler.map((t) => (
        <Card key={t.id} onPress={() => push('DK_Form', { tur: t.id })}>
          <Row>
            <Ionicons name={t.icon} size={24} color={C.blue} />
            <View style={{ flex: 1 }}>
              <H3>{t.ad}</H3>
              <Muted>{t.aciklama}</Muted>
            </View>
            <Ionicons name="chevron-forward" size={20} color={C.faint} />
          </Row>
        </Card>
      ))}
      <Muted style={{ fontSize: 13 }}>Metinler Türkiye’deki sunucularda işlenir. Kişisel veriler (T.C. kimlik no, IBAN, telefon) metne eklenmez.</Muted>
    </Screen>
  );
}

const HEDEF = { dilekce: 'BM_New', yardim: 'SY_New', vefat: 'IL_New', davet: 'IL_New', satilik: 'IL_New', paylasim: 'ES_New' };

export function DKForm({ params }) {
  const { replace } = useStore();
  const tur = params.tur;
  const meta = DOKUMAN_TURLERI.find((t) => t.id === tur);
  const alanlar = DOKUMAN_ALANLARI[tur] || [];
  const [deger, setDeger] = useState(() => ({ ...Object.fromEntries(alanlar.filter((a) => a.tip === 'secim').map((a) => [a.k, a.secenekler[0]])), ...(params.onDeger || {}) }));
  const [sonuc, setSonuc] = useState(null);
  const [metin, setMetin] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);
  const [v, setV] = useState(0);

  const olustur = (varyant) => {
    setYukleniyor(true);
    setTimeout(() => {
      const r = dokumanUret(tur, deger, varyant);
      setSonuc(r);
      setMetin(r.metin);
      setYukleniyor(false);
    }, 1000);
  };

  const kullan = () => {
    const hedef = HEDEF[tur];
    const p = {
      BM_New: { metin },
      SY_New: { metin, turAdi: deger.tur, hane: deger.hane },
      IL_New: { metin, baslik: sonuc.baslik, kategori: sonuc.kategori || (tur === 'vefat' ? 'Vefat' : 'Hayır'), fiyat: sonuc.fiyat },
      ES_New: { metin, baslik: sonuc.baslik, tur: sonuc.tur },
    }[hedef];
    replace(hedef, p);
  };

  const bos = !alanlar.filter((a) => !a.tip).some((a) => (deger[a.k] || '').trim());

  return (
    <Screen title={meta?.ad || 'Doküman'} subtitle="Yapay zekâ ile yaz"
      footer={sonuc ? (
        <Row>
          <Btn title="Yeniden yaz" variant="outline" icon="refresh" onPress={() => { setV(v + 1); olustur(v + 1); }} style={{ flex: 1 }} />
          <Btn title="Bu metni kullan" icon="checkmark" onPress={kullan} style={{ flex: 1 }} />
        </Row>
      ) : <Btn title={yukleniyor ? 'Yazılıyor…' : 'Metni oluştur'} icon="sparkles" disabled={bos || yukleniyor} onPress={() => olustur(v)} />}>
      {alanlar.map((a) => a.tip === 'secim' ? (
        <View key={a.k} style={{ gap: 6 }}>
          <Label>{a.l}</Label>
          <Chips items={a.secenekler} value={deger[a.k]} onChange={(x) => setDeger({ ...deger, [a.k]: x })} scroll={false} />
        </View>
      ) : (
        <Field key={a.k} label={a.l} value={deger[a.k] || ''} onChangeText={(x) => setDeger({ ...deger, [a.k]: x })}
          placeholder={a.ph} multiline={!!a.cok} keyboardType={a.sayi ? 'number-pad' : 'default'} />
      ))}
      {yukleniyor ? <Notice tone="blue" icon="sparkles-outline">Metniniz hazırlanıyor…</Notice> : null}
      {sonuc && !yukleniyor ? (
        <>
          <Eyebrow>Önerilen metin</Eyebrow>
          {sonuc.baslik ? <Card style={{ backgroundColor: C.blueSoft, borderColor: 'transparent' }}><Muted>Başlık</Muted><T style={{ fontWeight: '800' }}>{sonuc.baslik}</T></Card> : null}
          <Field multiline value={metin} onChangeText={setMetin} />
          <Muted style={{ fontSize: 13 }}>Metni düzenleyebilir, “Yeniden yaz” ile farklı bir öneri alabilirsiniz.</Muted>
        </>
      ) : null}
    </Screen>
  );
}
