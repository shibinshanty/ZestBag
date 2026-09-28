export type ProductImage = {
  url: string;
  public_id: string;
};

export type Product = {
  _id: string;
  name: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating?: number;
  images: ProductImage[];
};