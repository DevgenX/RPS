import { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const salt = Math.floor(Math.random() * 1000000);

    res.status(200).json({ salt });
  } else {
    res.status(405).end();
  }
}
