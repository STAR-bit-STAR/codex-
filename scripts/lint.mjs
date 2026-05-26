import { readFileSync } from "node:fs";
import { extname } from "node:path";
import { execFileSync } from "node:child_process";

const files = execFileSync("git", ["ls-files", "--others", "--cached", "--exclude-standard"], {
  encoding: "utf8"
})
  .trim()
  .split("\n")
  .filter(Boolean)
  .filter((file) => [".html", ".css", ".js", ".mjs", ".json", ".webmanifest", ".svg"].includes(extname(file)));

const failures = [];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  if (content.includes("\t")) failures.push(`${file}: contains tabs`);
  if (!content.endsWith("\n")) failures.push(`${file}: missing trailing newline`);
  content.split("\n").forEach((line, index) => {
    if (/\s+$/.test(line)) failures.push(`${file}:${index + 1}: trailing whitespace`);
  });
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Lint passed for ${files.length} files.`);
