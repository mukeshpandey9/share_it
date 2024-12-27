import React, {FC, useState, useEffect} from 'react';
import {Modal, View, TouchableOpacity, ActivityIndicator} from 'react-native';
import {modalStyles} from '../../styles/modalStyles';
import CustomText from '../global/CustomText';
import Icon from '../global/Icon';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import QRCode from 'react-native-qrcode-svg';

import LinearGradient from 'react-native-linear-gradient';
import {multiColor} from '../../utils/Constants';
import DeviceInfo from 'react-native-device-info';
import {useTCP} from '../../service/TCPProvider';
import {navigate} from '../../utils/NavigationUtil';
import {getLocalIPAddress} from '../../utils/networkUtils';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
}

const QRGenerateModal: FC<ModalProps> = ({visible, onClose}) => {
  const [loading, setLoading] = useState(true);
  const [qrValue, setQrValue] = useState('');

  const {isConnected, startServer, server} = useTCP();

  const shimmerTranslateX = useSharedValue(-300);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{translateX: shimmerTranslateX.value}],
  }));

  const setUpServer = async () => {
    const deviceName = await DeviceInfo.getDeviceName();
    const ip = await getLocalIPAddress();
    const port = 4000;

    if (server) {
      setQrValue(`tcp://${ip}:${port}|${deviceName}`);
      setLoading(false);
      return;
    }

    startServer(port);
    setQrValue(`tcp://${ip}:${port}|${deviceName}`);
    console.log('Server info: ', ip, ':', port);

    setLoading(false);
  };

  useEffect(() => {
    shimmerTranslateX.value = withRepeat(
      withTiming(300, {duration: 1500, easing: Easing.linear}),
      -1,
      false,
    );

    if (visible) {
      setLoading(false);
      setUpServer();
    }
  }, [visible]);

  useEffect(() => {
    console.log('TCP PRovide conee');
    if (isConnected) {
      onClose();
      navigate('ConnectionScreen');
    }
  }, [isConnected]);

  return (
    <Modal
      animationType="slide"
      visible={visible}
      presentationStyle="formSheet"
      onRequestClose={onClose}
      onDismiss={onClose}>
      <View style={modalStyles.modalContainer}>
        {/* QR Code Container */}
        <View style={modalStyles.qrContainer}>
          {loading || qrValue == null || qrValue == '' ? (
            <View style={modalStyles.skeleton}>
              <Animated.View style={[modalStyles.shimmerOverlay, shimmerStyle]}>
                <LinearGradient
                  colors={['#f3f3f3', '#fff', '#f3f3f3']}
                  start={{x: 0, y: 0}}
                  end={{x: 1, y: 0}}
                  style={modalStyles.shimmerGradient}
                />
              </Animated.View>
            </View>
          ) : (
            <>
              <QRCode
                value={qrValue}
                size={250}
                logoSize={60}
                logoBackgroundColor="#fff"
                logoMargin={2}
                logoBorderRadius={10}
                logo={require('../../assets/images/profile.jpg')}
                linearGradient={multiColor}
                enableLinearGradient
              />
            </>
          )}
        </View>

        {/* Information Text */}
        <View style={modalStyles.info}>
          <CustomText style={modalStyles.infoText1}>
            Ensure you're on the same Wi-Fi network.
          </CustomText>
          <CustomText style={modalStyles.infoText2}>
            Ask the sender to scan the QR code to connect and transfer files.
          </CustomText>
        </View>

        {/* Loading Indicator */}

        <ActivityIndicator
          size="small"
          color="#000"
          style={{alignSelf: 'center'}}
        />

        {/* Close Button */}
        <TouchableOpacity onPress={onClose} style={modalStyles.closeButton}>
          <Icon name="close" iconFamily="Ionicons" size={24} color="#000" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default QRGenerateModal;
