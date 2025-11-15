import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const providedAuth = req.headers.authorization;

    if (!providedAuth) {
      return res.status(401).json({ error: "Missing credentials" });
    }
    const decoded = Buffer.from(
      providedAuth.replace("Basic ", ""),
      "base64",
    ).toString();

    const [username, password] = decoded.split(":");

    const response = await fetch(
      "https://schule-infoportal-api.vercel.app/substitutions/",
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${username}:${password}`,
          ).toString("base64")}`,
        },
      },
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Failed to fetch substitutions" });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
