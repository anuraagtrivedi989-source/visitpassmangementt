import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

export default function useQrCode(passId) {
  const [qrData, setQrData] = useState('');

  useEffect(() => {
    let active = true;
    if (!passId) {
      setQrData('');
      return () => { active = false; };
    }
    QRCode.toDataURL(passId, { width: 280, margin: 2 })
      .then((dataUrl) => { if (active) setQrData(dataUrl); })
      .catch(() => { if (active) setQrData(''); });
    return () => { active = false; };
  }, [passId]);

  return qrData;
}
