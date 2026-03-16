import express from 'express';
const app = express();
import usersRoutes from './routes/users.js';
import itemsRoutes from './routes/items.js';
import authRoutes from './routes/auth.js';
import shoppingcartRoutes from './routes/shoppingcart.js';
import checkoutRoutes from './routes/checkout.js';
import reviewRoutes from './routes/reviews.js';
import rentalRoutes from './routes/rental.js';
import cors from 'cors';
import cookieparser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '..', 'dist');

//middleware
app.use((req,res,next)=>{
  res.header("Access-Control-Allow-Credentials", true)
  next()

})
app.use(express.json());
app.use(
  cors({
    origin: "http://13.60.10.9:5173"
  })
);
app.use(cookieparser());

app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/items", itemsRoutes);
app.use("/api/shoppingcart", shoppingcartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/rentals", rentalRoutes);
app.use(express.static(distPath));

app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

export default app;