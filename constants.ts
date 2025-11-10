
import type { StudentData } from './types';

export const CSV_HEADERS_KEYS: (keyof StudentData)[] = [
  'hoTen',
  'sdtZalo',
  'cccd',
  'tinhThanh',
  'truongThpt',
  'email',
  'nganhHoc',
];

export const DISPLAY_HEADERS: Record<keyof StudentData, string> = {
  hoTen: 'Họ & tên',
  sdtZalo: 'SĐT/ Zalo',
  cccd: 'Căn cước Công dân',
  tinhThanh: 'Tỉnh/ Thành phố (trước sáp nhập)',
  truongThpt: 'Tên trường THPT',
  email: 'Email nhận thông tin/ kết quả xét',
  nganhHoc: 'Ngành học xét',
};
