import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '../components/ScreenHeader';

const menuItems = [
  { label: '저장한 여행지', icon: 'bookmark' },
  { label: '알림 설정', icon: 'bell' },
  { label: '앱 설정', icon: 'settings' },
];

export default function MyPageScreen({ user, onLogout, serverConnection }) {
  const isServerMode = serverConnection?.storageMode === 'server';

  return (
    <View style={styles.screen}>
      <ScreenHeader title="마이페이지" subtitle="저장한 여행과 계정 정보를 관리할 수 있습니다." icon="user" />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>TP</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.name}>{user?.name || '게스트 여행자'}</Text>
          <Text style={styles.email}>{user?.email || 'mock login'}</Text>
          <Text style={styles.userId}>userId: {user?.userId || '로그인 정보 없음'}</Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <View style={styles.statusIcon}>
          <Feather name="check-circle" size={18} color="#176b55" />
        </View>
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>mock 로그인 사용 중</Text>
          <Text style={styles.statusText}>현재 계정은 로컬 AsyncStorage에 저장된 임시 게스트 계정입니다.</Text>
        </View>
      </View>

      <View testID="storage-mode-card" style={styles.storageCard}>
        <View style={[styles.storageIcon, isServerMode ? styles.serverIcon : styles.localIcon]}>
          <Feather name={isServerMode ? 'cloud' : 'hard-drive'} size={18} color={isServerMode ? '#176b55' : '#b26a2c'} />
        </View>
        <View style={styles.statusCopy}>
          <Text style={styles.statusTitle}>현재 저장 모드</Text>
          <Text testID="storage-mode-label" style={[styles.storageModeText, isServerMode ? styles.serverModeText : styles.localModeText]}>
            {isServerMode ? '서버 모드' : '로컬 모드'}
          </Text>
          <Text style={styles.statusText}>
            {serverConnection?.message || '서버 연결 상태를 확인하고 있습니다'}
          </Text>
        </View>
      </View>

      <View style={styles.menuCard}>
        {menuItems.map((item) => (
          <View key={item.label} style={styles.menuItem}>
            <View style={styles.menuIcon}>
              <Feather name={item.icon} size={17} color="#176b55" />
            </View>
            <Text style={styles.menuText}>{item.label}</Text>
            <Feather name="chevron-right" size={18} color="#8fa199" />
          </View>
        ))}
      </View>

      <Pressable testID="logout-button" style={styles.logoutButton} onPress={onLogout}>
        <Feather name="log-out" size={18} color="#d45555" />
        <Text style={styles.logoutButtonText}>로그아웃</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f4fbf8',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
    shadowColor: '#245747',
    shadowOpacity: 0.06,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 4,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    backgroundColor: '#176b55',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  profileCopy: {
    flex: 1,
  },
  name: {
    color: '#14231f',
    fontSize: 18,
    fontWeight: '800',
  },
  email: {
    marginTop: 5,
    color: '#71827b',
    fontSize: 13,
  },
  userId: {
    marginTop: 5,
    color: '#176b55',
    fontSize: 12,
    fontWeight: '800',
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  storageCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 14,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  storageIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  serverIcon: {
    backgroundColor: '#e8f6f0',
  },
  localIcon: {
    backgroundColor: '#fff3e8',
  },
  storageModeText: {
    marginTop: 4,
    fontSize: 15,
    fontWeight: '900',
  },
  serverModeText: {
    color: '#176b55',
  },
  localModeText: {
    color: '#b26a2c',
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#e8f6f0',
  },
  statusCopy: {
    flex: 1,
  },
  statusTitle: {
    color: '#14231f',
    fontSize: 15,
    fontWeight: '900',
  },
  statusText: {
    marginTop: 4,
    color: '#61736c',
    fontSize: 13,
    lineHeight: 19,
  },
  menuCard: {
    marginHorizontal: 20,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e1ece7',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#edf3f0',
  },
  menuIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#e8f6f0',
  },
  menuText: {
    flex: 1,
    color: '#243732',
    fontSize: 15,
    fontWeight: '800',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 8,
    backgroundColor: '#fff7f7',
    borderWidth: 1,
    borderColor: '#f2cece',
    gap: 8,
  },
  logoutButtonText: {
    color: '#d45555',
    fontSize: 15,
    fontWeight: '900',
  },
});
