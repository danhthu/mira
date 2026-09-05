/**
 * Xuất toàn bộ dữ liệu ra JSON — `05-v1-spec.md` §Settings và §Definition of Done #6.
 * Xuất thật: nội dung lấy từ mọi khoá đang có trên máy, ghi ra một file người dùng
 * cầm được, không phải nút bấm rồi thôi.
 */

import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { EXPORT_FILE_PREFIX, EXPORT_FORMAT_VERSION } from '../constants';
import { readStorage, storageKeys } from './stores';

export interface ExportBundle {
  readonly version: number;
  readonly exportedAt: string;
  /** Khoá kho → nội dung. Giá trị JSON được nạp lại thành object cho dễ đọc. */
  readonly stores: Readonly<Record<string, unknown>>;
}

function parseIfJson(raw: string): unknown {
  const trimmed = raw.trim();
  const looksStructured =
    (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
    (trimmed.startsWith('[') && trimmed.endsWith(']'));
  return looksStructured ? JSON.parse(trimmed) : raw;
}

export async function buildExportBundle(at: Date): Promise<ExportBundle> {
  const keys = (await storageKeys()).sort();
  const stores: Record<string, unknown> = {};
  const values = await Promise.all(keys.map((key) => readStorage(key)));
  keys.forEach((key, index) => {
    const raw = values[index];
    stores[key] = raw === null ? null : parseIfJson(raw);
  });
  return {
    version: EXPORT_FORMAT_VERSION,
    exportedAt: at.toISOString(),
    stores,
  };
}

export function exportFileName(at: Date): string {
  return EXPORT_FILE_PREFIX + at.toISOString().replace(/[:.]/g, '-') + '.json';
}

/** Số khoá đã xuất và nơi file nằm — màn Cài đặt hiện lại cho người dùng thấy. */
export interface ExportResult {
  readonly storeCount: number;
  readonly location: string;
}

function saveOnWeb(json: string, fileName: string): string {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return fileName;
}

export async function exportAllData(at: Date): Promise<ExportResult> {
  const bundle = await buildExportBundle(at);
  const json = JSON.stringify(bundle, null, 2);
  const fileName = exportFileName(at);
  const storeCount = Object.keys(bundle.stores).length;

  if (Platform.OS === 'web') {
    return { storeCount, location: saveOnWeb(json, fileName) };
  }

  const path = FileSystem.documentDirectory + fileName;
  await FileSystem.writeAsStringAsync(path, json);
  return { storeCount, location: path };
}
