import { Feather } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ScreenHeader({ title, subtitle, onBack, icon = 'map' }) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable accessibilityRole="button" accessibilityLabel="뒤로 가기" style={styles.backButton} onPress={onBack}>
          <Feather name="chevron-left" size={24} color="#173d34" />
        </Pressable>
      ) : (
        <View style={styles.brandIcon}>
          <Feather name={icon} size={20} color="#176b55" />
        </View>
      )}
      <View style={styles.titleBlock}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#dbe9e3',
    shadowColor: '#245747',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: '#e6f6ef',
    borderWidth: 1,
    borderColor: '#cce8dc',
  },
  titleBlock: {
    flex: 1,
  },
  title: {
    color: '#13251f',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    color: '#667a72',
    fontSize: 14,
    lineHeight: 20,
  },
});
