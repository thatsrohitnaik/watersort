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
}

const TUBE_WIDTH = 52;
const TUBE_HEIGHT = 200;
const WRAPPER_PADDING = 8;
const RIM_HEIGHT = 8;

const glassTheme: Record<ThemeName, { bg: string; border: string }> = {
  Classic: { bg: 'rgba(255,255,255,0.12)', border: 'rgba(255,255,255,0.35)' },
  Neon: { bg: 'rgba(0,0,0,0.25)', border: 'rgba(0,255,255,0.45)' },
  Dark: { bg: 'rgba(255,255,255,0.05)', border: 'rgba(255,255,255,0.18)' },
  Candy: { bg: 'rgba(255,255,255,0.15)', border: 'rgba(255,182,193,0.45)' },
};

const selectedTheme: Record<ThemeName, { border: string; glow: string }> = {
  Classic: { border: 'rgba(255,255,255,0.9)', glow: '#FFFFFF' },
  Neon: { border: '#00FFFF', glow: '#00FFFF' },
  Dark: { border: 'rgba(255,255,255,0.5)', glow: '#FFFFFF' },
  Candy: { border: '#FFB6C1', glow: '#FFB6C1' },
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function TubeComponent({
  tube,
  capacity = 4,
  selected,
  onPress,
  highlighted = false,
  theme,
}: TubeProps) {
  const segmentHeight = TUBE_HEIGHT / capacity;

  // Shared Values for Reanimated
  const lift = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    lift.value = selected ? -10 : 0;
  }, [selected, lift]);

  useEffect(() => {
    if (highlighted) {
      pulse.value = withRepeat(
        withSequence(
          withTiming(1.04, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Loop infinitely
        true
      );
    } else {
      // Safely cancel the repeat animation before resetting
      cancelAnimation(pulse);
      pulse.value = withTiming(1, { duration: 300 });
    }

    return () => cancelAnimation(pulse); // Cleanup on unmount
  }, [highlighted, pulse]);

  const animatedWrapperStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: withSpring(lift.value, { damping: 15, stiffness: 150 }) },
      { scale: pulse.value },
    ],
  }));

  const glass = glassTheme[theme];
  const sel = selectedTheme[theme];

  // Declarative segment generation
  const segments = Array.from({ length: capacity }).map((_, reversedIndex) => {
    const i = capacity - 1 - reversedIndex;
    const color = tube[i];
    const isEmpty = color === undefined;
    const isBottomSegment = i === 0;
    const isTopFilled = !isEmpty && (i === capacity - 1 || tube[i + 1] === undefined);

    return (
      <View
        key={`segment-${i}`}
        style={[
          styles.segment,
          { height: segmentHeight },
          !isEmpty && { backgroundColor: getLiquidColor(color, theme) },
          !isEmpty && isBottomSegment && styles.segmentBottomRounded,
          !isEmpty && isTopFilled && styles.segmentTopRounded,
        ]}
      />
    );
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[styles.wrapper, animatedWrapperStyle]}
      className="active:opacity-80"
    >
      <View
        style={[
          styles.tube,
          {
            backgroundColor: glass.bg,
            borderColor: selected ? sel.border : glass.border,
            borderWidth: selected ? 2.5 : 1.5,
          },
          selected ? {
            shadowColor: sel.glow,
            shadowOpacity: 0.6,
            shadowRadius: 10,
            shadowOffset: { width: 0, height: 0 },
            elevation: 10,
          } : {
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: 2 },
            elevation: 3,
          },
        ]}
      >
        <View style={[styles.rim, { backgroundColor: glass.border }]} />
        <View style={styles.segmentsContainer}>{segments}</View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: TUBE_WIDTH + WRAPPER_PADDING * 2,
    height: TUBE_HEIGHT + WRAPPER_PADDING * 2 + RIM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    padding: WRAPPER_PADDING,
  },
  tube: {
    width: TUBE_WIDTH,
    height: TUBE_HEIGHT + RIM_HEIGHT,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  rim: {
    height: RIM_HEIGHT,
    borderRadius: 4,
    opacity: 0.5,
  },
  segmentsContainer: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  segment: {
    width: '100%',
  },
  segmentBottomRounded: {
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  segmentTopRounded: {
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
});

// Export as Memoized Component
export default memo(TubeComponent, (prevProps, nextProps) => {
  // Deep check the tube array to prevent massive re-renders when other tubes change
  const isTubeEqual = 
    prevProps.tube.length === nextProps.tube.length &&
    prevProps.tube.every((val, index) => val === nextProps.tube[index]);

  return (
    isTubeEqual &&
    prevProps.selected === nextProps.selected &&
    prevProps.highlighted === nextProps.highlighted &&
    prevProps.theme === nextProps.theme
  );
});