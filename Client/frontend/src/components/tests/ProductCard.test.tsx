import { render, screen } from "@testing-library/react";
import ProductCard from "../../components/product/ProductCard";

jest.mock("next/image", () => ({
  __esModule: true,
  default: ({
    src,
    alt,
  }: {
    src: string;
    alt: string;
  }) => {
    return <img src={src} alt={alt} />;
  },
}));

describe("ProductCard", () => {
  const product = {
    _id: "product-123",
    name: "Premium Coffee",
    title: "Premium Coffee",
    description: "Premium quality coffee",
    price: 499,
    category: "Beverages",
    stock: 10,
    rating: 4.5,
    images: [
      {
        url: "https://example.com/coffee.jpg",
        public_id: "coffee-123",
      },
    ],
  };

  test("renders product information correctly", () => {
    render(<ProductCard product={product} />);

    expect(
      screen.getByRole("heading", {
        name: "Premium Coffee",
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Beverages")).toBeInTheDocument();

    expect(screen.getByText("₹499")).toBeInTheDocument();

    expect(screen.getByText("4.5")).toBeInTheDocument();

    expect(
      screen.getByText("10 items available")
    ).toBeInTheDocument();
  });

  test("renders product image correctly", () => {
    render(<ProductCard product={product} />);

    const image = screen.getByRole("img", {
      name: "Premium Coffee",
    });

    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute(
      "src",
      "https://example.com/coffee.jpg"
    );
  });

  test("creates correct product link", () => {
    render(<ProductCard product={product} />);

    const link = screen.getByRole("link");

    expect(link).toHaveAttribute(
      "href",
      "/products/product-123"
    );
  });

  test("displays no rating when rating is zero", () => {
    const productWithoutRating = {
      ...product,
      rating: 0,
    };

    render(
      <ProductCard product={productWithoutRating} />
    );

    expect(screen.getByText("No rating")).toBeInTheDocument();
  });

  test("displays out of stock when stock is zero", () => {
    const outOfStockProduct = {
      ...product,
      stock: 0,
    };

    render(
      <ProductCard product={outOfStockProduct} />
    );

    expect(
      screen.getByText("Out of Stock")
    ).toBeInTheDocument();

    expect(
      screen.queryByText(/items available/)
    ).not.toBeInTheDocument();
  });
});