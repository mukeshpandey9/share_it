import {View, Text, StyleSheet} from 'react-native';
import React, {FC} from 'react';
import CustomText from '../global/CustomText';

const BreakerText: FC<{text: string}> = ({text}) => {
  return (
    <View style={styles.breakerContainer}>
      <View style={styles.horizontalLIne} />
      <CustomText
        style={styles.breakerText}
        fontFamily="Okra-Medium"
        fontSize={12}>
        {text}
      </CustomText>
      <View style={styles.horizontalLIne} />
    </View>
  );
};

export default BreakerText;

const styles = StyleSheet.create({
  breakerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    width: '80%',
  },

  horizontalLIne: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },

  breakerText: {
    marginHorizontal: 10,
    color: 'white',
    opacity: 0.8,
    textAlign: 'center',
  },
});
