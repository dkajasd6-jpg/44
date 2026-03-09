
export type UserRole = 'Worker' | 'Admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  siteId?: string;
  evaluation?: string;
  birthDate?: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
  uploaderRole: UserRole;
  url: string;
}

export interface SafetyReport {
  id: string;
  type: '위험발굴' | '작업중지' | '현장안전점검' | '특별안전교육';
  date: string;
  inspectionStatus?: '일일점검' | '휴가' | '외근' | '현장작업 없음';
  issue?: string;   // 위험발굴/작업중지용
  action?: string;  // 위험발굴/작업중지용
  content?: string; // 현장안전점검용
  imageUrls?: string[]; // 최대 6장 지원
  imageUrl?: string;   // 하위 호환성 유지
  uploadedAt: string;
  uploadedBy: string;
  uploaderRole: UserRole;
}

export interface SiteCategory {
  id: string;
  name: string;
  files: UploadedFile[];
  reports?: SafetyReport[];
  subCategories?: SiteCategory[];
}

export interface ConstructionSite {
  id: string;
  name: string;
  manager: string;
  supervisor: string;
  categories: SiteCategory[];
}
