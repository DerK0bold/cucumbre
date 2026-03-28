import { View, TextInput, TouchableOpacity, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  onSubmit: () => void;
  disabled?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

export function SearchInput({
  value,
  onChangeText,
  placeholder,
  onSubmit,
  disabled = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
}: Props) {
  return (
    <View style={styles.row}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#4B5563"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        editable={!disabled}
      />
      <TouchableOpacity
        style={[styles.btn, (!value.trim() || disabled) && styles.btnDisabled]}
        onPress={onSubmit}
        disabled={!value.trim() || disabled}
      >
        <Ionicons name="search" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 6,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '500',
  },
  btn: {
    backgroundColor: '#006EB7',
    borderRadius: 14,
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#006EB7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  btnDisabled: {
    backgroundColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
  },
});
