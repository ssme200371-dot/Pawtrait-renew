export type ViewState = 'LANDING' | 'STUDIO' | 'RESULT' | 'CHECKOUT';

export type StyleCategory = 'CLASSIC' | 'MODERN' | 'EMOTIONAL';

export interface UserProfile {
  id: string;        // Login ID
  password?: string; // Stored for mock auth
  name: string;      // Real Name (Depositor)
  nickname: string;  // Display Name
  email: string;     // Email for notifications
  isAdmin?: boolean; // Admin Flag
  credits?: number;  // User balance
}

export interface PaymentRequest {
  id: string;
  userId: string;
  userName: string;
  userNickname: string;
  userEmail: string;   // Added for admin notification
  amount: number;      // Price in KRW
  credits: number;     // Credits to add
  packageName: string;
  timestamp: string;   // ISO String
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface UserNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'PAYMENT' | 'SYSTEM' | 'GENERATE';
}

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  thumbnailUrl: string;
  category: StyleCategory;
  recommendedFor: string;
  tags: string[];
}

export interface GeneratedImage {
  id: string;
  url: string;
  styleId: string;
  styleName: string;
  date: string;
}

export type ProductType = 'DIGITAL' | 'CANVAS' | 'CREDIT';

export interface CartItem {
  imageId: string;
  productType: ProductType;
  price: number;
}

export interface Review {
  id: string | number;
  user: string;
  rating: number;
  text: string;
  beforeImage: string;
  afterImage: string;
  password?: string; // For guest deletion
  date?: string;
  userId?: string; // For logged-in user ownership
}