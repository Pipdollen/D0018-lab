import express from 'express';
const app = express();
import usersRoutes from './routes/users.js';
import itemsRoutes from './routes/items.js';
import authRoutes from './routes/auth.js';
import cors from 'cors';
import cookieparser from 'cookie-parser';

//middleware
app.use(express.json());
app.use(cors());
app.use(cookieparser());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/items", itemsRoutes);

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export default app;