import { Inter } from "next/font/google";
import Game from "../components/Game";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-1 ${inter.className}`}
    >
      <Game />
    </main>
  );
}
