import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, LatLng, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MotionButton } from '../../src/components/MotionButton';
import { MotionCard } from '../../src/components/MotionCard';
import { colors, spacing, radius } from '../../src/lib/theme';

const darkMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#1d1d1d' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#2c2c2c' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#1d1d1d' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e0e0e' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#242424' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1d1d1d' }] },
];

function haversine(a: LatLng, b: LatLng) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const x = sinDLat * sinDLat + sinDLon * sinDLon * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

export default function ForgeRun() {
  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState<LatLng[]>([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentRegion, setCurrentRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const locationRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const stats = useMemo(() => ({
    distance: (distance / 1000).toFixed(2),
    pace: distance > 0 && duration > 0
      ? `${Math.floor(duration / 60 / (distance / 1000))}:${String(Math.floor((duration / (distance / 1000)) % 60)).padStart(2, '0')}`
      : '--:--',
    duration: `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`,
  }), [distance, duration]);

  useEffect(() => {
    return () => {
      locationRef.current?.remove();
      locationRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const toggleTracking = async () => {
    if (isTracking) {
      locationRef.current?.remove();
      locationRef.current = null;
      if (timerRef.current) clearInterval(timerRef.current);
      setIsTracking(false);
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    // Start timer
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    locationRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.Highest, distanceInterval: 5, timeInterval: 1000 },
      (location) => {
        const coord = { latitude: location.coords.latitude, longitude: location.coords.longitude };
        setRoute((prev) => {
          const next = [...prev, coord];
          if (next.length > 1) {
            const last = next[next.length - 2];
            setDistance((d) => d + haversine(last, coord));
          }
          return next;
        });
        setCurrentRegion((prev) => ({ ...prev, latitude: coord.latitude, longitude: coord.longitude }));
      }
    );

    setIsTracking(true);
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={darkMapStyle}
        region={currentRegion}
        followsUserLocation
        showsUserLocation
        showsMyLocationButton={false}
      >
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeWidth={4}
            strokeColor={colors.primary}
          />
        )}
        {route.length > 0 && (
          <Marker coordinate={route[0]} title="Start">
            <View style={styles.startMarker}>
              <Icon name="flag" size={16} color={colors.charcoal} />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Stats Overlay */}
      <View style={styles.statsOverlay}>
        <MotionCard variant="elevated" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.distance}</Text>
              <Text style={styles.statLabel}>KM</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.duration}</Text>
              <Text style={styles.statLabel}>TIME</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.pace}</Text>
              <Text style={styles.statLabel}>PACE</Text>
            </View>
          </View>
        </MotionCard>
      </View>

      {/* Bottom Controls */}
      <View style={styles.controls}>
        <MotionButton
          label={isTracking ? 'Stop Run' : 'Start Run'}
          variant={isTracking ? 'danger' : 'gradient'}
          size="lg"
          fullWidth
          icon={<Icon name={isTracking ? 'stop' : 'play'} size={24} color={isTracking ? colors.textPrimary : colors.charcoal} />}
          onPress={toggleTracking}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  map: {
    flex: 1,
  },
  startMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primaryGreen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsOverlay: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
  },
  statsCard: {
    paddingVertical: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.surface,
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    backgroundColor: colors.background,
  },
});
