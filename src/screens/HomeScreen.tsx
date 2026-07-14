import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { useLevelStore } from '../store/levelStore';
import { getTheme } from '../utils/themes';
import { useSound } from '../hooks/useSound';
import { useHaptics } from '../hooks/useHaptics';
import { RootStackParamList } from '../navigation/AppNavigator';

export default function HomeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const insets = useSafeAreaInsets();
  const settings = useGameStore((s) => s.settings);
  const board = useGameStore((s) => s.board);
  const levels = useLevelStore((s) => s.levels);
  const levelsCompleted = useLevelStore((s) => s.unlockedLevel - 1);
  const unlockedLevel = useLevelStore((s) => s.unlockedLevel);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  const { playTap, playMenuMusic } = useSound();
  const { light } = useHaptics();

  const theme = getTheme(settings.theme);
  const colors = theme.liquidColors;
  const gradientColors = [colors.R, colors.B, colors.G, colors.Y];

  useEffect(() => {
    playMenuMusic();
    setHasSavedGame(board !== null);
  }, []);

  const handlePlay = () => {
    playTap();
    light();
    const firstLevel = levels[0];
    if (firstLevel) {
      navigation.navigate('Game', { levelData: firstLevel });
    } else {
      navigation.navigate('Game');
    }
  };

  const handleContinue = () => {
    playTap();
    light();
    const savedBoard = board;
    if (savedBoard) {
      navigation.navigate('Game');
    } else {
      const firstLevel = levels[0];
      if (firstLevel) {
        navigation.navigate('Game', { levelData: firstLevel });
      } else {
        navigation.navigate('Game');
      }
    }
  };

  const handleSettings = () => {
    playTap();
    light();
    navigation.navigate('Settings');
  };

  const handleLevelSelect = () => {
    playTap();
    light();
    navigation.navigate('LevelSelect');
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: theme.background, paddingTop: insets.top }}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom }}
    >
      <View className="flex-1 items-center justify-center px-6">
        <View className="mb-2" />

        <View className="flex-row items-baseline flex-wrap justify-center mb-8">
          {['W', 'a', 't', 'e', 'r'].map((char, i) => (
            <Text
              key={`first-${i}`}
              className="text-5xl font-extrabold"
              style={{ color: gradientColors[i % gradientColors.length] }}
            >
              {char}
            </Text>
          ))}
          <Text className="text-5xl font-extrabold mx-1" style={{ color: theme.text }}>
            {' '}
          </Text>
          {['S', 'o', 'r', 't'].map((char, i) => (
            <Text
              key={`second-${i}`}
              className="text-5xl font-extrabold"
              style={{ color: gradientColors[(i + 4) % gradientColors.length] }}
            >
              {char}
            </Text>
          ))}
        </View>

        <View
          className="items-center py-6 px-8 rounded-3xl mb-8 w-full"
          style={{ backgroundColor: theme.card, shadowColor: theme.text, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 8 }}
        >
          <View className="flex-row justify-around w-full mb-4">
            <View className="items-center">
              <Text className="text-3xl font-bold" style={{ color: theme.primary }}>{levelsCompleted}</Text>
              <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>Completed</Text>
            </View>
            <View className="w-px" style={{ backgroundColor: theme.textSecondary }} />
            <View className="items-center">
              <Text className="text-3xl font-bold" style={{ color: theme.primary }}>{unlockedLevel}</Text>
              <Text className="text-sm mt-1" style={{ color: theme.textSecondary }}>Unlocked</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          className="w-full py-4 rounded-2xl items-center mb-4"
          style={{ backgroundColor: theme.primary, shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}
          onPress={handlePlay}
          activeOpacity={0.8}
        >
          <Text className="text-white text-xl font-bold tracking-wider">PLAY</Text>
        </TouchableOpacity>

        {hasSavedGame && (
          <TouchableOpacity
            className="w-full py-4 rounded-2xl items-center mb-4 border-2"
            style={{ borderColor: theme.primary, backgroundColor: 'transparent' }}
            onPress={handleContinue}
            activeOpacity={0.8}
          >
            <Text className="text-xl font-bold" style={{ color: theme.primary }}>CONTINUE</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          className="w-full py-4 rounded-2xl items-center mb-4"
          style={{ backgroundColor: theme.card, shadowColor: theme.text, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 4 }}
          onPress={handleLevelSelect}
          activeOpacity={0.8}
        >
          <Text className="text-lg font-semibold" style={{ color: theme.text }}>LEVEL SELECT</Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-14 h-14 rounded-full items-center justify-center mt-2"
          style={{ backgroundColor: theme.card }}
          onPress={handleSettings}
          activeOpacity={0.8}
        >
          <Text className="text-2xl">⚙</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
