import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  const url = `/${(req.query.url as string[]).join("/")}`;

  if (req.headers.authorization !== process.env.CLIENT_SECRET) {
    console.info(`Revalidation failed: ${url}`);
    return res.status(401).json({ message: "Invalid token" });
  }

  try {
    await res.revalidate(url);
    console.info(`Revalidation success: ${url}`);
    return res.json({ revalidated: true });
  } catch (err) {
    return res.status(500).send("Error revalidating");
  }
}
