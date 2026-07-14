import React from 'react';
import { View, Text, TouchableOpacity, Switch, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { getTheme } from '../utils/themes';
import { ThemeName } from '../types';
import { useHaptics } from '../hooks/useHaptics';
import { useSound } from '../hooks/useSound';

const themes: ThemeName[] = ['Classic', 'Neon', 'Dark', 'Candy'];

function ThemePreviewCard({ name, selected, onSelect }: { name: ThemeName; selected: boolean; onSelect: () => void }) {
  const theme = getTheme(name);
  const liquidValues = Object.values(theme.liquidColors);
  return (
    <TouchableOpacity
      className="items-center mr-3"
      onPress={onSelect}
      activeOpacity={0.7}
    >
      <View
        className="w-20 h-24 rounded-xl items-center justify-center mb-1"
        style={{
          backgroundColor: theme.card,
          borderWidth: selected ? 3 : 1,
          borderColor: selected ? theme.primary : theme.tubeBorder,
          shadowColor: selected ? theme.primary : 'transparent',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
          elevation: selected ? 6 : 1,
        }}
      >
        <View className="flex-row flex-wrap justify-center px-1">
          {liquidValues.slice(0, 6).map((color, i) => (
            <View
              key={i}
              className="w-4 h-4 rounded-sm m-0.5"
              style={{ backgroundColor: color }}
            />
          ))}
        </View>
      </View>
      <Text className="text-xs font-medium" style={{ color: selected ? getTheme(name).primary : theme.textSecondary }}>
        {name}
      </Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const settings = useGameStore((s) => s.settings);
  const setSettings = useGameStore((s) => s.setSettings);
  const { light } = useHaptics();
  const { playTap } = useSound();
  const theme = getTheme(settings.theme);

  const handleBack = () => {
    playTap();
    light();
    navigation.goBack();
  };

  const toggleSetting = (key: 'soundEnabled' | 'musicEnabled' | 'hapticsEnabled') => {
    light();
    playTap();
    setSettings({ [key]: !settings[key] });
  };

  const selectTheme = (name: ThemeName) => {
    light();
    playTap();
    setSettings({ theme: name });
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: theme.background, paddingTop: insets.top }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
    >
      <View className="flex-row items-center justify-between px-4 py-3">
        <TouchableOpacity
          className="w-10 h-10 rounded-full items-center justify-center"
          style={{ backgroundColor: theme.card }}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text className="text-lg" style={{ color: theme.text }}>←</Text>
        </TouchableOpacity>
        <Text className="text-lg font-bold" style={{ color: theme.text }}>Settings</Text>
        <View className="w-10" />
      </View>

      <View className="px-4 mt-4">
        <Text className="text-base font-semibold mb-3" style={{ color: theme.text }}>Audio</Text>
        <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: theme.card }}>
          <ToggleRow
            label="Sound Effects"
            icon="🔊"
            value={settings.soundEnabled}
            onToggle={() => toggleSetting('soundEnabled')}
            theme={theme}
          />
          <View style={{ height: 1, backgroundColor: theme.surface }} />
          <ToggleRow
            label="Music"
            icon="🎵"
            value={settings.musicEnabled}
            onToggle={() => toggleSetting('musicEnabled')}
            theme={theme}
          />
        </View>
      </View>

      <View className="px-4 mt-6">
        <Text className="text-base font-semibold mb-3" style={{ color: theme.text }}>Feedback</Text>
        <View className="rounded-2xl overflow-hidden" style={{ backgroundColor: theme.card }}>
          <ToggleRow
            label="Haptics"
            icon="📳"
            value={settings.hapticsEnabled}
            onToggle={() => toggleSetting('hapticsEnabled')}
            theme={theme}
          />
        </View>
      </View>

      <View className="px-4 mt-6">
        <Text className="text-base font-semibold mb-3" style={{ color: theme.text }}>Theme</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="py-2">
          {themes.map((name) => (
            <ThemePreviewCard
              key={name}
              name={name}
              selected={settings.theme === name}
              onSelect={() => selectTheme(name)}
            />
          ))}
        </ScrollView>
      </View>
    </ScrollView>
  );
}

function ToggleRow({
  label,
  icon,
  value,
  onToggle,
  theme,
}: {
  label: string;
  icon: string;
  value: boolean;
  onToggle: () => void;
  theme: ReturnType<typeof getTheme>;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 py-3.5">
      <View className="flex-row items-center">
        <Text className="text-base mr-2">{icon}</Text>
        <Text className="text-base" style={{ color: theme.text }}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.textSecondary, true: theme.primary }}
        thumbColor="#FFFFFF"
      />
    </View>
  );
}
