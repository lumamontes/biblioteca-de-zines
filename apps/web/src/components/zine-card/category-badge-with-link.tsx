"use client";

import { useRouter } from "next/navigation";
import CategoryBadge from "./category-badge";

interface CategoryBadgeWithLinkProps {
  categories: string[];
}

export default function CategoryBadgeWithLink({ categories }: CategoryBadgeWithLinkProps) {
  const router = useRouter();

  const handleCategoryClick = (category: string) => {
    router.push(`/zines?category=${encodeURIComponent(category)}`);
  };

  return <CategoryBadge categories={categories} onCategoryClick={handleCategoryClick} />;
} 