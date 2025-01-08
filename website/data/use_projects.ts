import Project from "@typeFiles/api/project.type";
import useSWR from "swr";

const API = process.env.NEXT_PUBLIC_API_SERVER;

const fetcher = (url: string) =>
  fetch(url).then(async (res) => {
    if (res.ok) return await res.json();
    else throw await res.json();
  });

export default function useProjects() {
  const { data, error, mutate } = useSWR(`${API}/project`, fetcher);

  const loading = !data && !error;
  const loggedOut = error && error.status === 401 ? true : false;

  return {
    loading,
    loggedOut,
    projects: data !== undefined ? data.data as Project[] : ([] as Project[]),
    mutate,
  };
}
