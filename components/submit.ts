const apiServer = process.env.NEXT_PUBLIC_API_SERVER;

interface Response {
  status: number;
  message?: string;
  data: any;
}
/**
 * Makes a request with the given data to the API server.
 * @param data The data to send to the API server.
 * @param url The path to send the data to. This is relative to the API server.
 * @param method The method to use when sending the data.
 * @returns The response from the API server.	If the response is not 200, an error is thrown.
 */
export async function submitJson(
  data: Record<string, unknown>,
  url: string,
  method: "POST" | "PATCH" | "DELETE"
): Promise<Response> {
  const headers = new Headers({ "Content-Type": "application/json" });
  const body = JSON.stringify(data);

  const options = {
    method: method,
    credentials: "include",
    body: body,
    headers,
  } as RequestInit;

  const response = await fetch(`${apiServer}/${url}`, options);

  const json = await response.json().catch(() => null);
  return {
    data: json,
    message: json?.message,
    status: response.status,
  };
}

export async function submitFormData(
  data: Record<string, unknown>,
  url: string,
  method: "POST" | "PATCH" | "DELETE"
): Promise<Response> {
  const body = new FormData();

  for (const key in data) {
    const value = data[key as keyof Record<string, unknown>];
    body.append(key, value as string | File);
  }

  const options = {
    method: method,
    credentials: "include",
    body: body,
  } as RequestInit;

  const response = await fetch(`${apiServer}/${url}`, options);

  const json = await response.json().catch(() => null);
  return {
    data: json,
    message: json?.message,
    status: response.status,
  };
}
