import jwt from "jsonwebtoken"
import axios from "axios"
import { RobokassaProviderOptions } from "../types"

export interface InvoiceResponse {
  InvoiceId: string
  ConfirmationUrl: string
  IsSuccess: boolean
}

export async function generateInvoiceJWT(
  options: RobokassaProviderOptions,
  invId: string,
  outSum: number,
  description: string,
  server: string
): Promise<InvoiceResponse> {
  const payload = {
    MerchantLogin: options.merchantLogin,
    password_1: options.isTest ? options.test_password1 : options.password1,
    InvoiceType: "OneTime",
    InvId: invId,
    OutSum: outSum,
    Description: description,
  }

  const token = options.isTest
    ? jwt.sign(payload, options.password1, {algorithm: options.alg})
    : jwt.sign(payload, options.test_password1, {algorithm: options.alg})

  const resp = await axios.post<InvoiceResponse>(server, token, {
    headers: { 
        "typ": "JWT",
        "alg": "MD5" 
    },
  })

  return resp.data
}