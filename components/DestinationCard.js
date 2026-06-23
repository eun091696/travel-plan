import { Feather } from '@expo/vector-icons';
import React from 'react';
import { ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';

export default function DestinationCard({ destination, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${destination.name} 상세 보기`}
      testID={`destination-card-${destination.id}`}
      style={styles.card}
      onPress={onPress}
    >
      <ImageBackground source={{ uri: destination.image }} style={styles.image} imageStyle={styles.imageRadius}>
        <View style={styles.overlay} />
        <View style={styles.content}>
          <View style={styles.locationRow}>
            <Feather name="map-pin" size={14} color="#dff6ef" />
            <Text style={styles.country}>{destination.country}</Text>
          </View>
          <Text style={styles.name}>{destination.name}</Text>
          <Text style={styles.tagline} numberOfLines={2}>{destination.tagline}</Text>
          <View style={styles.tagRow}>
            {(destination.styleTags || []).slice(0, 2).map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      </ImageBackground>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 238,
    height: 184,
    marginRight: 14,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#d9e7e1',
    shadowColor: '#173d34',
    shadowOpacity: 0.16,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  image: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  imageRadius: {
    borderRadius: 8,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 33, 28, 0.42)',
  },
  content: {
    padding: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  country: {
    marginLeft: 5,
    color: '#dff6ef',
    fontSize: 12,
    fontWeight: '800',
  },
  name: {
    marginTop: 5,
    color: '#ffffff',
    fontSize: 25,
    fontWeight: '800',
  },
  tagline: {
    marginTop: 6,
    color: '#eef8f4',
    fontSize: 13,
    lineHeight: 18,
  },
  tagRow: {
    flexDirection: 'row',
    marginTop: 11,
  },
  tag: {
    marginRight: 6,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.28)',
  },
  tagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
});
