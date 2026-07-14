import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { useLevelStore } from '../store/levelStore';
import { getTheme } from '../utils/themes';
import { useHaptics } from '../hooks/useHaptics';
import { useSound } from '../hooks/useSound';
import { RootStackParamList } from '../navigation/AppNavigator';

function LevelButton({
  id,
  unlocked,
  completed,
  difficulty,
  onPress,
  theme,
  index,
}: {
  id: number;
  unlocked: boolean;
  completed: boolean;
  difficulty: number;
  onPress: () => void;
  theme: ReturnType<typeof getTheme>;
  index: number;
}) {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 6,
      tension: 80,
      delay: index * 40,
      useNativeDriver: true,
    }).start();
  }, []);

  const getDifficultyBadge = (diff: number) => {
    if (diff <= 3) return { label: 'Easy', color: theme.success };
    if (diff <= 6) return { label: 'Medium', color: theme.secondary };
    return { label: 'Hard', color: '#FF5555' };
  };

  const badge = getDifficultyBadge(difficulty);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        className="items-center justify-center rounded-2xl m-1.5"
        style={{
          width: 80,
          height: 90,
          backgroundColor: unlocked ? theme.card : theme.surface,
          borderWidth: completed ? 2 : 1,
          borderColor: completed ? theme.success : unlocked ? theme.tubeBorder : theme.surface,
          opacity: unlocked ? 1 : 0.45,
        }}
        onPress={unlocked ? onPress : undefined}
        activeOpacity={0.7}
        disabled={!unlocked}
      >
        {!unlocked && (
          <Text className="text-2xl mb-1">🔒</Text>
        )}
        <Text
          className="text-lg font-bold"
          style={{ color: unlocked ? theme.text : theme.textSecondary }}
        >
          {id}
        </Text>
        {completed && unlocked && (
          <Text className="text-xs mt-0.5">⭐</Text>
        )}
        {unlocked && !completed && (
          <Text className="text-xs mt-0.5" style={{ color: theme.textSecondary }}>
            {badge.label}
          </Text>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LevelSelectScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const settings = useGameStore((s) => s.settings);
  const levels = useLevelStore((s) => s.levels);
  const unlockedLevel = useLevelStore((s) => s.unlockedLevel);
  const isLevelUnlocked = useLevelStore((s) => s.isLevelUnlocked);
  const { light } = useHaptics();
  const { playTap } = useSound();
  const theme = getTheme(settings.theme);

  const handleBack = () => {
    playTap();
    light();
    navigation.goBack();
  };

  const handleSelect = (levelId: number) => {
    if (!isLevelUnlocked(levelId)) return;
    playTap();
    light();
    navigation.navigate('Game', { levelId });
  };

  const completedCount = levels.filter((l) => l.id < unlockedLevel).length;

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background, paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: theme.card }}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text className="text-lg" style={{ color: theme.text }}>←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold" style={{ color: theme.text }}>Level Select</Text>
        <View className="flex-row items-center">
          <Text className="text-sm mr-1" style={{ color: theme.textSecondary }}>⭐</Text>
          <Text className="text-sm font-medium" style={{ color: theme.text }}>{completedCount}/{levels.length}</Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row flex-wrap justify-center py-4">
          {levels.map((level, index) => (
            <LevelButton
              key={level.id}
              id={level.id}
              unlocked={isLevelUnlocked(level.id)}
              completed={level.id < unlockedLevel}
              difficulty={level.difficulty || 1}
              onPress={() => handleSelect(level.id)}
              theme={theme}
              index={index}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
