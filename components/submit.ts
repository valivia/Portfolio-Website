const cdn = process.env.NEXT_PUBLIC_CDN_SERVER;

export default async function submit(data: Record<string, unknown>, url: string, method: "POST" | "PATCH" | "DELETE", type: "application/json" | "multipart/form-data"): Promise<Response> {
  let body: FormData | string;

  if (type == "multipart/form-data") {

    body = new FormData();

    for (const key in data) {
      const value = data[key as keyof Record<string, unknown>];
      if (key === "tags") (value as string[]).forEach(y => (body as FormData).append(`${key}[]`, y));
      else body.append(key, value as string | File);
    }

  } else {
    body = JSON.stringify(data);
  }

  const options = {
    method: method,
    mode: "cors",
    credentials: "include",
    body: body,
    headers: new Headers({ "Content-Type": type }),
  } as RequestInit;

  return (await fetch(`${cdn}/${url}`, options));
}