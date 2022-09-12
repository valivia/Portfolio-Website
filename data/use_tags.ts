import { tag } from "@prisma/client";
import useSWR from "swr";

const API = process.env.NEXT_PUBLIC_API_SERVER;

export default function useTags() {
  const { data, error, mutate } = useSWR<tag[]>(`${API}/tag`);

  const loading = !data && !error;
  const loggedOut: boolean = error && error.status === 403;

  return {
    loading,
    loggedOut,
    tags: data !== undefined ? data : ([] as tag[]),
    mutate,
  };
}
