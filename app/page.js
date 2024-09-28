// app/page.js

import NasaData from "./components/NasaData";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <NasaData />
    </main>
  );
}
