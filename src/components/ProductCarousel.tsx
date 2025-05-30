// src/components/ProductCarousel.tsx
import Carousel from './Carousel'
import Link from 'next/link'

type Product = {
  id: number
  name: string
  description: string
}

type Props = {
  products: Product[]
}

export default function ProductCarousel({ products }: Props) {
  return (
    <section className="w-full bg-white py-12 px-4">
      <h3 className="text-2xl font-semibold text-center mb-6">Products</h3>

      <Carousel>
        {products.map((product) => (
          <div
            key={product.id}
            className="flex-shrink-0 w-[180px] h-[180px] bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition"
          >
            <h4 className="font-bold text-sm mb-2">{product.name}</h4>
            <p className="text-xs text-gray-600 mb-4">{product.description}</p>
            <Link
              href={`/products/${product.id}`}
              className="text-brand text-xs hover:underline"
            >
              View Product →
            </Link>
          </div>
        ))}
      </Carousel>
    </section>
  )
}
