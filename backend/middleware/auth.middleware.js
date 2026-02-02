import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "UNAUTHORIZED" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "UNAUTHORIZED" });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error("JWT_SECRET is not defined");
      return res.status(500).json({ message: "SERVER_MISCONFIGURED" });
    }

    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;

    next();
  } catch (e) {
    console.error("AUTH ERROR:", e.message);
    return res.status(401).json({ message: "UNAUTHORIZED" });
  }
}
