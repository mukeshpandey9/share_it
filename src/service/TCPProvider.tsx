import 'react-native-get-random-values';
import {
  createContext,
  FC,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import {useChunkStore} from '../db/chunkStore';
import TCPSocket from 'react-native-tcp-socket';
import DeviceInfo from 'react-native-device-info';
import {Alert, Platform} from 'react-native';
import RNFS from 'react-native-fs';
import {v4 as uuid} from 'uuid';
import {Buffer} from 'buffer';
import {produce} from 'immer';
import {receiveChunkAck, receiveFileAck, sendChunkAck} from './TCPUtils';

interface TCPContextType {
  server: any;
  client: any;
  isConnected: boolean;
  connectedDevice: any;
  sentFiles: any;
  receivedFiles: any;
  totalSentBytes: number;
  totalReceivedBytes: number;
  startServer: (port: number) => void;
  connectToServer: (host: string, port: number, deviceName: string) => void;
  sendMessage: (message: string) => void;
  sendFileAck: (file: any, type: 'image' | 'file') => void;
  disconnect: () => void;
}

const TCPContext = createContext<TCPContextType | undefined>(undefined);

export const useTCP = (): TCPContextType => {
  const context = useContext(TCPContext);

  if (!context) {
    throw new Error('useTCP must be used within a TCPProvider');
  }

  return context;
};

const options = {
  keystore: require('../../tls_certs/server-keystore.p12'),
};

export const TCPProvider: FC<{children: ReactNode}> = ({children}) => {
  const [server, setServer] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectedDevice, setConnectedDevice] = useState<any>(null);
  const [serverSocket, setServerSocket] = useState<any>();
  const [sentFiles, setSentFiles] = useState<any>([]);
  const [receivedFiles, setReceivedFiles] = useState<any>([]);
  const [totalSentBytes, setTotalSentBytes] = useState<number>(0);
  const [totalReceivedBytes, setTotalReceivedBytes] = useState<number>(0);

  const {currentChunkSet, setChunkStorage, setCurrentChunkSet} =
    useChunkStore();

  // START SERVER
  const startServer = useCallback(
    (port: number) => {
      if (server) {
        console.log('Server is already running!');
        return;
      }

      const newServer = TCPSocket.createTLSServer(options, socket => {
        console.log('Client connected: ', socket.address());
        setServerSocket(socket);
        socket.setNoDelay(true);
        socket.readableHighWaterMark = 1024 * 1024 * 1;
        socket.writableHighWaterMark = 1024 * 1024 * 1;

        socket.on('data', async (data: any) => {
          const parsedData = JSON.parse(data?.toString());

          if (parsedData?.event === 'connect') {
            setIsConnected(true);
            setConnectedDevice(parsedData?.deviceName);
          }

          if (parsedData?.event === 'file_ack') {
            receiveFileAck(parsedData?.file, socket, setReceivedFiles);
          }

          if (parsedData?.event === 'send_chunk_ack') {
            sendChunkAck(
              parsedData?.chunkNo,
              socket,
              setTotalSentBytes,
              setSentFiles,
            );
          }

          if (parsedData?.event === 'receive_chunk_ack') {
            receiveChunkAck(
              parsedData?.chunk,
              parsedData?.chunkNo,
              socket,
              setTotalReceivedBytes,
              generateFile,
            );
          }
        });

        socket.on('close', () => {
          console.log('Client Disconnected');
          setReceivedFiles([]);
          setSentFiles([]);
          setCurrentChunkSet(null);
          setChunkStorage(null);
          setTotalReceivedBytes(0);
          setTotalSentBytes(0);
          setIsConnected(false);
          disconnect();
        });

        socket.on('error', err => {
          console.log('Connection failed', err);
        });
      });

      newServer.listen({port, host: '0.0.0.0'}, () => {
        const address = newServer.address();
        console.log(
          'Server connected on ',
          address?.address,
          ', ',
          address?.port,
        );
      });

      newServer.on('error', err => {
        console.error('Server Error: \n', err);
      });

      setServer(newServer);
    },
    [server],
  );

  // Connect client to the server
  const connectToServer = useCallback(
    (host: string, port: number, deviceName: string) => {
      const newClient = TCPSocket.connectTLS(
        {
          host,
          port,
          cert: true,
          ca: require('../../tls_certs/server-cert.pem'),
        },
        () => {
          setIsConnected(true);
          setConnectedDevice(deviceName);
          const myDeviceName = DeviceInfo.getDeviceNameSync();
          newClient.write(
            JSON.stringify({event: 'connect', deviceName: myDeviceName}),
          );
        },
      );

      newClient.setNoDelay(true);
      newClient.readableHighWaterMark = 1024 * 1024 * 1;
      newClient.writableHighWaterMark = 1024 * 1024 * 1;

      newClient.on('data', async (data: any) => {
        const parsedData = JSON.parse(data?.toString());

        if (parsedData?.event === 'file_ack') {
          receiveFileAck(parsedData?.file, newClient, setReceivedFiles);
        }

        if (parsedData?.event === 'send_chunk_ack') {
          sendChunkAck(
            parsedData?.chunkNo,
            newClient,
            setTotalSentBytes,
            setSentFiles,
          );
        }

        if (parsedData?.event === 'receive_chunk_ack') {
          receiveChunkAck(
            parsedData?.chunk,
            parsedData?.chunkNo,
            newClient,
            setTotalReceivedBytes,
            generateFile,
          );
        }
      });

      newClient.on('close', () => {
        console.log('Disconnected');
        setReceivedFiles([]);
        setSentFiles([]);
        setCurrentChunkSet(null);
        setChunkStorage(null);
        setTotalReceivedBytes(0);
        setTotalSentBytes(0);
        setIsConnected(false);
        disconnect();
      });

      newClient.on('error', err => {
        console.log('Client Error : ', err);
      });

      setClient(newClient);
    },
    [client],
  );

  // DISCONNECT
  const disconnect = useCallback(() => {
    if (client) client.destroy();

    if (server) server.close();
    setReceivedFiles([]);
    setSentFiles([]);
    setCurrentChunkSet(null);
    setChunkStorage(null);
    setTotalReceivedBytes(0);
    setTotalSentBytes(0);
    setIsConnected(false);
  }, [client, server]);

  const sendMessage = useCallback(() => {}, [client, server]);

  // FILE ACKNOWLEDGEMENT
  const sendFileAck = async (file: any, type: 'image' | 'file') => {
    if (currentChunkSet != null) {
      Alert.alert('Wait for the current file to sent');
      return;
    }

    const normalizedPath =
      Platform.OS === 'ios' ? file.uri.replace('file://', '') : file.uri;

    const fileData = await RNFS.readFile(normalizedPath, 'base64');
    const buffer = Buffer.from(fileData, 'base64');
    const CHUNK_SIZE = 1024 * 8;
    let offset = 0;
    let totalChunks = 0;
    let chunkArray = [];

    while (offset < buffer.length) {
      const chunk = buffer.slice(offset, offset + CHUNK_SIZE);
      totalChunks += 1;
      chunkArray.push(chunk);
      offset += chunk.length;
    }

    const rawData = {
      id: uuid(),
      name: type === 'file' ? file.file : file.fileName,
      size: type === 'file' ? file.size : file.fileSize,
      mimeType: type === 'file' ? 'file' : '.jpg',
      totalChunks,
    };

    setCurrentChunkSet({
      id: rawData.id,
      chunkArray,
      totalChunks,
    });

    setSentFiles((prev: any) =>
      produce(prev, (draft: any) => {
        draft.push({
          ...rawData,
          uri: file?.originalPath,
        });
      }),
    );

    const socket = client || serverSocket;

    if (!socket) return;

    try {
      console.log('File Ack Done');
      socket.write(JSON.stringify({event: 'file_ack', file: rawData}));
    } catch (error) {
      console.log('Error Sending file: ', error);
    }
  };

  // GENERATE FILE
  const generateFile = async () => {
    const {chunkStore, resetChunkStorage} = useChunkStore.getState();

    if (!chunkStore) {
      console.log('No chunk file to process');
      return;
    }

    if (chunkStore?.totalChunks !== chunkStore?.chunkArray.length) {
      console.error('Some chunks are missing');
      return;
    }

    try {
      const combinedChunks = Buffer.concat(chunkStore.chunkArray);

      const platformPath =
        Platform.OS === 'ios'
          ? `${RNFS.DocumentDirectoryPath}`
          : `${RNFS.DownloadDirectoryPath}`;

      const filePath = `${platformPath}/${chunkStore.name}`;

      await RNFS.writeFile(
        filePath,
        combinedChunks?.toString('base64'),
        'base64',
      );

      setReceivedFiles((prevFiles: any) =>
        produce(prevFiles, (draftFiles: any) => {
          const fileIndex = draftFiles?.findIndex(
            (f: any) => f.id === chunkStore.id,
          );
          if (fileIndex !== -1) {
            draftFiles[fileIndex] = {
              ...draftFiles[fileIndex],
              uri: filePath,
              available: true,
            };
          }
        }),
      );

      console.log('File saved successfully');
      resetChunkStorage();
    } catch (error) {
      console.error('Error combining chunks or saving file ', error);
    }
  };

  return (
    <TCPContext.Provider
      value={{
        client,
        connectedDevice,
        isConnected,
        receivedFiles,
        sentFiles,
        server,
        totalReceivedBytes,
        totalSentBytes,
        startServer,
        connectToServer,
        disconnect,
        sendFileAck,
        sendMessage,
      }}>
      {children}
    </TCPContext.Provider>
  );
};
