import {View, Text, Platform, StatusBar} from 'react-native';
import React, {useEffect} from 'react';
import Navigation from './src/navigation/Navigation';
import {requestPhotoPermission} from './src/utils/Constants';
import {checkFilePermissions} from './src/utils/libraryHelpers';
import {TCPProvider} from './src/service/TCPProvider';

const App = () => {
  useEffect(() => {
    requestPhotoPermission();
    checkFilePermissions(Platform.OS);
  }, []);
  return (
    <>
      <TCPProvider>
        <StatusBar backgroundColor={'#007AFF'} barStyle={'light-content'} />
        <Navigation />
      </TCPProvider>
    </>
  );
};

export default App;
