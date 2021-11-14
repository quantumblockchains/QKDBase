import { log } from '../utils/log';
import { buildPeer } from './buildPeer';

const onSuccess = () => log('\x1b[31m CONSENSUS ACHIEVED\x1b[0m');
const onError = () => console.log('Error happened');
buildPeer(onSuccess, onError);
