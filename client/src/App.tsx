import { Navbar } from "./components/Navbar";
import { LogTable } from "./components/LogTable";

function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <LogTable />
      </main>
    </>
  );
}

export default App;
