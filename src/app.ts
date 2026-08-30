import express from "express";
import { createServer } from "http";
import authRoutes from "./routes/auth.routes";
import playerRoutes from "./routes/player.routes";
import teamRoutes from "./routes/team.routes";
import matchRoutes from "./routes/match.routes";
import { initSocket } from "./socket";
import { errorHandler } from "./middleware/errorHandler.middleware";

const app = express();
const httpServer = createServer(app);
initSocket(httpServer);

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/players", playerRoutes);
app.use("/teams", teamRoutes);
app.use("/matches", matchRoutes);

app.use(errorHandler); // must be registered last — after every route

const PORT = 3000;
httpServer.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});