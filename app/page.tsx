import { getChatGPTUser } from "./chatgpt-auth";
import FitnessApp from "./FitnessApp";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const authenticated = await getChatGPTUser();
  const user = authenticated
    ? { displayName: authenticated.displayName, email: authenticated.email }
    : process.env.NODE_ENV === "development"
      ? { displayName: "Demo Hunter", email: "demo@levelup.local" }
      : null;
  return <FitnessApp initialUser={user} />;
}
