import Carousel from "./Carousel"
import Card from "./Card"

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
          <Card
            key={product.id}
            title={product.name}
            description={product.description}
            href={`/products/${product.id}`}
          />
        ))}
      </Carousel>
    </section>
  )
}