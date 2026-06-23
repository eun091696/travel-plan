import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const tabs = [
  { key: 'home', label: '홈', icon: 'compass' },
  { key: 'itinerary', label: '일정', icon: 'calendar' },
  { key: 'my', label: '마이페이지', icon: 'user' },
];

export default function BottomTabs({ activeTab, onChangeTab }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <Pressable
              key={tab.key}
              testID={`tab-${tab.key}`}
              accessibilityRole="button"
              accessibilityLabel={`${tab.label} 탭`}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onChangeTab(tab.key)}
            >
              <Feather name={tab.icon} size={20} color={isActive ? '#ffffff' : '#7f918a'} />
              <Text style={[styles.label, isActive && styles.activeLabel]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 14,
    paddingTop: 9,
    paddingBottom: 12,
    backgroundColor: '#f4fbf8',
    borderTopWidth: 1,
    borderTopColor: '#dfece6',
  },
  container: {
    flexDirection: 'row',
    minHeight: 62,
    padding: 6,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    shadowColor: '#245747',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  tab: {
    flex: 1,
    minHeight: 50,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeTab: {
    backgroundColor: '#176b55',
  },
  label: {
    marginTop: 4,
    color: '#7f918a',
    fontSize: 12,
    fontWeight: '700',
  },
  activeLabel: {
    color: '#ffffff',
  },
});
