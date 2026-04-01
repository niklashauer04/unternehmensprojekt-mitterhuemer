import net from "node:net";
import { spawn } from "node:child_process";

const host = "127.0.0.1";
const port = 3000;

function checkPortAvailability(targetHost, targetPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (error) => {
      if (error && typeof error === "object" && "code" in error && error.code === "EADDRINUSE") {
        resolve(false);
        return;
      }

      reject(error);
    });

    server.once("listening", () => {
      server.close(() => resolve(true));
    });

    server.listen(targetPort, targetHost);
  });
}

function printPortInUseHelp(targetHost, targetPort) {
  console.error("");
  console.error(`Port ${targetPort} ist bereits belegt. Der lokale Dev-Server wurde nicht gestartet.`);
  console.error(`Erwarteter lokaler Link: http://${targetHost}:${targetPort}`);
  console.error("");
  console.error("Pruefen Sie den laufenden Prozess mit:");
  console.error(`  lsof -iTCP:${targetPort} -sTCP:LISTEN -n -P`);
  console.error("");
  console.error("Beenden Sie einen alten lokalen Next-Prozess zum Beispiel mit:");
  console.error("  pkill -f \"next dev\"");
  console.error("");
}

async function main() {
  const portAvailable = await checkPortAvailability(host, port);

  if (!portAvailable) {
    printPortInUseHelp(host, port);
    process.exitCode = 1;
    return;
  }

  const child = spawn(
    process.platform === "win32" ? "npx.cmd" : "npx",
    ["next", "dev", "--hostname", host, "--port", String(port)],
    {
      stdio: "inherit",
      env: process.env,
    },
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error("Der lokale Dev-Start konnte nicht vorbereitet werden.");
  console.error(error);
  process.exit(1);
});
