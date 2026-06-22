import app from "./app.js";
import dotenv from "dotenv";

dotenv.config();

const start = async () => {
  try {
    // 1. Define the port number properly from env or default to 3000
    const portNumber = Number(process.env.PORT) || 3000;
    
    // 2. Use your correct variable 'app' instead of 'fastify' 
    // and explicitly set host to "0.0.0.0" for Render
    await app.listen({
      port: portNumber,
      host: "0.0.0.0",
    });
    
    console.log(
      `Server fully operational at http://localhost:${portNumber}`,
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();