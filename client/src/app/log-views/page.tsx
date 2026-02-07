import { Navbar } from "@/components/Navbar";
import { LogTable } from "@/components/LogTable";

export default function LogsPage() {
  return (
    <>
      <Navbar />
      <main className="container">
        <LogTable />
      </main>
    </>
  );
}
