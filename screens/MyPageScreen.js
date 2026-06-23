import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import ScreenHeader from '../components/ScreenHeader';

const menuItems = [
  { label: '저장한 여행지', icon: 'bookmark' },
  { label: '알림 설정', icon: 'bell' },
  { label: '앱 설정', icon: 'settings' },
];

export default function MyPageScreen() {
  return (
    <View style={styles.screen}>
      <ScreenHeader title="마이페이지" subtitle="저장한 여행과 계정 정보를 관리할 수 있습니다." icon="user" />

      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>TP</Text>
        </View>
        <View style={styles.profileCopy}>
          <Text style={styles.name}>Travel Planner</Text>
          <Text style={styles.email}>mock-user@travelplan.app</Text>
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
});
