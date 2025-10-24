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

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps) {
  const productId = parseInt(params.id);

  try {
    // In production, you might want to fetch this from your API
    // const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/products/${productId}`);
    // const product = await response.json();

    // For now, using mock data
    interface MockProduct {
      name: string;
      description: string;
      price: number;
      images: string[];
    }

    const mockProducts: Record<number, MockProduct> = {
      1: {
        name: "Aphrodite Premium Jacket",
        description: "Discover our premium clothing collection featuring the latest trends in fashion.",
        price: 89.99,
        images: ["https://i.postimg.cc/76X9ZV8m/Screenshot_from_2022-06-03_18-45-12.png"]
      },
      2: {
        name: "Aphrodite Casual Shirt",
        description: "A comfortable and stylish casual shirt perfect for everyday wear.",
        price: 27.24,
        images: ["https://i.postimg.cc/j2FhzSjf/bs2.png"]
      },
      3: {
        name: "Aphrodite Classic Shoes",
        description: "Step into style with our classic shoes.",
        price: 37.24,
        images: ["https://i.postimg.cc/8CmBZH5N/shoes.webp"]
      }
    };

    const product = mockProducts[productId];

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
        images: [product.images[0]],
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.description,
        images: [product.images[0]]
      }
    };

  } catch (error) {
    return {
      title: "Product - Aphrodite",
      description: "Premium fashion products at Aphrodite"
    };
  }
}

// Generate static params for static generation (optional)
export function generateStaticParams() {
  // In production, you might want to fetch this from your database
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' }
  ];
}