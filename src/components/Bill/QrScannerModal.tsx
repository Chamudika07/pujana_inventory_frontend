import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';

interface QrScannerModalProps {
  show: boolean;
  onHide: () => void;
  onDetected: (rawValue: string) => Promise<void>;
}

const SCAN_FORMATS = ['qr_code', 'code_128', 'ean_13', 'ean_8'];

const QrScannerModal: React.FC<QrScannerModalProps> = ({ show, onHide, onDetected }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const detectorRef = useRef<BarcodeDetector | null>(null);
  const isResolvingRef = useRef(false);

  const [manualValue, setManualValue] = useState('');
  const [loadingCamera, setLoadingCamera] = useState(false);
  const [scannerSupported, setScannerSupported] = useState(true);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [resolvingScan, setResolvingScan] = useState(false);

  const stopScanner = () => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const startScanner = async () => {
      if (!show) {
        stopScanner();
        setScannerError(null);
        setManualValue('');
        setResolvingScan(false);
        isResolvingRef.current = false;
        return;
      }

      if (typeof window === 'undefined' || typeof BarcodeDetector === 'undefined') {
        setScannerSupported(false);
        setScannerError('Live camera scanning is not supported on this device. You can paste the QR value manually.');
        return;
      }

      setScannerSupported(true);
      setLoadingCamera(true);
      setScannerError(null);

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false,
        });

        streamRef.current = stream;

        if (!detectorRef.current) {
          detectorRef.current = new BarcodeDetector({ formats: SCAN_FORMATS });
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        const scanFrame = async () => {
          const video = videoRef.current;
          const detector = detectorRef.current;

          if (!video || !detector || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
            frameRef.current = window.requestAnimationFrame(() => {
              void scanFrame();
            });
            return;
          }

          try {
            const codes = await detector.detect(video);
            const rawValue = codes.find((code) => code.rawValue?.trim())?.rawValue?.trim();

            if (rawValue && !isResolvingRef.current) {
              isResolvingRef.current = true;
              setResolvingScan(true);
              try {
                await onDetected(rawValue);
                stopScanner();
                onHide();
                return;
              } catch (error) {
                console.error(error);
                setScannerError('Scan captured, but the item could not be resolved. You can try again or enter the code manually.');
                isResolvingRef.current = false;
                setResolvingScan(false);
              }
            }
          } catch (error) {
            console.error(error);
          }

          frameRef.current = window.requestAnimationFrame(() => {
            void scanFrame();
          });
        };

        frameRef.current = window.requestAnimationFrame(() => {
          void scanFrame();
        });
      } catch (error) {
        console.error(error);
        setScannerError('Camera access was not available. Check browser permission and try again, or enter the QR value manually.');
      } finally {
        setLoadingCamera(false);
      }
    };

    void startScanner();

    return () => {
      stopScanner();
      isResolvingRef.current = false;
      setResolvingScan(false);
    };
  }, [show, onDetected, onHide]);

  const handleManualSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!manualValue.trim()) {
      setScannerError('Enter or paste the scanned code value first.');
      return;
    }

    setResolvingScan(true);
    setScannerError(null);
    try {
      await onDetected(manualValue.trim());
      onHide();
    } catch (error) {
      console.error(error);
      setScannerError('The scanned code could not be resolved. Check the QR code and try again.');
    } finally {
      setResolvingScan(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title>
          <i className="bi bi-qr-code-scan me-2"></i>
          Scan Item Code
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {scannerError && <Alert variant="warning">{scannerError}</Alert>}

        <div className="border rounded-3 bg-dark overflow-hidden position-relative mb-3" style={{ minHeight: '320px' }}>
          {show && scannerSupported ? (
            <>
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-100 h-100"
                style={{ objectFit: 'cover', minHeight: '320px' }}
              />
              <div className="position-absolute top-50 start-50 translate-middle border border-3 border-white rounded-4" style={{ width: '70%', height: '55%' }}></div>
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-100 text-white p-4" style={{ minHeight: '320px' }}>
              <div className="text-center">
                <i className="bi bi-camera-video-off" style={{ fontSize: '2rem' }}></i>
                <p className="mt-3 mb-0">Camera preview is unavailable on this device.</p>
              </div>
            </div>
          )}

          {(loadingCamera || resolvingScan) && (
            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
              <div className="text-center text-white">
                <Spinner animation="border" className="mb-3" />
                <div>{loadingCamera ? 'Starting camera...' : 'Resolving scanned item...'}</div>
              </div>
            </div>
          )}
        </div>

        <p className="text-muted small mb-3">
          Point the camera at the item QR code. Legacy model-number QR codes and the new structured item QR codes are both supported.
        </p>

        <Form onSubmit={handleManualSubmit}>
          <Form.Group>
            <Form.Label className="fw-semibold">Manual Fallback</Form.Label>
            <Form.Control
              type="text"
              placeholder='Paste scanned value, for example {"type":"item","model_number":"MDL-2026-00001"}'
              value={manualValue}
              onChange={(event) => setManualValue(event.target.value)}
              disabled={resolvingScan}
            />
          </Form.Group>
          <div className="d-flex justify-content-end mt-3">
            <Button type="submit" variant="outline-primary" disabled={resolvingScan}>
              Resolve Code
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default QrScannerModal;
