const apiServer = process.env.NEXT_PUBLIC_API_SERVER;

export default async function submit(data: Record<string, unknown>, url: string, method: "POST" | "PATCH" | "DELETE", type: "application/json" | "multipart/form-data"): Promise<Response> {
  let body: FormData | string;
  let headers: HeadersInit;

  if (type == "multipart/form-data") {
    headers = {};

    body = new FormData();

    for (const key in data) {
      const value = data[key as keyof Record<string, unknown>];
      if (key === "tags") (value as string[]).forEach(y => (body as FormData).append(`${key}[]`, y));
      else body.append(key, value as string | File);
    }

  } else {
    headers = new Headers({ "Content-Type": type });
    body = JSON.stringify(data);
  }

  const options = {
    method: method,
    mode: "cors",
    credentials: "include",
    body: body,
    headers,
  } as RequestInit;

  return (await fetch(`${apiServer}/${url}`, options));
}