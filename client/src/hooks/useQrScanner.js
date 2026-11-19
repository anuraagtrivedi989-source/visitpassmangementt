import { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function useQrScanner(isOpen, onDetected) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const scanner = new Html5QrcodeScanner(
      'visitpass-qr-reader',
      { fps: 8, qrbox: { width: 220, height: 220 } },
      false,
    );
    scanner.render((decodedText) => {
      onDetected(decodedText);
      scanner.clear().catch(() => {});
    }, () => {});
    return () => { scanner.clear().catch(() => {}); };
  }, [isOpen, onDetected]);
}
