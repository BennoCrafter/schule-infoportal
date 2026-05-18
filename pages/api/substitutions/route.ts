import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  const password = searchParams.get("password");

  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const auth = Buffer.from(`${username}:${password}`).toString("base64");

  const res = await fetch(
    "https://schule-infoportal-api.vercel.app/substitutions",
    {
      headers: { Authorization: `Basic ${auth}` },
    },
  );

  if (!res.ok) {
    return NextResponse.json(
      { error: "API error", status: res.status },
      { status: 500 },
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}
