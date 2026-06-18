import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Rect } from 'react-native-svg';
import { colors } from '../lib/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

type HUDOverlayProps = {
  width?: number;
  height?: number;
  showScanlines?: boolean;
  showReticle?: boolean;
  reticleColor?: string;
};

export function HUDOverlay({
  width = SCREEN_W,
  height = SCREEN_H,
  showScanlines = true,
  showReticle = true,
  reticleColor = colors.terminalGreen,
}: HUDOverlayProps) {
  const scanlineCount = Math.floor(height / 4);
  const scanlines = Array.from({ length: scanlineCount }, (_, i) => i);

  const bracketLen = 32;
  const bracketThick = 2;
  const inset = 40;

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      <Svg width={width} height={height}>
        {/* Scanlines */}
        {showScanlines &&
          scanlines.map((i) => (
            <Line
              key={i}
              x1={0}
              y1={i * 4}
              x2={width}
              y2={i * 4}
              stroke={colors.scanline}
              strokeWidth={1}
            />
          ))}

        {/* Corner reticle — top-left */}
        {showReticle && (
          <>
            <Rect x={inset} y={inset} width={bracketLen} height={bracketThick} fill={reticleColor} opacity={0.8} />
            <Rect x={inset} y={inset} width={bracketThick} height={bracketLen} fill={reticleColor} opacity={0.8} />
            {/* top-right */}
            <Rect x={width - inset - bracketLen} y={inset} width={bracketLen} height={bracketThick} fill={reticleColor} opacity={0.8} />
            <Rect x={width - inset - bracketThick} y={inset} width={bracketThick} height={bracketLen} fill={reticleColor} opacity={0.8} />
            {/* bottom-left */}
            <Rect x={inset} y={height - inset - bracketThick} width={bracketLen} height={bracketThick} fill={reticleColor} opacity={0.8} />
            <Rect x={inset} y={height - inset - bracketLen} width={bracketThick} height={bracketLen} fill={reticleColor} opacity={0.8} />
            {/* bottom-right */}
            <Rect x={width - inset - bracketLen} y={height - inset - bracketThick} width={bracketLen} height={bracketThick} fill={reticleColor} opacity={0.8} />
            <Rect x={width - inset - bracketThick} y={height - inset - bracketLen} width={bracketThick} height={bracketLen} fill={reticleColor} opacity={0.8} />
          </>
        )}
      </Svg>
    </View>
  );
}
