import { registerParticipation } from "@/lib/registration";

export async function POST(request: Request) {
  return registerParticipation(request, "COURSE");
}
