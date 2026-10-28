import type { Metadata } from "next";
import Admin from "./Admin";

export const metadata: Metadata = {
  title: "Invitation Links — Admin",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <Admin />;
}
