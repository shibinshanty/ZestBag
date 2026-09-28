export type ProductImage = {
  url: string;
  public_id: string;
};

export type Product = {
  _id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: ProductImage[];
};