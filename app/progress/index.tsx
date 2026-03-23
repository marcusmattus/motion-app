import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { BrutalButton } from '../../components/BrutalButton';

export default function ProgressMirror() {
  const [opacity, setOpacity] = useState(0.5);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>The Mirror</Text>
      <View style={styles.images}>
        <View style={[styles.imageBox, { opacity: 1 - opacity }]}>
          <Text style={styles.label}>Current</Text>
        </View>
        <View style={[styles.imageBox, { opacity }]}>
          <Text style={styles.label}>30 Days Ago</Text>
        </View>
      </View>
      <View>
        <Text style={styles.sliderLabel}>Overlay Power</Text>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={1}
          value={opacity}
          onValueChange={setOpacity}
          minimumTrackTintColor="#000"
          maximumTrackTintColor="#C7C7C5"
          thumbTintColor="#000"
        />
      </View>
      <BrutalButton label="Compare Again" onPress={() => {}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, gap: 12, backgroundColor: '#F0F0F0' },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 28 },
  images: { flexDirection: 'row', gap: 12 },
  imageBox: {
    flex: 1,
    height: 220,
    borderWidth: 4,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000'
  },
  label: { fontFamily: 'SpaceGrotesk_500Medium', color: '#FFD700' },
  sliderLabel: { fontFamily: 'SpaceGrotesk_500Medium' },
  slider: { height: 40 }
});
