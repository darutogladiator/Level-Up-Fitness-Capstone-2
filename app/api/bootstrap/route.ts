import { getDashboardData } from "@/lib/dashboard";
import { isDateKey } from "@/lib/fitness";
import { getRequestUser, unauthorized } from "@/lib/server";

export async function GET(request: Request) {
  const user = await getRequestUser();
  if (!user) return unauthorized();
  const url = new URL(request.url);
  const requestedDate = url.searchParams.get("date");
  const dateKey = isDateKey(requestedDate)
    ? requestedDate
    : new Date().toISOString().slice(0, 10);
  try {
    return Response.json(await getDashboardData(user, dateKey));
  } catch (error) {
    console.error("bootstrap_failed", error);
    return Response.json(
      { error: "Unable to load the fitness dashboard right now." },
      { status: 500 },
    );
  }
}
