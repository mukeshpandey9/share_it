import React from 'react';
import {Text, TextStyle, StyleProp, Platform, StyleSheet} from 'react-native';
import {RFValue} from 'react-native-responsive-fontsize';
import {Colors} from '../../utils/Constants';

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'h7';
type PlatformType = 'android' | 'ios';

interface CustomTextProps {
  variant?: Variant;
  fontFamily?:
    | 'Okra-Bold'
    | 'Okra-Regular'
    | 'Okra-Black'
    | 'Okra-Light'
    | 'Okra-Medium';
  fontSize?: number;
  color?: string;
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
  numberOfLines?: number;
  onLayout?: (event: any) => void;
}

const fontSizeMap: Record<Variant, Record<PlatformType, number>> = {
  h1: {android: 24, ios: 22},
  h2: {android: 22, ios: 20},
  h3: {android: 20, ios: 18},
  h4: {android: 18, ios: 16},
  h5: {android: 16, ios: 14},
  h6: {android: 14, ios: 12},
  h7: {android: 12, ios: 10},
};

const CustomText: React.FC<CustomTextProps> = ({
  variant = 'h7',
  fontFamily = 'Okra-Regular',
  fontSize,
  color = '#000',
  style,
  children,
  numberOfLines,
  onLayout,
  ...props
}) => {
  const platform: PlatformType = Platform.OS as PlatformType;

  let computedFontSize: number =
    platform === 'android' ? RFValue(fontSize || 12) : RFValue(fontSize || 10);

  if (variant && fontSizeMap[variant]) {
    const defaultSize = fontSizeMap[variant][platform];
    computedFontSize = RFValue(fontSize || defaultSize);
  }

  const fontFamilyStyle = {
    fontFamily,
  };

  return (
    <Text
      style={[
        Styles.text,
        {fontSize: computedFontSize, color: color || Colors.text},
        fontFamilyStyle,
        style,
      ]}
      numberOfLines={numberOfLines}
      onLayout={onLayout}
      {...props}>
      {children}
    </Text>
  );
};

export default CustomText;

const Styles = StyleSheet.create({
  text: {
    textAlign: 'left',
  },
});
