import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (req.query.secret !== process.env.CLIENT_SECRET) {
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    await res.revalidate(`/${(req.query.url as string[]).join("/")}`);
    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).send("Error revalidating");
  }
}
