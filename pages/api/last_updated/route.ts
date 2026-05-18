import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch("https://schule-infoportal-api.vercel.app/last_updated");
  const data = await res.json();
  return NextResponse.json(data);
}
