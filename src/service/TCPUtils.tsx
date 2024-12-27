import {Alert} from 'react-native';
import {useChunkStore} from '../db/chunkStore';
import {produce} from 'immer';
import {Buffer} from 'buffer';

export const receiveFileAck = async (
  data: any,
  socket: any,
  setReceivedFiles: any,
) => {
  const {chunkStore, setChunkStorage} = useChunkStore.getState();

  if (chunkStore) {
    Alert.alert('Wait! Some files are remaining');
    return;
  }

  setReceivedFiles((prev: any) =>
    produce(prev, (draft: any) => {
      draft.push(data);
    }),
  );

  setChunkStorage({
    id: data?.id,
    totalChunks: data?.totalChunks,
    name: data?.name,
    size: data?.size,
    mimeType: data?.mimeType,
    chunkArray: [],
  });

  if (!socket) {
    console.log('Socket Not Available');
    return;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 10));
    console.log('FILE RECEIVED');

    socket.write(JSON.stringify({event: 'send_chunk_ack', chunkNo: 0}));

    console.log('REQUESTING FOR FIRST CHUNK');
  } catch (error) {
    console.log('Error sending file: ', error);
  }
};

export const sendChunkAck = async (
  chunkIndex: number,
  socket: any,
  setTotalSentBytes: any,
  setSentFiles: any,
) => {
  const {currentChunkSet, resetCurrentChunkSet} = useChunkStore.getState();

  if (!currentChunkSet) {
    Alert.alert('There is no chuks to be sent');
    return;
  }

  if (!socket) {
    console.log('Socket is not Available');
    return;
  }

  const totalChunks = currentChunkSet?.totalChunks;

  try {
    await new Promise(resolve => setTimeout(resolve, 10));

    socket.write(
      JSON.stringify({
        event: 'receive_chunk_ack',
        chunk: currentChunkSet?.chunkArray[chunkIndex]?.toString('base64'),
        chunkNo: chunkIndex,
      }),
    );

    setTotalSentBytes(
      (prev: number) => prev + currentChunkSet?.chunkArray[chunkIndex]?.length,
    );

    if (chunkIndex + 2 > totalChunks) {
      console.log('All chunks sent successfully!');
      setSentFiles((prevFiles: any) =>
        produce(prevFiles, (draftFiles: any) => {
          const fileIndex = draftFiles?.findIndex(
            (f: any) => f.id === currentChunkSet.id,
          );
          if (fileIndex !== -1) {
            draftFiles[fileIndex].available = true;
          }
        }),
      );

      resetCurrentChunkSet();
    }
  } catch (error) {
    console.log('Error sending file: ', error);
  }
};

export const receiveChunkAck = async (
  chunk: any,
  chunkNo: number,
  socket: any,
  setTotalReceivedBytes: any,
  generateFile: any,
) => {
  const {chunkStore, resetChunkStorage, resetCurrentChunkSet, setChunkStorage} =
    useChunkStore.getState();

  if (!chunkStore) {
    console.log('Chunk store is null');
    return;
  }

  try {
    const bufferChunk = await Buffer.from(chunk, 'base64');
    const updatedChunkArray = [...(chunkStore?.chunkArray || [])];
    updatedChunkArray[chunkNo] = bufferChunk;

    setChunkStorage({
      ...chunkStore,
      chunkArray: updatedChunkArray,
    });

    setTotalReceivedBytes((prev: number) => prev + bufferChunk.length);
  } catch (error) {
    console.log('Error Updating chunk', error);
  }

  if (!socket) {
    console.log('Socket not available');
    return;
  }

  if (chunkNo + 1 === chunkStore?.totalChunks) {
    console.log('All chunks Received');
    resetCurrentChunkSet();
    generateFile();
    resetChunkStorage();
    return;
  }

  try {
    await new Promise(resolve => setTimeout(resolve, 10));

    console.log('REquested for next chunk');

    socket.write(
      JSON.stringify({event: 'send_chunk_ack', chunkNo: chunkNo + 1}),
    );
  } catch (error) {
    console.log('Error sending file: ', error);
  }
};
