import { Suspense } from "react";
import ProductsPage from "../components/ProductsPage";
import "../products-page.css";

export const metadata = {
  title: "All Products - Aphrodite",
  description: "Discover our complete collection of premium fashion items. Shop clothing, shoes, and accessories from top brands.",
  keywords: "fashion, clothing, shoes, accessories, premium, online shopping",
  openGraph: {
    title: "All Products - Aphrodite",
    description: "Discover our complete collection of premium fashion items.",
    type: "website"
  }
};

function ProductsLoading() {
  return (
    <div className="products-loading-page">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading products...</p>
      </div>
    </div>
  );
}

export default function Products() {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsPage />
    </Suspense>
  );
}