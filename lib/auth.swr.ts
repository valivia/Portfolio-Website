import useSWR from "swr";

const fetcher = async (url: string) => await fetch(url, { credentials: "include", mode: "cors", method: "POST" })
  .then((x) => {
    if (x.ok) return true;
    throw { code: x.status, message: x.body };
  });

export default function AuthSwr(): Record<string, unknown> {
  const { data, mutate, error } = useSWR("https://cdn.xayania.com/auth", fetcher);

  console.log(data, error);

  const loading = !data && !error;
  const loggedOut = error;

  return {
    loading,
    loggedOut,
    mutate,
  };
}
