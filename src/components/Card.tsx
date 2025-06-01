import Link from "next/link"

type CardProps = {
  title: string
  description: string
  href: string
}

export default function Card({ title, description, href }: CardProps) {
  return (
    <div className="flex-shrink-0 w-[180px] h-[180px] bg-gray-100 p-4 rounded-lg shadow-sm hover:shadow-md transition">
      <h4 className="font-bold text-sm mb-2">{title}</h4>
      <p className="text-xs text-gray-600 mb-4">{description}</p>
      <Link href={href} className="text-brand text-xs hover:underline">
        View →
      </Link>
    </div>
  )
}