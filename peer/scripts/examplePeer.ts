import { buildPeer } from '../buildPeer';

const onSuccess = () => console.log('\x1b[31m CONSENSUS ACHIEVED\x1b[0m');
const onError = () => console.log('Error happened');
buildPeer(onSuccess, onError);
