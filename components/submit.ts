const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

export default async function submit(data: Record<string, unknown>, url: string, method: "POST" | "PATCH" | "DELETE"): Promise<Response> {
  let body: FormData | string;

  if (method === "POST") {

    body = new FormData();

    for (const key in data) {
      const value = data[key as keyof Record<string, unknown>];
      if (key === "tags") (value as string[]).forEach(y => (body as FormData).append(`${key}[]`, y));
      else body.append(key, value as string | File);
    }

  } else {
    body = JSON.stringify(data);
  }

  let options = {
    method: method,
    mode: "cors",
    credentials: "include",
    body: body,
  } as RequestInit;

  if (method !== "POST") options = { ...options, headers: new Headers({ "Content-Type": "application/json" }) };

  return (await fetch(`${cdn}/${url}`, options));
}