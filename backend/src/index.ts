import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const start = async () => {
  try {
    await app.listen({ port: Number(process.env.PORT) || 3000 });
    console.log(`Server fully operational at http://localhost:${process.env.PORT || 3000  }`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
