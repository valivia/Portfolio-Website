const apiServer = process.env.NEXT_PUBLIC_API_SERVER;

interface Revalidated {
  success: string[];
  failed: string[];
}

interface Response {
  data: any;
  status: number;
  message: string;
  revalidated?: Revalidated;
}

interface ResponseJson {
  data: Record<string, unknown>;
  revalidated: Revalidated;
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

  return await handleResponse(response);
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

  return await handleResponse(response);
}

export async function submitUrl(
  url: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown,
): Promise<Response> {
  const options = {
    method: method,
    credentials: "include",
    body,
  } as RequestInit;

  const response = await fetch(`${apiServer}/${url}`, options);

  return await handleResponse(response);
}

async function handleResponse(response: globalThis.Response): Promise<Response> {
  const json: ResponseJson | null = await response.json().catch(() => null);

  let message = json?.data?.reason as undefined | string;

  if (message === undefined) {
    switch (response.status) {
      case 401: message = "Unauthorised"; break;
      case 404: message = "Not found"; break;
      case 413: message = "This file is too large"; break;
      case 429: message = "Too many requests"; break;
      case 500: message = "A server error occurred"; break;
      default:
        message = "An unknown error occurred";
        break;
    }
  }

  return {
    data: json?.data,
    message,
    status: response.status,
    revalidated: json?.revalidated,
  };
}