import React from 'react';
import { View, Text, useWindowDimensions, ViewStyle, StyleProp } from 'react-native';

interface AdPlaceholderProps {
  width?: number;
  height?: number;
  /** Allows passing standard React Native styles */
  style?: StyleProp<ViewStyle>;
  /** Allows appending extra NativeWind/Tailwind classes */
  className?: string; 
}

export default function AdPlaceholder({ 
  width = 300, 
  height = 200,
  style,
  className = ""
}: AdPlaceholderProps) {
  const { width: screenWidth } = useWindowDimensions();
  
  // Responsive Logic: 
  // Prevent the ad from overflowing the screen by applying a safe margin (e.g., 32px total).
  // This is generally safer than a strict 70% restriction, which might make ads too small on tablets.
  const HORIZONTAL_MARGIN = 32; 
  const maxAvailableWidth = screenWidth - HORIZONTAL_MARGIN;
  
  // The rendered width is either the requested width or the max available screen width
  const responsiveWidth = Math.min(width, maxAvailableWidth);
  
  // Calculate scale to maintain the exact aspect ratio
  const scale = responsiveWidth / width;
  const responsiveHeight = height * scale;

  return (
    <View
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={`Advertisement placeholder, ${Math.round(responsiveWidth)} by ${Math.round(responsiveHeight)}`}
      className={`items-center justify-center rounded-2xl my-4 p-4 ${className}`}
      style={[
        {
          width: responsiveWidth,
          height: responsiveHeight,
          borderWidth: 2,
          borderColor: '#94a3b8',
          borderStyle: 'dashed',
          backgroundColor: 'rgba(148, 163, 184, 0.08)',
        },
        style
      ]}
    >
      <Text 
        className="text-center text-xs font-semibold mb-1.5" 
        style={{ color: '#94a3b8', letterSpacing: 0.8, textTransform: 'uppercase' }}
      >
        Advertisement
      </Text>
      <Text 
        className="text-center text-xs opacity-80" 
        style={{ color: '#94a3b8' }}
      >
        {Math.round(responsiveWidth)} × {Math.round(responsiveHeight)}
      </Text>
    </View>
  );
}