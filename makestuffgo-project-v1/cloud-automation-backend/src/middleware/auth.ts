import jwt from "jsonwebtoken"
import { Request, Response, NextFunction } from "express"

interface AuthenticatedRequest extends Request {
  user?: any
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" })
  }
}

export const authorize = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: "User not authenticated" })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "User role insufficient for this action",
      })
    }

    next()
  }
}
