import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function LoginScreen({ onGuestLogin, isLoading = false }) {
  return (
    <View style={styles.screen}>
      <View style={styles.brandBlock}>
        <View style={styles.logo}>
          <Feather name="map" size={30} color="#ffffff" />
        </View>
        <Text style={styles.appName}>Travel Plan</Text>
        <Text style={styles.subtitle}>여행 일정, 예산, 체크리스트를 한곳에서 관리하세요.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>시작하기</Text>
        <Text style={styles.cardText}>
          지금은 mock 로그인으로 게스트 계정을 만들고, 나중에 Google/Apple/Supabase Auth로 교체할 수 있는 구조입니다.
        </Text>
        <Pressable
          testID="guest-login-button"
          accessibilityRole="button"
          style={[styles.primaryButton, isLoading && styles.disabledButton]}
          onPress={onGuestLogin}
          disabled={isLoading}
        >
          <Feather name="user-check" size={18} color="#ffffff" />
          <Text style={styles.primaryButtonText}>{isLoading ? '로그인 중...' : '게스트로 시작하기'}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#f4fbf8',
  },
  brandBlock: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    backgroundColor: '#176b55',
  },
  appName: {
    color: '#14231f',
    fontSize: 34,
    fontWeight: '900',
  },
  subtitle: {
    maxWidth: 320,
    marginTop: 10,
    color: '#61736c',
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
    shadowColor: '#245747',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  cardTitle: {
    color: '#14231f',
    fontSize: 20,
    fontWeight: '900',
  },
  cardText: {
    marginTop: 8,
    color: '#61736c',
    fontSize: 14,
    lineHeight: 21,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    marginTop: 18,
    borderRadius: 8,
    backgroundColor: '#176b55',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
});
