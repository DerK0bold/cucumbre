import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';

interface Props {
  severity: 'critical' | 'warning' | 'info';
  icon: string;
  title: string;
  subtitle: string;
  message: string;
  actionIcon?: keyof typeof Ionicons.glyphMap;
  action?: string;
  footer?: string;
  children?: ReactNode;
  style?: ViewStyle;
}

export function WarningBanner({ severity, icon, title, subtitle, message, actionIcon, action, footer, children, style }: Props) {
  const isCritical = severity === 'critical';
  return (
    <View style={[styles.banner, isCritical ? styles.critical : styles.warning, style]}>
      <View style={styles.iconRow}>
        <Text style={styles.icon}>{icon}</Text>
        <View style={styles.textBlock}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>
      </View>
      <Text style={styles.message}>{message}</Text>
      {action && (
        <View style={styles.actionBox}>
          {actionIcon && <Ionicons name={actionIcon} size={16} color="#fff" />}
          <Text style={styles.action}>{action}</Text>
        </View>
      )}
      {footer && <Text style={styles.footer}>{footer}</Text>}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { margin: 12, borderRadius: 14, padding: 16, borderWidth: 2 },
  critical: { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
  warning: { backgroundColor: '#FFFBEB', borderColor: '#F59E0B' },
  iconRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 10 },
  icon: { fontSize: 28 },
  textBlock: { flex: 1 },
  title: { color: '#1E293B', fontSize: 16, fontWeight: '900' },
  subtitle: { color: '#64748B', fontSize: 11, marginTop: 2 },
  message: { color: '#475569', fontSize: 13, lineHeight: 18, marginBottom: 10 },
  actionBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 8, padding: 10, marginBottom: 8,
  },
  action: { color: '#1E293B', fontSize: 13, flex: 1, lineHeight: 18 },
  footer: { color: '#64748B', fontSize: 11 },
});
