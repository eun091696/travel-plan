import { Feather } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function WeatherCard({ weather, loading, error }) {
  const isClimate = weather?.type === 'climate';
  const isFallback = weather?.type === 'fallback';
  const iconName = isClimate ? 'cloud' : isFallback ? 'alert-circle' : 'sun';

  return (
    <View style={styles.weatherCard}>
      <View style={styles.weatherIcon}>
        <Feather name={iconName} size={23} color="#ffffff" />
      </View>
      <View style={styles.weatherCopy}>
        <Text style={styles.weatherLabel}>
          {loading ? '날씨 불러오는 중' : weather?.sourceLabel || '날씨 정보'}
        </Text>
        <Text style={styles.weatherMain}>{loading ? '잠시만 기다려주세요' : weather?.status || '날씨 정보 준비 중'}</Text>
        {weather?.minTemp !== undefined && weather?.maxTemp !== undefined ? (
          <Text style={styles.weatherSub}>평균 최저 {weather.minTemp}°C · 평균 최고 {weather.maxTemp}°C</Text>
        ) : null}
        {weather?.rainChance ? <Text style={styles.weatherSub}>강수 가능성 {weather.rainChance}</Text> : null}
        {weather?.humidity ? <Text style={styles.weatherSub}>습도 {weather.humidity}</Text> : null}
        {weather?.packing?.length ? <Text style={styles.weatherSub}>추천 준비물: {weather.packing.join(', ')}</Text> : null}
        {weather?.tip ? <Text style={styles.weatherTip}>{weather.tip}</Text> : null}
        {weather?.notice ? <Text style={styles.weatherNotice}>{weather.notice}</Text> : null}
        {error && error !== weather?.notice ? <Text style={styles.weatherNotice}>{error}</Text> : null}
      </View>
      <Text style={styles.temperature}>{loading ? '--' : weather?.temperature || ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  weatherCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 20,
    marginBottom: 14,
    padding: 18,
    borderRadius: 8,
    backgroundColor: '#176b55',
    shadowColor: '#176b55',
    shadowOpacity: 0.2,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  weatherIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
  },
  weatherCopy: {
    flex: 1,
  },
  weatherLabel: {
    color: '#bfe6da',
    fontSize: 13,
    fontWeight: '700',
  },
  weatherMain: {
    marginTop: 5,
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
  },
  weatherSub: {
    marginTop: 5,
    color: '#d9f1ea',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  weatherTip: {
    marginTop: 8,
    color: '#ffffff',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '800',
  },
  weatherNotice: {
    marginTop: 6,
    color: '#bfe6da',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  temperature: {
    marginLeft: 8,
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
  },
});
