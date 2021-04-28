import { open } from "sqlite";
import sqlite3 from "sqlite3";
import web from "./src/webServer";

/*
for (let i = 1; i < 100; i++) {
  let output: string | number = "";
  if (i % 3 === 0) { output += "cock"; }
  if (i % 5 === 0) { output += "balls"; }
  if (output === "") { output = i; }
  console.log(output);
}
*/

open({
  driver: sqlite3.Database,
  filename: "./database.db"

}).then(async (db) => {
  web(db);
});