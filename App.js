import { useEffect } from 'react';
import { View, BackHandler } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from './src/store';
import { Toast } from './src/ui';
import { C } from './src/theme';
import { LoginScreen, HomeScreen } from './src/screens/home';
import { BMList, BMNew, BMDetail } from './src/screens/beyazmasa';
import { SYList, SYNew, SYDetail } from './src/screens/yardim';
import { DYList, DYDetail, ILList, ILDetail, ILNew } from './src/screens/icerik';
import { ESList, ESDetail, ESNew } from './src/screens/esnaf';
import { ODList } from './src/screens/odeme';
import { TKList, TKDetail, TKBolge } from './src/screens/takvim';
import { SRScreen } from './src/screens/arama';
import { DKHome, DKForm } from './src/screens/dokuman';
import {
  PTHome, PTInbox, PTEmail, PTTalepler, PTTalepDetay, PTYardimlar, PTYardimDetay, PTOnay, PTDuyuru, PTRapor, PTPlatform,
} from './src/screens/portal';

const SCREENS = {
  Home: HomeScreen,
  BM_List: BMList, BM_New: BMNew, BM_Detail: BMDetail,
  SY_List: SYList, SY_New: SYNew, SY_Detail: SYDetail,
  DY_List: DYList, DY_Detail: DYDetail,
  IL_List: ILList, IL_Detail: ILDetail, IL_New: ILNew,
  ES_List: ESList, ES_Detail: ESDetail, ES_New: ESNew,
  OD_List: ODList,
  TK_List: TKList, TK_Detail: TKDetail, TK_Bolge: TKBolge,
  SR: SRScreen,
  DK_Home: DKHome, DK_Form: DKForm,
};

const PORTAL = {
  Home: PTHome,
  PT_Inbox: PTInbox, PT_Email: PTEmail, PT_Talepler: PTTalepler, PT_TalepDetay: PTTalepDetay,
  PT_Yardimlar: PTYardimlar, PT_YardimDetay: PTYardimDetay, PT_Onay: PTOnay, PT_Duyuru: PTDuyuru,
  PT_Rapor: PTRapor, PT_Platform: PTPlatform,
};

function Router() {
  const { hesap, stack, pop } = useStore();

  // Android geri tuşu: yığında ekran varsa bir önceki ekrana döner
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (hesap && stack.length > 1) {
        pop();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [hesap, stack.length, pop]);

  if (!hesap) return (<><StatusBar style="light" /><LoginScreen /></>);
  const top = stack[stack.length - 1];
  const map = hesap === 'portal' ? PORTAL : SCREENS;
  const Comp = map[top.name] || map.Home;
  return (
    <>
      <StatusBar style={top.name === 'Home' ? 'light' : 'dark'} />
      <Comp key={`${stack.length}-${top.name}-${JSON.stringify(top.params)}`} params={top.params} />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <View style={{ flex: 1, backgroundColor: C.bg }}>
          <Router />
          <Toast />
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
