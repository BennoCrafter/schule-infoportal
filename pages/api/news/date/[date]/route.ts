import { NextResponse } from "next/server";

export async function GET(_: Request, { params }: { params: { date: string }}) {
  const res = await fetch(`https://schule-infoportal-api.vercel.app/news/date/${params.date}`);
  const data = await res.json();
  return NextResponse.json(data);
}
