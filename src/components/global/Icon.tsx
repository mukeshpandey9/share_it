import {View, Text} from 'react-native';
import React, {FC} from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {RFValue} from 'react-native-responsive-fontsize';

interface IconProps {
  color?: string;
  name: string;
  size: number;
  iconFamily: 'MaterialCommunityIcons' | 'MaterialIcons' | 'Ionicons';
}

const Icon: FC<IconProps> = ({iconFamily, name, size, color}) => {
  return (
    <>
      {iconFamily === 'Ionicons' && (
        <Ionicons name={name} size={RFValue(size)} color={color} />
      )}
      {iconFamily === 'MaterialCommunityIcons' && (
        <MaterialCommunityIcons
          name={name}
          size={RFValue(size)}
          color={color}
        />
      )}
      {iconFamily === 'MaterialIcons' && (
        <MaterialIcons name={name} size={RFValue(size)} color={color} />
      )}
    </>
  );
};

export default Icon;
