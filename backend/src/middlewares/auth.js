const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

module.exports = function (roles = []) {
  // roles bisa: "admin", "dosen", "mahasiswa" atau array
  if (!Array.isArray(roles)) roles = [roles];

  return (req, res, next) => {
    try {
      const auth = req.headers.authorization;
      if (!auth || !auth.startsWith("Bearer ")) {
        return res.status(401).json({ msg: "Tidak ada token." });
      }

      const token = auth.split(" ")[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(403).json({ msg: "Tidak punya akses." });
      }

      req.user = decoded;
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ msg: "Token tidak valid." });
    }
  };
};
