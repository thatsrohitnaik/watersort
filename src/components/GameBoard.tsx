import React from 'react';
import { View, useWindowDimensions, StyleSheet, Pressable } from 'react-native';
import Tube from './Tube';
import { Color, ThemeName } from '../types';

interface GameBoardProps {
  tubes: Color[][];
  capacity: number;
  selectedTube: number | null;
  onTubePress: (index: number) => void;
  highlightedSource: number | null;
  highlightedDest: number | null;
  theme: ThemeName;
}

const GameBoard: React.FC<GameBoardProps> = ({
  tubes,
  capacity,
  selectedTube,
  onTubePress,
  highlightedSource,
  highlightedDest,
  theme,
}) => {
  const { width: screenWidth } = useWindowDimensions();

  const availableWidth = screenWidth - 64;
  const gap = 12;
  const totalTubes = tubes.length;

  const isSmallScreen = screenWidth < 400;
  const maxColumns = isSmallScreen ? 2 : totalTubes <= 4 ? totalTubes : Math.ceil(totalTubes / 2);
  const columns = Math.min(maxColumns, totalTubes);

  const itemWidth = Math.floor((availableWidth - (columns - 1) * gap) / columns);
  const optimizedWidth = Math.min(Math.max(itemWidth, 50), isSmallScreen ? 100 : 85);

  return (
    <View className="flex-row flex-wrap justify-center items-center px-4 py-6 bg-gray-100/50 rounded-3xl mx-4 my-2">
      {tubes.map((tube, index) => {
        const isSelected = selectedTube === index;
        const isHighlighted = highlightedSource === index || highlightedDest === index;

        return (
          <View 
            key={index} 
            style={[
              styles.tubeWrapper, 
              { width: optimizedWidth, margin: gap / 2 }
            ]}
          >
            <Pressable
              onPress={() => onTubePress(index)}
              accessibilityRole="button"
              accessibilityLabel={`Water tube ${index + 1}`}
              style={({ pressed }) => [
                styles.pressable,
                pressed && styles.pressedState,
                isSelected && styles.selectedScale
              ]}
            >
              <Tube
                tube={tube}
                capacity={capacity}
                index={index}
                selected={isSelected}
                highlighted={isHighlighted}
                onPress={() => onTubePress(index)} // Fallback if Tube handles its own press events internally
                theme={theme}
              />
            </Pressable>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tubeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressable: {
    width: '100%',
    alignItems: 'center',
    transform: [{ scale: 1 }],
  },
  pressedState: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
  selectedScale: {
    transform: [{ scale: 1.05 }],
  }
});

export default GameBoard;