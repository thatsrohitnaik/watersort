// @ts-nocheck
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, Modal } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGameStore } from '../store/gameStore';
import { useLevelStore } from '../store/levelStore';
import GameBoard from '../components/GameBoard';
import AdPlaceholder from '../components/AdPlaceholder';
import { getTheme } from '../utils/themes';
import { getValidMoves } from '../engine/RuleEngine';
import { useHaptics } from '../hooks/useHaptics';
import { useSound } from '../hooks/useSound';

function formatTime(seconds: number): string {
  const m = Math.max(0, Math.floor(seconds / 60));
  const s = Math.max(0, seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function GameScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();

  const board = useGameStore((s) => s.board);
  const initialBoard = useGameStore((s) => s.initialBoard);
  const selectedTube = useGameStore((s) => s.selectedTube);
  const level = useGameStore((s) => s.level);
  const moves = useGameStore((s) => s.moves);
  const timer = useGameStore((s) => s.timer);
  const isPaused = useGameStore((s) => s.isPaused);
  const isVictory = useGameStore((s) => s.isVictory);
  const settings = useGameStore((s) => s.settings);
  const hintsUsed = useGameStore((s) => s.hintsUsed);
  const selectTube = useGameStore((s) => s.selectTube);
  const undo = useGameStore((s) => s.undo);
  const redo = useGameStore((s) => s.redo);
  const restart = useGameStore((s) => s.restart);
  const startTimer = useGameStore((s) => s.startTimer);
  const tickTimer = useGameStore((s) => s.tickTimer);
  const setPaused = useGameStore((s) => s.setPaused);
  const incrementHints = useGameStore((s) => s.incrementHints);
  const saveGame = useGameStore((s) => s.saveGame);
  const initLevel = useGameStore((s) => s.initLevel);
  const ensureLevelExists = useLevelStore((s) => s.ensureLevelExists);
  const unlockNextLevel = useLevelStore((s) => s.unlockNextLevel);
  const saveProgress = useLevelStore((s) => s.saveProgress);

  const { light, medium, heavy } = useHaptics();
  const { playTap, playPour, playWin } = useSound();

  const [highlightedSource, setHighlightedSource] = useState<number | null>(null);
  const [highlightedDest, setHighlightedDest] = useState<number | null>(null);
  const [showVictory, setShowVictory] = useState(false);
  const [loadingNext, setLoadingNext] = useState(false);

  const victoryScale = useRef(new Animated.Value(0.8)).current;
  const victoryOpacity = useRef(new Animated.Value(0)).current;

  const theme = getTheme(settings.theme);
  const { width } = Dimensions.get('window');

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const levelLoaded = useRef(false);

  useEffect(() => {
    if (levelLoaded.current) return;
    levelLoaded.current = true;
    const loadLevel = async () => {
      const levelId = route.params?.levelId;
      const levelData = route.params?.levelData;
      if (levelData) {
        initLevel(levelData);
      } else if (levelId) {
        const data = await ensureLevelExists(levelId);
        if (data) initLevel(data);
      }
      startTimer();
    };
    loadLevel();
  }, []);

  useEffect(() => {
    if (timer >= 0 && !isPaused && !isVictory) {
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          tickTimer();
        }, 1000);
      }
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPaused, isVictory]);

  useEffect(() => {
    if (isVictory) {
      heavy();
      playWin();
      setShowVictory(true);
      unlockNextLevel();
      saveProgress();
      saveGame();

      Animated.parallel([
        Animated.spring(victoryScale, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        }),
        Animated.timing(victoryOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      setShowVictory(false);
      victoryScale.setValue(0.8);
      victoryOpacity.setValue(0);
    }
  }, [isVictory]);

  const handleTubePress = useCallback((index: number) => {
    if (isVictory || isPaused) return;
    light();
    playTap();
    selectTube(index);
    if (board) {
      const movesLength = useGameStore.getState().moves;
      if (movesLength > 0 && movesLength % 3 === 0) {
        saveGame();
      }
    }
  }, [isVictory, isPaused, selectTube, light, playTap, board]);

  const handleUndo = useCallback(() => {
    if (isVictory || isPaused) return;
    light();
    playTap();
    undo();
  }, [isVictory, isPaused, undo, light, playTap]);

  const handleRestart = useCallback(() => {
    medium();
    playTap();
    setPaused(false);
    restart();
    startTimer();
  }, [restart, setPaused, startTimer, medium, playTap]);

  const handlePause = useCallback(() => {
    light();
    playTap();
    setPaused(true);
  }, [setPaused, light, playTap]);

  const handleResume = useCallback(() => {
    light();
    playTap();
    setPaused(false);
  }, [setPaused, light, playTap]);

  const handleQuit = useCallback(() => {
    setPaused(false);
    light();
    playTap();
    navigation.goBack();
  }, [setPaused, light, playTap, navigation]);

  const handleHint = useCallback(() => {
    if (isVictory || isPaused) return;
    const state = useGameStore.getState();
    if (!state.board) return;
    const validMoves = getValidMoves(state.board);
    if (validMoves.length === 0) return;
    const move = validMoves[0];
    incrementHints();
    light();
    playTap();
    setHighlightedSource(move.source);
    setTimeout(() => {
      setHighlightedSource(null);
      setHighlightedDest(move.destination);
      medium();
      setTimeout(() => {
        setHighlightedDest(null);
        selectTube(move.source);
        setTimeout(() => {
          selectTube(move.destination);
        }, 200);
      }, 800);
    }, 600);
  }, [isVictory, isPaused, incrementHints, light, medium, playTap, selectTube]);

  const handleNextLevel = useCallback(async () => {
    setShowVictory(false);
    setVictoryCleanup();
    setLoadingNext(true);
    const nextLevelId = level + 1;
    const data = await ensureLevelExists(nextLevelId);
    setLoadingNext(false);
    if (data) {
      initLevel(data);
      startTimer();
    }
  }, [level, ensureLevelExists, initLevel, startTimer, navigation]);

  const handleReplay = useCallback(() => {
    setShowVictory(false);
    setVictoryCleanup();
    handleRestart();
  }, [handleRestart]);

  const handleHome = useCallback(() => {
    setShowVictory(false);
    setVictoryCleanup();
    navigation.goBack();
  }, [navigation]);

  const setVictoryCleanup = () => {
    useGameStore.getState().setVictory(false);
  };

  const handleSoundToggle = useCallback(() => {
    useGameStore.getState().setSettings({ soundEnabled: !settings.soundEnabled });
    light();
  }, [settings.soundEnabled, light]);

  if (!board) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: theme.background }}>
        <Text className="text-lg" style={{ color: theme.text }}>Loading level...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background, paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-4 py-3" style={{ backgroundColor: theme.surface }}>
        <Text className="text-base font-semibold" style={{ color: theme.text }}>
          Level {level}
        </Text>
        <View className="flex-row items-center space-x-5">
          <View className="flex-row items-center">
            <Text className="mr-1 text-sm" style={{ color: theme.textSecondary }}>🎯</Text>
            <Text className="text-sm font-medium" style={{ color: theme.text }}>{moves}</Text>
          </View>
          <View className="flex-row items-center">
            <Text className="mr-1 text-sm" style={{ color: theme.textSecondary }}>⏱</Text>
            <Text className="text-sm font-medium" style={{ color: theme.text }}>{formatTime(timer)}</Text>
          </View>
          <TouchableOpacity onPress={handleUndo} activeOpacity={0.7} className="p-1">
            <Text className="text-lg" style={{ color: theme.textSecondary }}>↩</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePause} activeOpacity={0.7} className="p-1">
            <Text className="text-lg" style={{ color: theme.primary }}>⏸</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1 justify-center">
        <GameBoard
          tubes={board.tubes}
          capacity={board.capacity}
          selectedTube={selectedTube}
          onTubePress={handleTubePress}
          highlightedSource={highlightedSource}
          highlightedDest={highlightedDest}
          theme={settings.theme}
        />
      </View>

      <View
        className="flex-row items-center justify-around px-6 py-4"
        style={{ backgroundColor: theme.surface }}
      >
        <TouchableOpacity
          className="items-center justify-center w-12 h-12 rounded-full"
          style={{ backgroundColor: theme.card }}
          onPress={handleHint}
          activeOpacity={0.7}
        >
          <Text className="text-xl">💡</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center justify-center w-12 h-12 rounded-full"
          style={{ backgroundColor: theme.card }}
          onPress={handleRestart}
          activeOpacity={0.7}
        >
          <Text className="text-xl" style={{ color: theme.secondary }}>↻</Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="items-center justify-center w-12 h-12 rounded-full"
          style={{ backgroundColor: settings.soundEnabled ? theme.primary : theme.card }}
          onPress={handleSoundToggle}
          activeOpacity={0.7}
        >
          <Text className="text-xl">{settings.soundEnabled ? '🔊' : '🔇'}</Text>
        </TouchableOpacity>
      </View>

      {isPaused && (
        <View className="absolute inset-0 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View
            className="items-center py-10 px-12 rounded-3xl"
            style={{ backgroundColor: theme.card, width: width * 0.75 }}
          >
            <Text className="text-2xl font-bold mb-8" style={{ color: theme.text }}>PAUSED</Text>
            <TouchableOpacity
              className="w-full py-3 rounded-xl items-center mb-3"
              style={{ backgroundColor: theme.primary }}
              onPress={handleResume}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-base">Resume</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-full py-3 rounded-xl items-center mb-3"
              style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.primary }}
              onPress={handleRestart}
              activeOpacity={0.8}
            >
              <Text className="font-bold text-base" style={{ color: theme.primary }}>Restart</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="w-full py-3 rounded-xl items-center"
              style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.textSecondary }}
              onPress={handleQuit}
              activeOpacity={0.8}
            >
              <Text className="font-bold text-base" style={{ color: theme.textSecondary }}>Quit to Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {showVictory && (
        <Modal transparent visible={showVictory} animationType="none">
          <View className="flex-1 items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Animated.View
              className="items-center py-10 px-8 rounded-3xl"
              style={{
                backgroundColor: theme.card,
                width: width * 0.8,
                opacity: victoryOpacity,
                transform: [{ scale: victoryScale }],
                padding: 10
              }}
            >
              <Text className="text-5xl mb-2">🎉</Text>
              <Text className="text-3xl font-bold mb-2" style={{ color: theme.success }}>Level Complete!</Text>
              <View className="w-full flex-row justify-around mb-4">
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: theme.text }}>{moves}</Text>
                  <Text className="text-sm" style={{ color: theme.textSecondary }}>Moves</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: theme.text }}>{formatTime(timer)}</Text>
                  <Text className="text-sm" style={{ color: theme.textSecondary }}>Time</Text>
                </View>
                <View className="items-center">
                  <Text className="text-2xl font-bold" style={{ color: theme.text }}>{hintsUsed}</Text>
                  <Text className="text-sm" style={{ color: theme.textSecondary }}>Hints</Text>
                </View>
              </View>
              <AdPlaceholder />
              <TouchableOpacity
                className="w-full py-3 rounded-xl items-center mb-3"
                style={{ backgroundColor: theme.primary, opacity: loadingNext ? 0.6 : 1 }}
                onPress={handleNextLevel}
                activeOpacity={0.8}
                disabled={loadingNext}
              >
                <Text className="text-white font-bold text-base">{loadingNext ? 'Loading...' : 'Next Level'}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-full py-3 rounded-xl items-center mb-3"
                style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.primary }}
                onPress={handleReplay}
                activeOpacity={0.8}
              >
                <Text className="font-bold text-base" style={{ color: theme.primary }}>Replay</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="w-full py-3 rounded-xl items-center"
                style={{ backgroundColor: theme.card, borderWidth: 1, borderColor: theme.textSecondary }}
                onPress={handleHome}
                activeOpacity={0.8}
              >
                <Text className="font-bold text-base" style={{ color: theme.textSecondary }}>Home</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </Modal>
      )}
    </View>
  );
}
