import web from "./src/webServer";
import { PrismaClient } from '@prisma/client'
import BotClient from "./src/Discord";


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
async function main() {
  const bot = await BotClient();
  web(db, bot);
}

main()
  .catch(e => {
    throw e;
  })
  .finally(async () => {
    await db.$disconnect();
  });