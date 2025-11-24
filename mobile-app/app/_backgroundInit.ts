import { useEffect } from 'react';
import { registerBackgroundMessageChecker } from './backgroundMessageChecker';

export default function useBackgroundInit() {
  useEffect(() => {
    registerBackgroundMessageChecker();
  }, []);
}
