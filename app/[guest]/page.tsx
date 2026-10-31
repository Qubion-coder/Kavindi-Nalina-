import IvorySeal from "../ivory-seal/IvorySeal";
import { guestFromSegment } from "../guest";

type Props = { params: Promise<{ guest: string }> };

// Personalised invitation: /Mr.%20Sanjaya shows "Mr. Sanjaya" in the welcome line only;
// the page title and link preview stay the same as the main invitation
export default async function GuestPage({ params }: Props) {
  return <IvorySeal guest={guestFromSegment((await params).guest)} />;
}
