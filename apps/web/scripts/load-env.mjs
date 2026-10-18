import { config } from "dotenv";

config({ path: new URL("../.env.local", import.meta.url) });
