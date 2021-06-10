import web from "./src/webServer";
import { PrismaClient } from '@prisma/client'


const db = new PrismaClient()
/*
for (let i = 1; i < 100; i++) {
  let output: string | number = "";
  if (i % 3 === 0) { output += "cock"; }
  if (i % 5 === 0) { output += "balls"; }
  if (output === "") { output = i; }
  console.log(output);
}
*/


web(db);