import { Request, Response, NextFunction } from "express"

export const indexController = (req: Request, res: Response, next: NextFunction) => {
  res.send("Hello World!")
}

