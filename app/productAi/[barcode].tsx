import { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  Keyboard, ActivityIndicator, ScrollView, Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { sendMessage, ChatMessage, ProductContext } from '../../services/aiAssistant';
import { fetchProductByBarcode, parseIngredientsList } from '../../services/openFoodFacts';
import { HAS_GEMINI_API_KEY } from '../../constants/config';
import { findIngredientOrigin } from '../../constants/ingredientOrigins';
import { getTraceability, getBarcodeFromLot } from '../../services/traceabilityService';
import { ProductAiHeader } from '../../components/organisms/ProductAiHeader';
import { ChatBubble } from '../../components/molecules/ChatBubble';
import { SuggestionChips } from '../../components/molecules/SuggestionChips';
import styles from '../../styles/productAi.styles';

const STORAGE_PREFIX = '@product_ai_chat_';

const PRODUCT_SUGGESTIONS = [
  'Ist das Produkt gesund? 🥗',
  'Wie nachhaltig ist es? 🌍',
  'Woher kommen die Hauptzutaten? 🚜',
  'Was bedeutet der CO₂-Score? ☁️',
  'Gibt es gesündere Alternativen? ✨',
  'Bedankliche Inhaltsstoffe? ⚠️',
];

interface Message extends ChatMessage {
  id: string;
  isLoading?: boolean;
}

export default function ProductAiScreen() {
  const {
    barcode: id, isLot, ean, name, brand, image,
    nutriscore, ecoscore, carbon, carbonGrade, origins, manufacturing,
  } = useLocalSearchParams<{
    barcode: string; isLot?: string; ean?: string;
    name: string; brand?: string; image?: string;
    nutriscore?: string; ecoscore?: string;
    carbon?: string; carbonGrade?: string;
    origins?: string; manufacturing?: string;
  }>();

  const barcode = isLot === 'true' ? ean || getBarcodeFromLot(id) || id : id;
  const lotNumber = isLot === 'true' ? id : undefined;

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState<ProductContext | null>(null);
  const [inputHeight, setInputHeight] = useState(44);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => setKeyboardHeight(e.endCoordinates.height));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  useEffect(() => {
    if (!barcode) return;
    const loadChat = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_PREFIX + barcode);
        setMessages(saved ? JSON.parse(saved) : [{
          id: 'welcome', role: 'assistant',
          content: `Hallo! Ich bin dein Root Route-Experte. Ich habe alle Infos zu **${name || 'diesem Produkt'}** geladen. Was möchtest du wissen? 🔍`,
        }]);
      } catch { }
    };
    loadChat();

    const ctx: ProductContext = {
      name: name || 'Unbekanntes Produkt', brand, nutriscore, ecoscore,
      carbonCO2: carbon ? Number(carbon) : undefined, carbonGrade, manufacturing,
      origins: origins ? JSON.parse(origins) : [],
    };
    setContext(ctx);

    const traceability = lotNumber ? getTraceability(lotNumber) : null;
    fetchProductByBarcode(barcode).then((result) => {
      if (result.found && result.product) {
        const ings = parseIngredientsList(result.product);
        const ingsWithOrigins = ings.map(ing => {
          const origin = findIngredientOrigin(ing);
          return origin ? `${ing} (aus ${origin.countries.map(c => c.name).join(', ')})` : ing;
        });
        setContext((prev) => prev ? {
          ...prev, ingredients: ingsWithOrigins, lotNumber,
          manufacturing: traceability?.origin || prev.manufacturing,
        } : prev);
      }
    });
  }, [barcode, lotNumber]);

  const saveChat = useCallback(async (msgs: Message[]) => {
    if (!barcode) return;
    try { await AsyncStorage.setItem(STORAGE_PREFIX + barcode, JSON.stringify(msgs)); } catch { }
  }, [barcode]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || loading) return;
    setInput('');
    setInputHeight(44);

    const newMsgs: Message[] = [
      ...messages,
      { id: Date.now().toString(), role: 'user', content: messageText },
      { id: 'loading', role: 'assistant', content: '', isLoading: true },
    ];
    setMessages(newMsgs);
    setLoading(true);
    scrollToBottom();

    try {
      const history: ChatMessage[] = messages
        .filter((m) => !m.isLoading && m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));
      const reply = await sendMessage(history, messageText, context ?? undefined);
      const finalMsgs: Message[] = [
        ...newMsgs.filter((m) => m.id !== 'loading'),
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply },
      ];
      setMessages(finalMsgs);
      saveChat(finalMsgs);
    } catch (err: any) {
      const errText = err?.status === 401 || err?.status === 403 || err?.message?.includes('API key')
        ? 'Gemini API-Key ungueltig oder gesperrt. Bitte setze EXPO_PUBLIC_GEMINI_API_KEY in .env.'
        : `Fehler: ${err?.message || 'Bitte Internetverbindung prüfen.'}`;
      const finalMsgs: Message[] = [
        ...newMsgs.filter((m) => m.id !== 'loading'),
        { id: (Date.now() + 1).toString(), role: 'assistant', content: errText },
      ];
      setMessages(finalMsgs);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, [input, loading, messages, context, scrollToBottom, saveChat]);

  const handleClear = useCallback(() => {
    Alert.alert('Chat löschen?', 'Möchtest du den gesamten Gesprächsverlauf für dieses Produkt löschen?', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen', style: 'destructive',
        onPress: async () => {
          setMessages([{ id: 'welcome', role: 'assistant', content: `Ich habe den Verlauf gelöscht. Wie kann ich dir noch zu **${name || 'diesem Produkt'}** helfen? 🔍` }]);
          if (barcode) await AsyncStorage.removeItem(STORAGE_PREFIX + barcode);
        },
      },
    ]);
  }, [name, barcode]);

  if (!HAS_GEMINI_API_KEY) {
    return (
      <View style={styles.noKeyContainer}>
        <Text style={styles.noKeyEmoji}>🔑</Text>
        <Text style={styles.noKeyTitle}>API-Key benötigt</Text>
        <Text style={styles.noKeyText}>
          Setze deinen Google Gemini API-Key in{'\n'}
          <Text style={styles.noKeyCode}>.env</Text>
          {'\n'}als EXPO_PUBLIC_GEMINI_API_KEY.
        </Text>
        <View style={styles.noKeySteps}>
          <Text style={styles.noKeyStep}>1. Gehe zu aistudio.google.com</Text>
          <Text style={styles.noKeyStep}>2. Erstelle einen API-Key</Text>
          <Text style={styles.noKeyStep}>3. Speichere ihn in .env als EXPO_PUBLIC_GEMINI_API_KEY</Text>
          <Text style={styles.noKeyStep}>4. Starte Expo neu mit: npx expo start -c</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <View style={styles.container}>
        <ProductAiHeader
          name={name}
          brand={brand}
          image={image}
          nutriscore={nutriscore}
          ecoscore={ecoscore}
          carbon={carbon}
          carbonGrade={carbonGrade}
          barcode={barcode}
          lotNumber={lotNumber}
          paddingTop={insets.top + 10}
          onBack={() => router.back()}
          onClear={handleClear}
        />

        {messages.length <= 1 && (
          <SuggestionChips
            suggestions={PRODUCT_SUGGESTIONS}
            onSelect={(s) => handleSend(s)}
          />
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            item.isLoading
              ? <ChatBubble isLoading loadingText="Analysiere Produkt…" />
              : <ChatBubble role={item.role} content={item.content} />
          )}
          style={styles.flatList}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />

        <View style={[styles.inputBar, { marginBottom: keyboardHeight > 0 ? keyboardHeight + 8 : insets.bottom }]}>
          <TextInput
            style={[styles.textInput, { height: Math.min(Math.max(inputHeight, 44), 120) }]}
            placeholder="Frag über dieses Produkt…"
            placeholderTextColor="#4B5563"
            value={input}
            onChangeText={setInput}
            onContentSizeChange={(e) => setInputHeight(e.nativeEvent.contentSize.height + 20)}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSend()}
            activeOpacity={0.8}
            disabled={!input.trim() || loading}
          >
            {loading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Ionicons name="send" size={20} color="#fff" />
            }
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
