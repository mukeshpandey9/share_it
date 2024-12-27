import {View, Text, TouchableOpacity} from 'react-native';
import React, {FC} from 'react';
import {optionStyles} from '../../styles/optionsStyles';
import Icon from '../global/Icon';
import {Colors} from '../../utils/Constants';
import CustomText from '../global/CustomText';
import {useTCP} from '../../service/TCPProvider';
import {navigate} from '../../utils/NavigationUtil';
import {pickDocument, pickImage} from '../../utils/libraryHelpers';
const Options: FC<{
  isHome?: boolean;
  onMediaPickedUP?: (media: any) => void;
  onFilePickedUP?: (file: any) => void;
}> = ({isHome, onFilePickedUP, onMediaPickedUP}) => {
  const {isConnected} = useTCP();

  const handleUniversalPicker = (type: string) => {
    if (isHome) {
      if (isConnected) {
        navigate('ConnectionScreen');
      } else navigate('SendScreen');
      return;
    }

    if (type === 'images' && onMediaPickedUP) {
      pickImage(onMediaPickedUP);
    }

    if (type === 'file' && onFilePickedUP) {
      pickDocument(onFilePickedUP);
    }
  };

  return (
    <View style={optionStyles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        style={optionStyles.subContainer}
        onPress={() => handleUniversalPicker('images')}>
        <Icon
          name="images"
          iconFamily="Ionicons"
          color={Colors.primary}
          size={22}
        />
        <CustomText
          fontFamily="Okra-Medium"
          style={{marginTop: 4, textAlign: 'center'}}>
          Photo
        </CustomText>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={optionStyles.subContainer}
        onPress={() => handleUniversalPicker('file')}>
        <Icon
          name="musical-notes-sharp"
          iconFamily="Ionicons"
          color={Colors.primary}
          size={22}
        />
        <CustomText
          fontFamily="Okra-Medium"
          style={{marginTop: 4, textAlign: 'center'}}>
          Audio
        </CustomText>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={optionStyles.subContainer}
        onPress={() => handleUniversalPicker('file')}>
        <Icon
          name="folder-open"
          iconFamily="Ionicons"
          color={Colors.primary}
          size={22}
        />
        <CustomText
          fontFamily="Okra-Medium"
          style={{marginTop: 4, textAlign: 'center'}}>
          Files
        </CustomText>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.8}
        style={optionStyles.subContainer}
        onPress={() => handleUniversalPicker('file')}>
        <Icon
          name="contacts"
          iconFamily="MaterialCommunityIcons"
          color={Colors.primary}
          size={22}
        />
        <CustomText
          fontFamily="Okra-Medium"
          style={{marginTop: 4, textAlign: 'center'}}>
          Contacts
        </CustomText>
      </TouchableOpacity>
    </View>
  );
};

export default Options;
