export type Brand = {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  description: string;
  order: number;
};

export type ProductVariant = {
  id: string;
  size: string;
  concentration: "EDP" | "Parfum" | "Extrait" | "EDT";
  price: number;
  sku: string;
  stock: number;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  brandId: string;
  brandName: string;
  audience: "her" | "him" | "unisex";
  family: string;
  notesTop: string[];
  notesHeart: string[];
  notesBase: string[];
  perfumer: string;
  year: number;
  sillage: number;
  longevity: number;
  intensity: number;
  story: string;
  images: string[];
  isBestseller: boolean;
  publishedAt: number;
  status: "active" | "draft";
  variants: ProductVariant[];
};

export type CartItem = {
  productId: string;
  variantId: string;
  productName: string;
  brandName: string;
  size: string;
  concentration: string;
  price: number;
  quantity: number;
  image: string;
};

export type Order = {
  _id: string;
  number: string;
  channel: "web" | "manual";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  lineItems: {
    variantId: string;
    productName: string;
    size: string;
    concentration: string;
    qty: number;
    price: number;
  }[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  giftMessage?: string;
  status: "new" | "fulfilled" | "refunded" | "cancelled";
  createdAt: number;
};

export type Inquiry = {
  _id: string;
  name: string;
  email: string;
  message: string;
  createdAt: number;
  read: boolean;
};

export type World = "her" | "him" | "bestsellers" | "new-arrivals";

export type WorldConfig = {
  id: World;
  label: string;
  href: string;
  accent: string;
  accentVar: string;
  tag?: string;
};

export const WORLDS: WorldConfig[] = [
  { id: "her", label: "For Her", href: "/for-her", accent: "#C97B89", accentVar: "--accent-her" },
  { id: "him", label: "For Him", href: "/for-him", accent: "#8B1A35", accentVar: "--accent-him" },
  { id: "bestsellers", label: "Bestsellers", href: "/bestsellers", accent: "#C9A961", accentVar: "--accent-best", tag: "★ TOP" },
  { id: "new-arrivals", label: "New Arrivals", href: "/new-arrivals", accent: "#A86C9E", accentVar: "--accent-new", tag: "NEW" },
];
