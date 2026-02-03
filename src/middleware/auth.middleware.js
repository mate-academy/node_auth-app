import jwt from "jsonwebtoken";

export default function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    // 🔥 НІЧОГО НЕ ПРИЙШЛО
    if (!authHeader) {
      return res.status(401).json({ message: "NO_TOKEN" });
    }

    // 🔥 МАЄ БУТИ: Bearer <token>
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "INVALID_TOKEN_FORMAT" });
    }

    const token = authHeader.split(" ")[1];

    // 🔥 token порожній або undefined
    if (!token) {
      return res.status(401).json({ message: "TOKEN_MISSING" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded; // { id: ... }

    next();
  } catch (e) {
    console.error("AUTH ERROR:", e);
    return res.status(401).json({ message: "INVALID_TOKEN" });
  }
}
