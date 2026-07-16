import React, { useEffect, memo } from 'react';
import { Pressable, View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Color, ThemeName } from '../types';
import { getLiquidColor } from '../utils/colors';

interface TubeProps {
  tube: Color[];
  capacity?: number;
  index: number;
  selected: boolean;
  onPress: () => void;
  highlighted?: boolean;
  theme: ThemeName;
  scale?: number;
}

const TUBE_WIDTH = 54;
const TUBE_HEIGHT = 200;
const WRAPPER_PADDING = 8;
const RIM_HEIGHT = 8;
const GLASS_THICKNESS = 4;

const glassTheme: Record<ThemeName, { bg: string; border: string; shine: string; shineSecondary: string; rim: string; volumeShadow: string }> = {
  Classic: { bg: 'rgba(255,255,255,0.08)', border: 'rgba(255,255,255,0.5)', shine: 'rgba(255,255,255,0.6)', shineSecondary: 'rgba(255,255,255,0.15)', rim: 'rgba(220,235,255,0.8)', volumeShadow: 'rgba(0,0,0,0.25)' },
  Neon: { bg: 'rgba(0,20,40,0.3)', border: 'rgba(0,255,255,0.6)', shine: 'rgba(0,255,255,0.5)', shineSecondary: 'rgba(0,255,255,0.15)', rim: 'rgba(0,255,255,0.8)', volumeShadow: 'rgba(0,10,20,0.6)' },
  Dark: { bg: 'rgba(20,20,20,0.4)', border: 'rgba(255,255,255,0.25)', shine: 'rgba(255,255,255,0.25)', shineSecondary: 'rgba(255,255,255,0.05)', rim: 'rgba(180,180,200,0.5)', volumeShadow: 'rgba(0,0,0,0.5)' },
  Candy: { bg: 'rgba(255,240,245,0.15)', border: 'rgba(255,182,193,0.6)', shine: 'rgba(255,255,255,0.6)', shineSecondary: 'rgba(255,200,210,0.25)', rim: 'rgba(255,200,210,0.8)', volumeShadow: 'rgba(50,0,20,0.15)' },
};

const selectedTheme: Record<ThemeName, { border: string; glow: string }> = {
  Classic: { border: 'rgba(255,255,255,1)', glow: 'rgba(255,255,255,0.8)' },
  Neon: { border: '#00FFFF', glow: '#00FFFF' },
  Dark: { border: 'rgba(255,255,255,0.8)', glow: '#FFFFFF' },
  Candy: { border: '#FF69B4', glow: '#FFB6C1' },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TubeComponent({ tube, capacity = 4, selected, onPress, highlighted = false, theme, scale = 1 }: TubeProps) {
  const s = scale;
  const tw = TUBE_WIDTH * s;
  const th = TUBE_HEIGHT * s;
  const wp = WRAPPER_PADDING * s;
  const rh = RIM_HEIGHT * s;
  const gt = GLASS_THICKNESS * s;

  const usableHeight = th - gt;
  const segmentHeight = usableHeight / capacity;
  const filledHeight = (tube.length / capacity) * usableHeight;
  const tubeRadius = tw / 2;

  const lift = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    lift.value = selected ? -12 * s : 0;
  }, [selected, s, lift]);

  useEffect(() => {
    cancelAnimation(pulse);
    if (highlighted) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.03, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulse.value = withTiming(1, { duration: 300 });
    }
    return () => cancelAnimation(pulse);
  }, [highlighted, pulse]);

  const animatedWrapperStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(lift.value, { damping: 12, stiffness: 120 }) },
      { scale: pulse.value },
    ],
  }));

  const glass = glassTheme[theme];
  const sel = selectedTheme[theme];

  const segments = Array.from({ length: capacity }).map((_, reversedIndex) => {
    const i = capacity - 1 - reversedIndex;
    const color = tube[i];
    const isEmpty = color === undefined;
    const isBottomSegment = i === 0;

    return (
      <View
        key={`segment-${i}`}
        style={[
          styles.segment,
          { height: segmentHeight },
          !isEmpty && { backgroundColor: getLiquidColor(color, theme) },
          !isEmpty && isBottomSegment && { borderBottomLeftRadius: tubeRadius - 3 * s, borderBottomRightRadius: tubeRadius - 3 * s },
        ]}
      />
    );
  });

  const topColor = tube.length > 0 ? tube[tube.length - 1] : undefined;
  const hasLiquid = tube.length > 0;

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        {
          width: tw + wp * 2,
          height: th + wp * 2 + rh,
          justifyContent: 'center',
          alignItems: 'center',
          padding: wp,
        },
        animatedWrapperStyle,
      ]}
      className="active:opacity-80"
    >
      <View
        style={[
          {
            width: tw + 6 * s,
            height: rh,
            borderRadius: rh / 2,
            borderWidth: 1.5 * s,
            borderBottomWidth: 1 * s,
            zIndex: 2,
            marginBottom: -1.5 * s,
            justifyContent: 'center',
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 * s },
            shadowOpacity: 0.3,
            shadowRadius: 2 * s,
            elevation: 3,
            backgroundColor: glass.bg,
            borderColor: selected ? sel.border : glass.border,
          },
        ]}
      >
        <View
          style={{
            width: '80%',
            height: '30%',
            borderRadius: 2 * s,
            top: -1 * s,
            backgroundColor: glass.rim,
          }}
        />
      </View>

      <View
        style={[
          {
            width: tw,
            height: th,
            borderWidth: 1.5 * s,
            borderTopWidth: 0,
            borderBottomLeftRadius: tubeRadius,
            borderBottomRightRadius: tubeRadius,
            justifyContent: 'flex-end',
            position: 'relative',
            overflow: 'hidden',
            paddingBottom: gt,
            backgroundColor: glass.bg,
            borderColor: selected ? sel.border : glass.border,
          },
          selected && {
            shadowColor: sel.glow,
            shadowOpacity: 0.8,
            shadowRadius: 15 * s,
            shadowOffset: { width: 0, height: 0 },
            elevation: 12,
          },
        ]}
      >
        <View
          style={{
            width: '100%',
            height: '100%',
            borderBottomLeftRadius: tubeRadius - 3 * s,
            borderBottomRightRadius: tubeRadius - 3 * s,
            overflow: 'hidden',
            justifyContent: 'flex-start',
          }}
        >
          <View style={styles.segmentsContainer}>{segments}</View>

          <View pointerEvents="none" style={styles.volumeOverlay}>
            <View style={[styles.volumeEdgeLeft, { backgroundColor: glass.volumeShadow }]} />
            <View style={[styles.volumeEdgeRight, { backgroundColor: glass.volumeShadow }]} />
          </View>
        </View>

        {hasLiquid && topColor && (
          <View
            pointerEvents="none"
            style={{
              position: 'absolute',
              width: tw - 3 * s,
              height: 10 * s,
              borderRadius: 10 * s,
              left: 0,
              bottom: filledHeight + gt - 5 * s,
              transform: [{ scaleY: 0.8 }],
              borderWidth: 0.5 * s,
              borderColor: 'rgba(0,0,0,0.1)',
              zIndex: 1,
              backgroundColor: getLiquidColor(topColor, theme),
            }}
          >
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(255,255,255,0.3)',
                borderRadius: 10 * s,
              }}
            />
          </View>
        )}

        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: 4 * s,
            top: 6 * s,
            width: 4 * s,
            height: th - 12 * s,
            borderRadius: 4 * s,
            zIndex: 2,
            backgroundColor: glass.shine,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            right: 8 * s,
            top: 10 * s,
            width: 12 * s,
            height: th - 20 * s,
            borderRadius: 6 * s,
            zIndex: 2,
            backgroundColor: glass.shineSecondary,
          }}
        />

        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderWidth: 1 * s,
            borderColor: 'rgba(255,255,255,0.15)',
            borderBottomLeftRadius: tubeRadius,
            borderBottomRightRadius: tubeRadius,
            zIndex: 2,
          }}
        />
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  segmentsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  segment: {
    width: '100%',
  },
  volumeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  volumeEdgeLeft: {
    width: '15%',
    height: '100%',
    opacity: 0.4,
  },
  volumeEdgeRight: {
    width: '30%',
    height: '100%',
    opacity: 0.8,
  },
});

export default memo(TubeComponent, (prevProps, nextProps) => {
  const isTubeEqual =
    prevProps.tube.length === nextProps.tube.length &&
    prevProps.tube.every((val, index) => val === nextProps.tube[index]);

  return (
    isTubeEqual &&
    prevProps.selected === nextProps.selected &&
    prevProps.highlighted === nextProps.highlighted &&
    prevProps.theme === nextProps.theme &&
    prevProps.scale === nextProps.scale
  );
});
