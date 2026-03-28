import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  icon?: string;
  colors?: [string, string];
  style?: ViewStyle;
  children?: ReactNode;
}

export function GradientHeader({
  title,
  subtitle,
  icon,
  colors = ['#006EB7', '#004B87'],
  style,
  children,
}: Props) {
  return (
    <LinearGradient colors={colors} style={[styles.header, style]}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  icon: { fontSize: 52, marginBottom: 12 },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#E0F2FE',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 8,
  },
});
