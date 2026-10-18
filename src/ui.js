import { View, Text, Pressable, ScrollView, TextInput, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { C, STATUS } from './theme';
import { fmt } from './util';
import { useStore } from './store';

export function Screen({ title, subtitle, children, footer, right, scroll = true, dark = false, back = true }) {
  const insets = useSafeAreaInsets();
  const { pop } = useStore();
  const Body = scroll ? ScrollView : View;
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: C.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[s.header, { paddingTop: insets.top + 10, backgroundColor: dark ? C.green : C.bg }]}>
        {back ? (
          <Pressable onPress={pop} hitSlop={12} style={s.backBtn} accessibilityLabel="Geri">
            <Ionicons name="chevron-back" size={26} color={dark ? C.light : C.text} />
          </Pressable>
        ) : null}
        <View style={{ flex: 1 }}>
          <Text style={[s.hTitle, dark && { color: C.light }]} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={[s.hSub, dark && { color: C.lightMuted }]} numberOfLines={1}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
      <Body style={{ flex: 1 }} contentContainerStyle={scroll ? { padding: 16, paddingBottom: 32, gap: 12 } : undefined} keyboardShouldPersistTaps="handled">
        {children}
      </Body>
      {footer ? <View style={[s.footer, { paddingBottom: insets.bottom + 12 }]}>{footer}</View> : <View style={{ height: insets.bottom }} />}
    </KeyboardAvoidingView>
  );
}

export function Card({ children, onPress, style, highlight }) {
  const inner = <View style={[s.card, highlight && { borderColor: C.blue, borderWidth: 2 }, style]}>{children}</View>;
  if (!onPress) return inner;
  return <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.75 : 1 }]}>{inner}</Pressable>;
}

export function T({ children, style, ...rest }) {
  return <Text style={[s.t, style]} {...rest}>{children}</Text>;
}
export const H2 = ({ children, style }) => <Text style={[s.h2, style]}>{children}</Text>;
export const H3 = ({ children, style, ...rest }) => <Text style={[s.h3, style]} {...rest}>{children}</Text>;
export const Muted = ({ children, style, ...rest }) => <Text style={[s.muted, style]} {...rest}>{children}</Text>;
export const Eyebrow = ({ children, style }) => <Text style={[s.eyebrow, style]}>{children}</Text>;

export function Badge({ text, fg, bg, style }) {
  const st = STATUS[text] || {};
  return (
    <View style={[s.badge, { backgroundColor: bg || st.bg || C.bg2 }, style]}>
      <Text style={[s.badgeT, { color: fg || st.fg || C.text }]}>{text}</Text>
    </View>
  );
}

export function Chip({ label, active, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, active && s.chipOn]}>
      <Text style={[s.chipT, active && { color: C.light, fontWeight: '800' }]}>{label}</Text>
    </Pressable>
  );
}

export function Chips({ items, value, onChange, scroll = true }) {
  const content = items.map((it) => <Chip key={it} label={it} active={value === it} onPress={() => onChange(it)} />);
  if (!scroll) return <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{content}</View>;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 8 }} style={{ flexGrow: 0 }}>
      {content}
    </ScrollView>
  );
}

export function Btn({ title, onPress, variant = 'primary', disabled, icon, style }) {
  const v = variant === 'primary' ? s.btnP : variant === 'outline' ? s.btnO : variant === 'dark' ? s.btnD : s.btnG;
  const color = variant === 'primary' || variant === 'dark' ? '#FBFAF6' : C.blue;
  return (
    <Pressable onPress={disabled ? undefined : onPress} style={({ pressed }) => [s.btn, v, disabled && { backgroundColor: '#B4ADA0', borderColor: '#B4ADA0' }, pressed && !disabled && { opacity: 0.8 }, style]}>
      {icon ? <Ionicons name={icon} size={20} color={disabled ? '#FBFAF6' : color} /> : null}
      <Text style={[s.btnT, { color: disabled ? '#FBFAF6' : color }]}>{title}</Text>
    </Pressable>
  );
}

export function Field({ label, hint, ...props }) {
  return (
    <View style={{ gap: 6 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={C.faint}
        style={[s.input, props.multiline && { minHeight: 110, textAlignVertical: 'top' }]}
        {...props}
      />
      {hint ? <Muted style={{ fontSize: 13 }}>{hint}</Muted> : null}
    </View>
  );
}

export function Label({ children }) {
  return <Text style={s.label}>{children}</Text>;
}

export function Row({ children, style }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 10 }, style]}>{children}</View>;
}

export function Notice({ icon = 'information-circle-outline', children, tone = 'amber' }) {
  const tones = {
    amber: { bg: C.amberSoft, fg: C.amberDark },
    blue: { bg: C.blueSoft, fg: C.blue },
    red: { bg: C.redSoft, fg: C.red },
    green: { bg: C.okSoft, fg: C.ok },
  }[tone];
  return (
    <View style={[s.notice, { backgroundColor: tones.bg }]}>
      <Ionicons name={icon} size={20} color={tones.fg} style={{ marginTop: 1 }} />
      <Text style={[s.t, { flex: 1, color: C.text }]}>{children}</Text>
    </View>
  );
}

export function Timeline({ items, pending = [] }) {
  const all = [...items.map((i) => ({ ...i, done: true })), ...pending.map((p) => ({ label: p, done: false }))];
  return (
    <View>
      {all.map((it, idx) => (
        <View key={idx} style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ alignItems: 'center', width: 22 }}>
            <Ionicons name={it.done ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={it.done ? C.blue : '#B4ADA0'} />
            {idx < all.length - 1 ? <View style={{ width: 2, flex: 1, minHeight: 18, backgroundColor: it.done ? C.blue : C.line2 }} /> : null}
          </View>
          <View style={{ flex: 1, paddingBottom: 14 }}>
            <Text style={[s.t, { fontWeight: '700', color: it.done ? C.text : C.faint }]}>{it.label}</Text>
            {it.at ? <Muted>{fmt(it.at)}</Muted> : <Muted>Bekleniyor</Muted>}
          </View>
        </View>
      ))}
    </View>
  );
}

export function Empty({ text, icon = 'file-tray-outline' }) {
  return (
    <View style={{ alignItems: 'center', padding: 32, gap: 8 }}>
      <Ionicons name={icon} size={36} color={C.faint} />
      <Muted style={{ textAlign: 'center' }}>{text}</Muted>
    </View>
  );
}

export function Toast() {
  const { toast } = useStore();
  const insets = useSafeAreaInsets();
  if (!toast) return null;
  return (
    <View pointerEvents="none" style={[s.toast, { bottom: insets.bottom + 90 }]}>
      <Ionicons name="checkmark-circle" size={20} color={C.amber} />
      <Text style={{ color: C.light, fontSize: 15, flex: 1 }}>{toast}</Text>
    </View>
  );
}

export const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingBottom: 10, gap: 6, borderBottomWidth: 1, borderBottomColor: C.line },
  backBtn: { padding: 4 },
  hTitle: { fontSize: 20, fontWeight: '800', color: C.text },
  hSub: { fontSize: 13, color: C.faint },
  footer: { paddingHorizontal: 16, paddingTop: 12, backgroundColor: C.bg, borderTopWidth: 1, borderTopColor: C.line, gap: 8 },
  card: { backgroundColor: C.card, borderRadius: 16, borderWidth: 1, borderColor: C.line, padding: 14, gap: 6 },
  t: { fontSize: 15, color: C.text, lineHeight: 21 },
  h2: { fontSize: 22, fontWeight: '800', color: C.text },
  h3: { fontSize: 16, fontWeight: '800', color: C.text },
  muted: { fontSize: 14, color: C.muted, lineHeight: 20 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.5, color: C.amberDark, textTransform: 'uppercase', marginTop: 6 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3 },
  badgeT: { fontSize: 12, fontWeight: '800' },
  chip: { borderWidth: 1, borderColor: C.line2, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, backgroundColor: C.card },
  chipOn: { backgroundColor: C.green, borderColor: C.green },
  chipT: { fontSize: 14, color: C.text },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 14, paddingVertical: 13, paddingHorizontal: 16, borderWidth: 2 },
  btnP: { backgroundColor: C.blue, borderColor: C.blue },
  btnD: { backgroundColor: C.green, borderColor: C.green },
  btnO: { backgroundColor: 'transparent', borderColor: C.blue },
  btnG: { backgroundColor: 'transparent', borderColor: 'transparent' },
  btnT: { fontSize: 16, fontWeight: '800' },
  label: { fontSize: 14, fontWeight: '700', color: C.text },
  input: { backgroundColor: C.card, borderWidth: 1, borderColor: C.line2, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, color: C.text },
  notice: { flexDirection: 'row', gap: 10, borderRadius: 12, padding: 12, alignItems: 'flex-start' },
  toast: { position: 'absolute', left: 16, right: 16, backgroundColor: C.green, borderRadius: 14, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10, elevation: 6 },
});
