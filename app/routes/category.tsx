import type { ActionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import {
  createCategory,
  deleteCategory,
  getCategories,
} from "~/models/category.server";
import { useEffect, useRef } from "react";

export const loader = async ({ request }: ActionArgs) => {
  const categories = await getCategories();

  return json({ categories });
};

export const action = async ({ request }: ActionArgs) => {
  const formData = await request.formData();
  const action = formData.get("_action");
  const id = parseInt(formData.get("category_id") as string, 10);
  const name = formData.get("name");

  console.log(action);
  if (action === "delete" && id) {
    await deleteCategory({ id });
  }

  if (action === "create") {
    if (typeof name !== "string" || name.length === 0) {
      return json({ errors: { name: "Name is required" } }, { status: 400 });
    }

    await createCategory({ name });
  }

  return redirect(`/category`);
};

const DeleteCategory = ({ id }: { id: number }) => (
  <Form method="post">
    <input type="hidden" name="_action" value="delete" />
    <input type="hidden" name="category_id" value={id} />
    <button type="submit" className="rounded bg-red-500 text-white text-sm px-2 py-1">Delete</button>
  </Form>
);

export default function Category() {
  const actionData = useActionData<typeof action>();
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const isAdded = navigation.state === "submitting";
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isAdded) {
      formRef.current?.reset();
    }
  }, [isAdded]);

  return (
    <div className="container m-auto max-w-3xl">
      {data.categories.length > 0 && (
        <table className="w-full border">
          <thead>
            <tr>
              <th className="w-10/12 p-2 text-left">Name</th>
              <th className="w-2/12 p-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {data.categories.map((category) => (
              <tr key={category.id} className="border">
                <td className="p-2">{category.name}</td>
                <td className="p-2 text-center">
                  <DeleteCategory id={category.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Form
        ref={formRef}
        method="post"
        className="mt-4 flex w-full flex-col gap-4"
      >
        <input type="hidden" name="_action" value="create" />
        <div>
          <label className="flex w-full flex-col gap-1">
            <span>name: </span>
            <input
              // ref={nameRef}
              name="name"
              className="flex-1 rounded-md border-2 border-blue-500 px-3 text-lg leading-loose"
              aria-invalid={actionData?.errors?.name ? true : undefined}
              aria-errormessage={
                actionData?.errors?.name ? "name-error" : undefined
              }
            />
          </label>
          {actionData?.errors?.name ? (
            <div className="pt-1 text-red-700" id="name-error">
              {actionData.errors.name}
            </div>
          ) : null}
        </div>
        <div className="text-right">
          <button
            type="submit"
            className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:bg-blue-400"
          >
            Save
          </button>
        </div>
      </Form>
    </div>
  );
}
