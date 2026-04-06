declare class BarcodeDetector {
  constructor(options?: { formats?: string[] });
  static getSupportedFormats?: () => Promise<string[]>;
  detect(source: ImageBitmapSource): Promise<DetectedBarcode[]>;
}

interface DetectedBarcode {
  rawValue?: string;
  format?: string;
}
