const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            if (token && token !== "null" && token !== "undefined") {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET || "smartcampus_secret"
                );
                req.user = decoded;
                return next();
            }
        } catch (error) {
            return res.status(401).json({
                message: "Token invalid or expired"
            });
        }
    }

    return res.status(401).json({
        message: "No token provided"
    });
};

const optionalProtect = (req, res, next) => {
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            const token = req.headers.authorization.split(" ")[1];
            if (token && token !== "null" && token !== "undefined") {
                const decoded = jwt.verify(
                    token,
                    process.env.JWT_SECRET || "smartcampus_secret"
                );
                req.user = decoded;
            }
        } catch (error) {
            // Ignore error for public preview endpoints
        }
    }
    next();
};

module.exports = protect;
module.exports.protect = protect;
module.exports.optionalProtect = optionalProtect;