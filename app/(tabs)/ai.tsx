import { useState, useRef, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, FlatList,
  KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { sendMessage, ChatMessage, QUICK_SUGGESTIONS } from '../../services/aiAssistant';
import { HAS_GEMINI_API_KEY } from '../../constants/config';
import { ChatBubble } from '../../components/molecules/ChatBubble';
import styles from '../../styles/ai.styles';

interface Message extends ChatMessage {
  id: string;
  isLoading?: boolean;
}

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hallo! Ich bin dein KI-Assistent für Lebensmittel. 🥗\n\nFrag mich über Inhaltsstoffe, Herkunft, Nachhaltigkeit oder Ernährung – ich helfe dir gerne weiter!',
};

export default function AIScreen() {
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const handleSend = useCallback(async (text?: string) => {
    const messageText = (text ?? input).trim();
    if (!messageText || loading) return;
    setInput('');

    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: 'user', content: messageText },
      { id: 'loading', role: 'assistant', content: '', isLoading: true },
    ]);
    setLoading(true);
    scrollToBottom();

    try {
      const history: ChatMessage[] = messages
        .filter((m) => !m.isLoading && m.id !== 'welcome')
        .map((m) => ({ role: m.role, content: m.content }));
      const reply = await sendMessage(history, messageText);
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'loading'),
        { id: (Date.now() + 1).toString(), role: 'assistant', content: reply },
      ]);
    } catch (err: any) {
      const errText =
        err?.message?.includes('API key') || err?.status === 401 || err?.status === 403
          ? 'Gemini API-Key ungueltig oder gesperrt. Bitte setze EXPO_PUBLIC_GEMINI_API_KEY in .env.'
          : `Fehler: ${err?.message || 'Internetverbindung prüfen'}`;
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== 'loading'),
        { id: (Date.now() + 1).toString(), role: 'assistant', content: errText },
      ]);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  }, [input, loading, messages, scrollToBottom]);

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
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <LinearGradient colors={['#006EB7', '#004B87']} style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.headerAvatarContainer}>
              <Text style={styles.headerAvatarEmoji}>🤖</Text>
            </View>
            <View>
              <Text style={styles.headerTitle}>KI-Assistent</Text>
              <Text style={styles.headerSubtitle}>Lebensmittel-Experte</Text>
            </View>
          </View>
          <TouchableOpacity
            onPress={() => setMessages([WELCOME_MESSAGE])}
            style={styles.clearBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="trash-outline" size={20} color="#6B7280" />
          </TouchableOpacity>
        </LinearGradient>

        {messages.length <= 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionsRow}
            contentContainerStyle={styles.suggestionsContent}
          >
            {QUICK_SUGGESTIONS.map((s, i) => (
              <TouchableOpacity key={i} style={styles.suggestionChip} onPress={() => handleSend(s)} activeOpacity={0.7}>
                <Text style={styles.suggestionText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            item.isLoading
              ? <ChatBubble isLoading />
              : <ChatBubble role={item.role} content={item.content} />
          )}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />

        <View style={styles.inputBar}>
          <TextInput
            style={[styles.textInput, { maxHeight: 120 }]}
            placeholder="Frag mich etwas über Lebensmittel…"
            placeholderTextColor="#4B5563"
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={() => handleSend()}
            submitBehavior="newline"
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
