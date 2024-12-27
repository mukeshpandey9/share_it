import React from 'react';
import {View, Text, StyleSheet, Image} from 'react-native';
import CustomText from '../global/CustomText';
import {commonStyles} from '../../styles/commonStyles';

const Misc = () => {
  return (
    <View style={styles.container}>
      <CustomText fontSize={13} fontFamily="Okra-Bold">
        Explore
      </CustomText>
      <Image
        style={styles.adBanner}
        source={require('../../assets/icons/wild_robot.jpg')}
      />
      <View style={commonStyles.flexRowBetween}>
        <CustomText fontFamily="Okra-Bold" fontSize={24} style={styles.text}>
          #1 World Best File Sharing App!
        </CustomText>
        <Image
          source={require('../../assets/icons/share_logo.jpg')}
          style={styles.image}
        />
      </View>

      <CustomText fontFamily="Okra-Bold" style={styles.text2}>
        Made with love - Mukesh Pandey
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  adBanner: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 10,
    marginVertical: 25,
  },
  text: {
    opacity: 0.5,
    width: '60%',
  },
  image: {
    resizeMode: 'contain',
    height: 120,
    width: '35%',
  },
  text2: {
    opacity: 0.5,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Misc;
