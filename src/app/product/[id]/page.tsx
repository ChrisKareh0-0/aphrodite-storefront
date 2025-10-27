import ProductDetailsPage from "../../components/ProductDetailsPage";
import "../../product-details.css";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const productSlug = params.id;

  if (!productSlug) {
    return (
      <div className="product-details-error">
        <div className="error-message">
          <i className="bx bx-error"></i>
          <h2>Invalid Product</h2>
          <p>The product ID or slug provided is not valid.</p>
        </div>
      </div>
    );
  }

  return <ProductDetailsPage productId={productSlug} />;
}

import { BACKEND_URL } from '@/constants';
export async function generateMetadata({ params }: ProductPageProps) {
  const productId = params.id;
  try {
    const response = await fetch(`${BACKEND_URL}/api/public/products/${productId}`, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      return {
        title: "Product Not Found - Aphrodite",
        description: "The requested product could not be found."
      };
    }
    const data = await response.json();
    const product = data.product;
    if (!product) {
      return {
        title: "Product Not Found - Aphrodite",
        description: "The requested product could not be found."
      };
    }
    return {
      title: `${product.name} - $${product.price} | Aphrodite`,
      description: product.description,
      openGraph: {
        title: product.name,
        description: product.description,
        images: [product.images?.[0] || 'https://aphrodite-admin.onrender.com/images/placeholder.svg'],
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description,
        images: [product.images?.[0] || 'https://aphrodite-admin.onrender.com/images/placeholder.svg']
      }
    };
  } catch (error) {
    return {
      title: "Product - Aphrodite",
      description: "Premium fashion products at Aphrodite"
    };
  }
}

