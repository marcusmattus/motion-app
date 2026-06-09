import React from 'react';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';
import { colors } from '../lib/theme';

export type Keypoint = {
  x: number;
  y: number;
  score: number;
  name: string;
};

type PoseSkeletonProps = {
  keypoints: Keypoint[];
  width: number;
  height: number;
  minConfidence?: number;
  showAngles?: boolean;
  showConfidence?: boolean;
  jointColor?: string;
  boneColor?: string;
};

// MoveNet keypoint connections
const BONE_PAIRS: [string, string][] = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
  ['nose', 'left_eye'],
  ['nose', 'right_eye'],
  ['left_eye', 'left_ear'],
  ['right_eye', 'right_ear'],
];

export function PoseSkeleton({
  keypoints,
  width,
  height,
  minConfidence = 0.3,
  showAngles = false,
  showConfidence = false,
  jointColor = colors.terminalGreen,
  boneColor = colors.terminalBlue,
}: PoseSkeletonProps) {
  const kpMap = new Map(keypoints.map((kp) => [kp.name, kp]));

  const visibleBones = BONE_PAIRS.filter(([a, b]) => {
    const ka = kpMap.get(a);
    const kb = kpMap.get(b);
    return ka && kb && ka.score >= minConfidence && kb.score >= minConfidence;
  });

  const visibleJoints = keypoints.filter((kp) => kp.score >= minConfidence);

  return (
    <Svg width={width} height={height} style={{ position: 'absolute', top: 0, left: 0 }}>
      {/* Bones */}
      {visibleBones.map(([a, b]) => {
        const ka = kpMap.get(a)!;
        const kb = kpMap.get(b)!;
        return (
          <Line
            key={`${a}-${b}`}
            x1={ka.x * width}
            y1={ka.y * height}
            x2={kb.x * width}
            y2={kb.y * height}
            stroke={boneColor}
            strokeWidth={2}
            strokeOpacity={0.7}
          />
        );
      })}

      {/* Joints */}
      {visibleJoints.map((kp) => {
        const cx = kp.x * width;
        const cy = kp.y * height;
        const r = kp.score > 0.7 ? 5 : 3;
        return (
          <React.Fragment key={kp.name}>
            <Circle cx={cx} cy={cy} r={r + 3} fill={jointColor} opacity={0.15} />
            <Circle cx={cx} cy={cy} r={r} fill={jointColor} opacity={0.9} />
            {showConfidence && (
              <SvgText
                x={cx + 6}
                y={cy - 4}
                fill={colors.textMuted}
                fontSize={8}
                fontFamily="SpaceMono"
              >
                {Math.round(kp.score * 100)}
              </SvgText>
            )}
          </React.Fragment>
        );
      })}
    </Svg>
  );
}
