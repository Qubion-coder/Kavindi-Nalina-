import type { Metadata } from "next";
import IvorySeal from "../ivory-seal/IvorySeal";
import { guestFromSegment } from "../guest";

type Props = { params: Promise<{ guest: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guest = guestFromSegment((await params).guest);
  const title = guest ? `${guest}, you're invited — Kavindi & Nalina` : "Kavindi & Nalina — Wedding Invitation";
  return { title, openGraph: { title } };
}

// Personalised invitation: /Mr.%20Sanjaya shows "Mr. Sanjaya" in the welcome line
export default async function GuestPage({ params }: Props) {
  return <IvorySeal guest={guestFromSegment((await params).guest)} />;
}
