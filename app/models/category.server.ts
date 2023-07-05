import type { Category } from "@prisma/client";

import { prisma } from "~/db.server";

export function getCategories() {
  return prisma.category.findMany({
    select: { id: true, name: true },
  });
}

export function createCategory({ name }: Pick<Category, "name">) {
  return prisma.category.create({
    data: {
      name,
    },
  });
}

export function deleteCategory({ id }: Pick<Category, "id">) {
  return prisma.category.delete({
    where: {
      id,
    },
  });
}
