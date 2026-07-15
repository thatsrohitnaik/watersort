import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center px-8" style={{ backgroundColor: '#F7FAFC' }}>
          <Text className="text-2xl font-bold mb-2" style={{ color: '#2D3748' }}>
            Oops!
          </Text>
          <Text className="text-base text-center mb-6" style={{ color: '#718096' }}>
            Something went wrong. Please try restarting the app.
          </Text>
          <TouchableOpacity
            className="py-3 px-8 rounded-xl"
            style={{ backgroundColor: '#3182CE' }}
            onPress={this.handleReset}
          >
            <Text className="text-white font-bold text-base">Restart</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children;
  }
}
