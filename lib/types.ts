export const AGE_GROUPS = ['Kids', 'Teen', 'Adult', 'All ages'] as const;
export const FRAME_SIZES = ['XS (40–44 mm)', 'S (45–48 mm)', 'M (49–52 mm)', 'L (53–56 mm)', 'XL (57+ mm)'] as const;
export const PRODUCT_TYPES = ['Optical', 'Sunglasses'] as const;
export const ORDER_STATUSES = ['Order received', 'Packed', 'Shipped', 'Out for delivery', 'Delivered', 'Cancelled'] as const;
export const REQUEST_STATUSES = ['Requested', 'Reviewing', 'Approved', 'Declined', 'Completed'] as const;

export type AgeGroup = (typeof AGE_GROUPS)[number];

export type Product = {
  id: string;
  name: string;
  type: string;
  price: number;
  color: string;
  badge: string;
  desc: string;
  ageGroup: string;
  frameSize: string;
  images: string[];
};

export type OrderItem = { id: string; name: string; price: number; qty: number };

export type Order = {
  id: string;
  accountMobile: string;
  name: string;
  phone: string;
  pincode: string;
  address: string;
  payment: 'COD' | 'UPI';
  paymentStatus: string;
  status: string;
  statusMessage: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
  service?: { type: string; message: string; status: string; reply: string };
};

export type CartLine = { id: string; name: string; price: number; color: string; image: string; qty: number };
