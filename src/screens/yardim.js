import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../theme';
import { useStore } from '../store';
import { YARDIM_TURLERI } from '../data';
import { Screen, Card, Badge, Muted, H3, Btn, Row, Field, Label, Notice, Timeline, Eyebrow, T, Empty } from '../ui';
import { fmt, fmtShort, duration, newId } from '../util';

export function SYList() {
  const { yardimlar: tum, push } = useStore();
  const yardimlar = tum.filter((y) => y.sahip === 'ben');
  return (
    <Screen title="Sosyal Yardım" subtitle="Başvurularım" footer={<Btn title="Yeni başvuru" icon="add-circle-outline" onPress={() => push('SY_New')} />}>
      <Notice tone="blue" icon="lock-closed-outline">Başvurularınızı yalnızca Sosyal Yardım Birimi’nin yetkili personeli görüntüleyebilir.</Notice>
      {yardimlar.length === 0 ? <Empty text="Henüz başvurunuz yok." /> : null}
      {yardimlar.map((y) => {
        const acilis = y.olaylar[0].at;
        const hedef = new Date(acilis.getTime() + y.hedefGun * 86400000);
        const bitti = ['Onaylandı', 'Sonuçlandı', 'Reddedildi'].includes(y.durum);
        return (
          <Card key={y.id} onPress={() => push('SY_Detail', { id: y.id })} highlight={y.durum === 'Eksik belge'}>
            <Row style={{ justifyContent: 'space-between' }}>
              <H3>{y.tur}</H3>
              <Badge text={y.durum} />
            </Row>
            <Muted>Başvuru: {fmtShort(acilis)} · No: {y.id}</Muted>
            {bitti ? (
              <Muted>{duration(acilis, y.olaylar[y.olaylar.length - 1].at)} içinde sonuçlandı</Muted>
            ) : (
              <Muted>Hedef sonuç tarihi: {fmtShort(hedef)}</Muted>
            )}
            {y.durum === 'Eksik belge' ? <Text style={{ color: C.red, fontWeight: '700' }}>Eksik: {y.eksik}</Text> : null}
          </Card>
        );
      })}
    </Screen>
  );
}

export function SYDetail({ params }) {
  const { yardimlar, setYardimlar, showToast } = useStore();
  const y = yardimlar.find((x) => x.id === params.id);
  if (!y) return <Screen title="Başvuru"><Empty text="Başvuru bulunamadı." /></Screen>;
  const acilis = y.olaylar[0].at;
  const bitti = ['Onaylandı', 'Sonuçlandı', 'Reddedildi'].includes(y.durum);
  const pending = bitti ? [] : y.durum === 'Eksik belge' ? ['Belge tamamlanması', 'Değerlendirme', 'Sonuç'] : ['Değerlendirme', 'Sonuç'];

  const belgeYukle = () => {
    setYardimlar((l) => l.map((x) => x.id !== y.id ? x : {
      ...x, durum: 'İncelemede', eksik: null,
      olaylar: [...x.olaylar, { label: 'Eksik belge yüklendi', at: new Date() }],
    }));
    showToast('Belge yüklendi, başvurunuz yeniden incelemeye alındı');
  };

  return (
    <Screen title={y.tur} subtitle={`Başvuru no: ${y.id}`}>
      <Row style={{ justifyContent: 'space-between' }}>
        <Badge text={y.durum} />
        <Muted>Hane: {y.hane} kişi</Muted>
      </Row>
      {y.durum === 'Eksik belge' ? (
        <Card style={{ backgroundColor: C.redSoft, borderColor: 'transparent' }}>
          <Row><Ionicons name="alert-circle-outline" size={20} color={C.red} /><H3 style={{ color: C.red }}>Eksik belge istendi</H3></Row>
          <T>{y.eksik}</T>
          <Btn title="Belgeyi yükle" icon="cloud-upload-outline" onPress={belgeYukle} />
        </Card>
      ) : null}
      <Card style={{ backgroundColor: C.blueSoft, borderColor: 'transparent' }}>
        <Row><Ionicons name="timer-outline" size={20} color={C.blue} /><H3>Süre takibi</H3></Row>
        <Muted>Başvuru: {fmt(acilis)}</Muted>
        <Muted>Hedef sonuçlanma süresi: {y.hedefGun} gün</Muted>
        {bitti ? <Muted>Sonuçlanma: {duration(acilis, y.olaylar[y.olaylar.length - 1].at)}</Muted> : <Muted>Geçen süre: {duration(acilis, new Date())}</Muted>}
      </Card>
      {y.sonuc ? (
        <Card style={{ backgroundColor: C.okSoft, borderColor: 'transparent' }}>
          <Text style={{ color: C.ok, fontWeight: '800' }}>Belediye açıklaması</Text>
          <T>{y.sonuc}</T>
        </Card>
      ) : null}
      <Eyebrow>Süreç</Eyebrow>
      <Card><Timeline items={y.olaylar} pending={pending} /></Card>
      <Eyebrow>Başvuru açıklaması</Eyebrow>
      <Card><T>{y.aciklama}</T></Card>
    </Screen>
  );
}

const TUR_ID = { 'Gıda': 'gida', 'Yakacak': 'yakacak', 'Eğitim': 'egitim', 'Evde bakım': 'evde-bakim' };

export function SYNew({ params }) {
  const { setYardimlar, pop, push, replace, showToast } = useStore();
  const onTur = params?.turAdi ? YARDIM_TURLERI.find((t) => t.id === TUR_ID[params.turAdi]) : null;
  const [adim, setAdim] = useState(onTur ? 2 : 1);
  const [tur, setTur] = useState(onTur);
  const [hane, setHane] = useState(params?.hane || '4');
  const [gelir, setGelir] = useState('');
  const [aciklama, setAciklama] = useState(params?.metin || '');
  const [yuklenen, setYuklenen] = useState({});
  const [riza, setRiza] = useState(false);

  const belgeler = tur ? tur.belgeler : [];
  const tumBelgeler = belgeler.every((b) => yuklenen[b]);
  const gecerli = adim === 1 ? !!tur : adim === 2 ? hane && aciklama.trim().length > 5 : adim === 3 ? tumBelgeler : riza;

  const gonder = () => {
    const id = 'Y-' + newId();
    setYardimlar((l) => [{
      id, tenant: 'gomec', sahip: 'ben', basvuran: 'A*** D***', turId: tur.id, tur: tur.ad, durum: 'Alındı', hane: Number(hane) || 1, hedefGun: 21, aciklama,
      olaylar: [{ label: 'Başvuru alındı', at: new Date() }],
    }, ...l]);
    pop();
    push('SY_Detail', { id });
    showToast('Başvurunuz alındı');
  };

  const footer = (
    <Row>
      {adim > 1 ? <Btn title="Geri" variant="outline" onPress={() => setAdim(adim - 1)} style={{ flex: 1 }} /> : null}
      <Btn title={adim < 4 ? 'Devam' : 'Başvuruyu gönder'} disabled={!gecerli} onPress={adim < 4 ? () => setAdim(adim + 1) : gonder} style={{ flex: 2 }} />
    </Row>
  );

  return (
    <Screen title="Yardım başvurusu" subtitle={`Adım ${adim} / 4`} footer={footer}>
      <View style={{ flexDirection: 'row', gap: 6 }}>
        {[1, 2, 3, 4].map((i) => <View key={i} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: i <= adim ? C.blue : C.line2 }} />)}
      </View>

      {adim === 1 ? (
        <>
          <H3>Yardım türünü seçin</H3>
          {YARDIM_TURLERI.map((t) => (
            <Card key={t.id} onPress={() => { setTur(t); setYuklenen({}); }} highlight={tur?.id === t.id}>
              <Row style={{ justifyContent: 'space-between' }}>
                <H3>{t.ad}</H3>
                <Ionicons name={tur?.id === t.id ? 'radio-button-on' : 'radio-button-off'} size={22} color={C.blue} />
              </Row>
              <Muted>{t.aciklama}</Muted>
            </Card>
          ))}
        </>
      ) : null}

      {adim === 2 ? (
        <>
          <H3>Hane bilgileri</H3>
          <Field label="Hanede yaşayan kişi sayısı" value={hane} onChangeText={setHane} keyboardType="number-pad" />
          <Field label="Hanenin aylık toplam geliri (isteğe bağlı)" value={gelir} onChangeText={setGelir} keyboardType="number-pad" placeholder="₺" />
          <Field label="Açıklama" multiline value={aciklama} onChangeText={setAciklama} placeholder="İhtiyacınızı kısaca anlatın." />
          <Btn title="Açıklamayı yapay zekâ ile yaz" variant="outline" icon="sparkles-outline" onPress={() => replace('DK_Form', { tur: 'yardim', donus: 'SY_New', onDeger: { tur: Object.keys(TUR_ID).find((k) => TUR_ID[k] === tur?.id), hane } })} />
        </>
      ) : null}

      {adim === 3 ? (
        <>
          <H3>Gerekli belgeler</H3>
          <Muted>{tur.ad} için aşağıdaki belgeler istenmektedir. e-Devlet belgeleri barkodlu PDF olarak yüklenebilir.</Muted>
          {belgeler.map((b) => (
            <Card key={b}>
              <Row>
                <Ionicons name={yuklenen[b] ? 'checkmark-circle' : 'document-outline'} size={22} color={yuklenen[b] ? C.ok : C.faint} />
                <T style={{ flex: 1 }}>{b}</T>
                <Pressable onPress={() => setYuklenen({ ...yuklenen, [b]: !yuklenen[b] })}>
                  <Text style={{ color: C.blue, fontWeight: '800' }}>{yuklenen[b] ? 'Kaldır' : 'Yükle'}</Text>
                </Pressable>
              </Row>
            </Card>
          ))}
          <Muted>{Object.values(yuklenen).filter(Boolean).length} / {belgeler.length} belge yüklendi</Muted>
        </>
      ) : null}

      {adim === 4 ? (
        <>
          <H3>Özet ve onay</H3>
          <Card>
            <Muted>Yardım türü</Muted><T style={{ fontWeight: '700' }}>{tur.ad}</T>
            <Muted>Hane</Muted><T>{hane} kişi</T>
            <Muted>Açıklama</Muted><T>{aciklama}</T>
            <Muted>Belgeler</Muted><T>{belgeler.length} belge yüklendi</T>
          </Card>
          <Pressable onPress={() => setRiza(!riza)}>
            <Card highlight={riza}>
              <Row>
                <Ionicons name={riza ? 'checkbox' : 'square-outline'} size={24} color={C.blue} />
                <T style={{ flex: 1 }}>Kişisel verilerimin sosyal yardım başvurusunun değerlendirilmesi amacıyla işlenmesine ilişkin aydınlatma metnini okudum, açık rıza veriyorum.</T>
              </Row>
            </Card>
          </Pressable>
          <Notice tone="blue" icon="information-circle-outline">Hedef sonuçlanma süresi 21 gündür. Durum değişikliklerinde bildirim alırsınız.</Notice>
        </>
      ) : null}
    </Screen>
  );
}
