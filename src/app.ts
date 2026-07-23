import express from "express";
import authRoutes from "./routes/auth.routes";
import playerRoutes from "./routes/player.routes";
import teamRoutes from "./routes/team.routes";

const app = express();

app.use(express.json()); 

app.use("/auth", authRoutes);
app.use("/players", playerRoutes);
app.use("/teams", teamRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});