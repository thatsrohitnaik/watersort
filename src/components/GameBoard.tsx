import React from 'react';
import { View } from 'react-native';
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
  return (
    <View className="flex-row flex-wrap justify-center items-center px-4 py-6 bg-gray-100/50 rounded-3xl mx-4 my-2">
      {tubes.map((tube, index) => (
        <View key={index} className="m-2">
          <Tube
            tube={tube}
            capacity={capacity}
            index={index}
            selected={selectedTube === index}
            highlighted={highlightedSource === index || highlightedDest === index}
            onPress={() => onTubePress(index)}
            theme={theme}
          />
        </View>
      ))}
    </View>
  );
};

export default GameBoard;
