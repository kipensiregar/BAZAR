import { Transaction, ReceiptSettings } from '../types';
import { generateReceiptText } from './formatters';

// ESC/POS Command Constants
const ESC = 0x1B;
const GS = 0x1D;

export function buildEscPosBytes(transaction: Transaction, settings: ReceiptSettings): Uint8Array {
  const encoder = new TextEncoder();
  const text = generateReceiptText(transaction, settings);
  
  const commands: number[] = [
    ESC, 0x40, // Initialize printer
    ESC, 0x74, 0x00, // Character code table: USA / Standard Europe
    ESC, 0x61, 0x01, // Center align for header
  ];

  // Store name emphasized
  const storeNameBytes = encoder.encode(settings.storeName.toUpperCase() + '\n');
  commands.push(ESC, 0x21, 0x10); // Double height
  commands.push(...Array.from(storeNameBytes));
  commands.push(ESC, 0x21, 0x00); // Normal text

  // Subtitle
  if (settings.bazaarEvent) {
    commands.push(...Array.from(encoder.encode(settings.bazaarEvent + '\n')));
  }
  if (settings.boothNumber) {
    commands.push(...Array.from(encoder.encode(settings.boothNumber + '\n')));
  }
  commands.push(...Array.from(encoder.encode('--------------------------------\n')));

  // Left align body
  commands.push(ESC, 0x61, 0x00);

  // Content lines
  const lines = text.split('\n').slice(4); // Skip manual header since we formatted it with ESC
  for (const line of lines) {
    commands.push(...Array.from(encoder.encode(line + '\n')));
  }

  // Paper Feed & Cut
  commands.push(0x0A, 0x0A, 0x0A, 0x0A); // 4 line feeds
  commands.push(GS, 0x56, 0x42, 0x00); // Partial cut

  return new Uint8Array(commands);
}

// Interfaces for Web Bluetooth
export interface BluetoothCharacteristicType {
  properties: { write?: boolean; writeWithoutResponse?: boolean };
  writeValue?: (value: BufferSource) => Promise<void>;
  writeValueWithoutResponse?: (value: BufferSource) => Promise<void>;
}

export interface BluetoothGATTServerType {
  connect: () => Promise<BluetoothGATTServerType>;
  getPrimaryServices: () => Promise<Array<{ getCharacteristics: () => Promise<BluetoothCharacteristicType[]> }>>;
}

export interface BluetoothDeviceType {
  name?: string;
  gatt?: BluetoothGATTServerType;
}

export interface BluetoothDeviceState {
  device: BluetoothDeviceType | null;
  server: BluetoothGATTServerType | null;
  characteristic: BluetoothCharacteristicType | null;
  name: string;
  connected: boolean;
}

// Thermal printer common service & characteristic UUIDs
const KNOWN_SERVICES = [
  '000018f0-0000-1000-8000-00805f9b34fb', // Standard Serial / Printer
  'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
  '49535343-fe7d-4ae5-8fa9-9fafd205e455',
  0xff00,
  0x18f0,
];

let globalPrinterState: BluetoothDeviceState = {
  device: null,
  server: null,
  characteristic: null,
  name: '',
  connected: false,
};

export async function connectBluetoothPrinter(): Promise<{ success: boolean; message: string; deviceName?: string }> {
  // Check if Web Bluetooth API is supported
  const nav = navigator as unknown as { bluetooth?: { requestDevice: (options: unknown) => Promise<BluetoothDeviceType> } };
  if (!nav.bluetooth) {
    return {
      success: false,
      message: 'Browser ini tidak mendukung Web Bluetooth. Untuk iPad, gunakan opsi Cetak AirPrint / Browser Print (window.print).',
    };
  }

  try {
    const device = await nav.bluetooth.requestDevice({
      acceptAllDevices: true,
      optionalServices: KNOWN_SERVICES,
    });

    if (!device.gatt) {
      return { success: false, message: 'Perangkat tidak memiliki profil GATT.' };
    }

    const server = await device.gatt.connect();
    
    // Find primary service & writable characteristic
    let foundChar: BluetoothCharacteristicType | null = null;
    const services = await server.getPrimaryServices().catch(() => []);

    for (const service of services) {
      try {
        const characteristics = await service.getCharacteristics();
        for (const char of characteristics) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            foundChar = char;
            break;
          }
        }
      } catch {
        // continue search
      }
      if (foundChar) break;
    }

    if (!foundChar) {
      return {
        success: false,
        message: 'Berhasil terhubung tetapi karakteristik cetak tidak ditemukan pada printer ini.',
      };
    }

    globalPrinterState = {
      device,
      server,
      characteristic: foundChar,
      name: device.name || 'Printer Bluetooth',
      connected: true,
    };

    return {
      success: true,
      message: `Terhubung ke printer "${device.name || 'Bluetooth'}"`,
      deviceName: device.name || 'Printer Bluetooth',
    };
  } catch (err: unknown) {
    const error = err as Error;
    return {
      success: false,
      message: error.name === 'NotFoundError' ? 'Pencarian perangkat dibatalkan.' : (error.message || 'Gagal menyambungkan Bluetooth.'),
    };
  }
}

export function getBluetoothPrinterState(): BluetoothDeviceState {
  return globalPrinterState;
}

export async function printViaBluetooth(transaction: Transaction, settings: ReceiptSettings): Promise<{ success: boolean; message: string }> {
  if (!globalPrinterState.connected || !globalPrinterState.characteristic) {
    return {
      success: false,
      message: 'Belum terhubung ke printer Bluetooth. Silakan hubungkan printer terlebih dahulu atau gunakan Cetak AirPrint/Browser.',
    };
  }

  try {
    const rawData = buildEscPosBytes(transaction, settings);
    // Bluetooth MTU is typically 20-512 bytes, split into chunks of 100 bytes
    const CHUNK_SIZE = 100;
    for (let i = 0; i < rawData.length; i += CHUNK_SIZE) {
      const chunk = rawData.slice(i, i + CHUNK_SIZE);
      if (globalPrinterState.characteristic.properties.writeWithoutResponse) {
        await globalPrinterState.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await globalPrinterState.characteristic.writeValue(chunk);
      }
      // Small pause to prevent buffer overflow on thermal mini printers
      await new Promise((resolve) => setTimeout(resolve, 30));
    }

    return { success: true, message: 'Struk berhasil dikirim ke printer Bluetooth!' };
  } catch (err: unknown) {
    const error = err as Error;
    return { success: false, message: `Gagal mencetak via Bluetooth: ${error.message}` };
  }
}
