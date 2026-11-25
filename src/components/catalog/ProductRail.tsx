import type { Product } from "@/types";
import { ProductCard } from "@/components/catalog/ProductCard";

/** Faixa rolável de produtos da página inicial, sem repetir itens. */
export function ProductRail({ products }: { products: Product[] }) {
  return (
    <div className="product-rail" aria-label="Produtos em destaque">
      <div className="product-rail-track">
        <div className="product-rail-set">
          {products.map((product, index) => (
            <div className="product-rail-item" key={product.id}>
              <ProductCard product={product} priority={index < 4} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
