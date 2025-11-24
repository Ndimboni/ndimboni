declare module 'react-native-get-sms-android' {
  const smsAndroid: {
    list(
      filter: string,
      failure: (error: unknown) => void,
      success: (count: number, list: string) => void
    ): void;
  };
  export default smsAndroid;
}
