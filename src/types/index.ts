export interface Capsule {
  _id: string;
  title: string;
  message?: string;
  openDate: string;
  createdAt: string;
  hasImages: boolean;
  hasVideos: boolean;
  hasMessage: boolean;
  user: string;
  notificationSent: boolean;
  isOpenable?: boolean;
}

export interface User {
  _id: string;
  name: string;
  email: string;
}

export interface MediaFile {
  _id: string;
  capsuleId: string;
  filename: string;
  fileType: 'image' | 'video';
  path: string;
  createdAt: string;
}