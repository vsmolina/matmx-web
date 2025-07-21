import { notFound } from "next/navigation"

type ProductPageProps = {
  params: { id: string }
}

const MOCK_PRODUCTS = Array.from({ length: 20 }, (_, i) => ({
  id: (i + 1).toString(),
  name: `Product ${i + 1}`,
  description: `Detailed description for Product ${i + 1}`,
}))

export default function ProductPage({ params }: ProductPageProps) {
  const product = MOCK_PRODUCTS.find(p => p.id === params.id)

  if (!product) return notFound()

  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-semibold mb-4">{product.name}</h1>
      <p className="text-gray-700 text-sm">{product.description}</p>
    </main>
  )
}