import { Request, Response, NextFunction } from "express"
import query from '../db/queries.js'
import { UserUpdate, User, NewUser } from '../types/types.js'
import bcrypt from 'bcryptjs'
// auth
import { login } from "./authentication.js"
// validation
import { body, validationResult } from 'express-validator'

const alphaErr = 'must only contain letters.'
const alphaNumErr = 'must only contain letters and/or numbers'
const lengthErr = 'must be between 1 and 20 characters.'

const validateUser = [
  body("first_name").trim()
    .isAlpha().withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 20 }).withMessage(`First name ${lengthErr}`)
    .notEmpty(),

  body("last_name").trim()
    .isAlpha().withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 20 }).withMessage(`Last name ${lengthErr}`),

  body("username").trim()
    .isAlphanumeric().withMessage(`Username ${alphaNumErr}`)
    .isLength({ min: 1, max: 20 }).withMessage(`Last name ${lengthErr}`)
    .notEmpty(),
]


export const postLogin = (req: Request, res: Response, next: NextFunction) => {
  login('log-in', req, res, next)
}

export const signInPost = [
  validateUser,
  async (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      console.log(errors.array())
      return res.status(400).render("sign-in", {
        errors: errors.array(),
      })
    }

    let password: string
    try {
      const hashedPassword = await hashPassword(req.body.password)
      password = hashedPassword
    } catch (err) {
      return res.status(400).render("sign-in", {
        errors: [{ msg: 'Password hashing has been unsuccessful' }]
      })
    }

    const { first_name, last_name, username } = req.body
    try {
      await query.createUser({
        first_name: first_name,
        last_name: last_name,
        username: username,
        password: password,
        ismember: false
      } as NewUser)

      return login('log-in', req, res, next)

    } catch (err) {
      console.error('Error: User creation have failed')
      return next(err)
    }
  }
]

function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    bcrypt.hash(password, 10, async (err, hashedPassword) => {
      if (err) {
        reject(err);
      } else {
        resolve(hashedPassword);
      }
    });
  });
}
