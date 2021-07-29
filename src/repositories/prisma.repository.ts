import { PrismaClient } from "@prisma/client";
import { Service } from "typedi";

@Service()
class PrismaRepository {
    public db: PrismaClient;
    constructor() { this.db = new PrismaClient(); }
}

export default PrismaRepository;