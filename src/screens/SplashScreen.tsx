import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../store/gameStore';
import { useLevelStore } from '../store/levelStore';
import { useStatsStore } from '../store/statsStore';
import { getTheme } from '../utils/themes';
import { RootStackParamList } from '../navigation/AppNavigator';

export default function SplashScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const loadGame = useGameStore((s) => s.loadGame);
  const loadProgress = useLevelStore((s) => s.loadProgress);
  const levels = useLevelStore((s) => s.levels);
  const generateLevels = useLevelStore((s) => s.generateLevels);
  const theme = useGameStore((s) => s.settings.theme);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { height } = Dimensions.get('window');
  const colors = getTheme(theme).liquidColors;
  const gradientColors = [colors.R, colors.B, colors.G, colors.Y];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    const init = async () => {
      await loadProgress();
      await loadGame();
      await useStatsStore.getState().loadStats();
      if (levels.length === 0) {
        await generateLevels(5);
      }
    };

    init();

    const timer = setTimeout(() => navigation.replace('Home'), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: getTheme(theme).background }}>
      {gradientColors.map((color, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: (height / gradientColors.length) * i,
            left: 0,
            right: 0,
            height: height / gradientColors.length,
            opacity: 0.25,
            backgroundColor: color,
          }}
        />
      ))}
      <Animated.View className="items-center" style={{ opacity: fadeAnim }}>
        <View className="flex-row items-baseline">
          {['W', 'a', 't', 'e', 'r', '', 'S', 'o', 'r', 't'].map((char, i) => (
            <Text
              key={i}
              className="text-5xl font-bold"
              style={{
                color: gradientColors[i % gradientColors.length],
                marginLeft: char === '' ? 8 : 0,
              }}
            >
              {char || ' '}
            </Text>
          ))}
        </View>
        <Text className="mt-6 text-lg tracking-widest uppercase" style={{ color: getTheme(theme).textSecondary }}>
          Loading...
        </Text>
      </Animated.View>
    </View>
  );
}
