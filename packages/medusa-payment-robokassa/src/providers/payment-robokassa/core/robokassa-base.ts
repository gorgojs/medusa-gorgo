import {
  AbstractPaymentProvider,
  PaymentSessionStatus,
  PaymentActions
} from "@medusajs/framework/utils"
import {
  InitiatePaymentInput, InitiatePaymentOutput,
  CapturePaymentInput, CapturePaymentOutput,
  RefundPaymentInput, RefundPaymentOutput,
  CancelPaymentInput, CancelPaymentOutput,
  RetrievePaymentInput, RetrievePaymentOutput,
  GetPaymentStatusInput, GetPaymentStatusOutput,
  ProviderWebhookPayload, WebhookActionResult, Logger,
  AuthorizePaymentInput, AuthorizePaymentOutput,
  DeletePaymentInput, DeletePaymentOutput,
  UpdatePaymentInput, UpdatePaymentOutput,
} from "@medusajs/framework/types"
import { RobokassaProviderOptions } from "../types"
import axios, { AxiosError } from "axios"
import md5 from "md5"
import { XMLParser } from 'fast-xml-parser'

abstract class RobokassaBase extends AbstractPaymentProvider<RobokassaProviderOptions> {
  static identifier = "robokassa"
  protected options_: RobokassaProviderOptions
  protected logger_: Logger
  protected serverUrl_ = "https://auth.robokassa.ru/Merchant/Index.aspx"
  protected requestUrl_ = "https://auth.robokassa.ru/Merchant/WebService/Service.asmx"
  protected capturePaymentUrl_ = "https://auth.robokassa.ru/Merchant/Payment/Confirm"
  protected opStateExt_ = "OpStateExt"

  protected stringToNumberHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash |= 0
    }
    return Math.abs(hash)
  }

  constructor(container: { logger: Logger }, options: RobokassaProviderOptions) {
    super(container, options)
    this.options_ = options
    this.logger_ = container.logger
  }

  /**
   * Initiate a new payment.
   */
  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    this.logger_.debug(
      `RobokassaBase.initiatePayment input:\n${JSON.stringify(input, null, 2)}`
    )

    const { amount, context = {} } = input
    const invId = this.stringToNumberHash(context.idempotency_key as string).toString()
    const outSum = Number(amount).toFixed(2)
    const successUrl2 = input.data?.SuccessUrl2 as string
    const failUrl2 = input.data?.FailUrl2 as string
    const email = input.data?.EMail as string
    const session_id = input.data?.session_id as string
    const raw = [
      this.options_.merchantLogin,
      outSum,
      invId,
      successUrl2,
      "GET",
      failUrl2,
      "GET",
      this.options_.isTest ? this.options_.test_password1 : this.options_.password1,
      `Shp_sessionid=${session_id}`
    ].join(":")

    const signature = md5(raw)

    const params = new URLSearchParams({
      MerchantLogin: this.options_.merchantLogin,
      OutSum: outSum,
      InvoiceID: invId,
      SuccessUrl2: successUrl2,
      SuccessUrl2Method: "GET",
      FailUrl2: failUrl2,
      FailUrl2Method: "GET",
      EMail: email,
      SignatureValue: signature,
      Shp_sessionid: session_id,
      ...(this.options_.isTest ? { IsTest: "1" } : {}),
      ...(!this.options_.capture ? { StepByStep: "true" } : {})
    }).toString()

    const url = `${this.serverUrl_}?${params}`

    return {
      id: invId,
      data: {
        id: invId,
        outSum: outSum,
        confirmation_url: url
      }
    }
  }

  /**
   * Capture an existing payment.
   */
  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    this.logger_.debug(`RobokassaBase.capturePayment input:\n${JSON.stringify(input, null, 2)}`)
    
    const invId = input.data?.id as string
    const outSum = input.data?.outSum as string

    const raw = [
      this.options_.merchantLogin,
      outSum,
      invId,
      this.options_.isTest ? this.options_.test_password1 : this.options_.password1
    ].join(":")
    const signature = md5(raw)

    const params = new URLSearchParams({
      MerchantLogin: this.options_.merchantLogin,
      InvoiceID: invId,
      Signature: signature,
      OutSum: outSum
    }).toString()
    const url = `${this.capturePaymentUrl_}?${params}`

    try {
      const response = await axios.post(url)
      return { data: input.data}
    } catch (e) {
      throw this.buildError("An error occurred in capturePayment", e)
    }
  }

  /**
   * Authorize a payment by retrieving its status.
   */
  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    this.logger_.debug(`RobokassaBase.authorizePayment input:\n${JSON.stringify(input, null, 2)}`)

    const statusResponse = await this.getPaymentStatus(input)
    return statusResponse
  }

  /**
   * Delete a payment.
   * Payment delete is not supported by Robokassa.
   */
  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    this.logger_.debug(`RobokassaBase.deletePayment input:\n${JSON.stringify(input, null, 2)}`)

    return input
  }

  /**
   * Update a payment.
   * Payment update is not supported by Robokassa.
   */
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    this.logger_.debug(`RobokassaBase.updatePayment input:\n${JSON.stringify(input, null, 2)}`)

    return input
  }

  /**
   * Refund a payment.
   * Payment refund is not supported by Robokassa.
   */
  async refundPayment( input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    this.logger_.debug(`RobokassaBase.refundPayment input:\n${JSON.stringify(input, null, 2)}`)

    return input
  }

  /**
   * Cancel an existing payment.
   */
  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    this.logger_.debug(`RobokassaBase.cancelPayment input:\n${JSON.stringify(input, null, 2)}`)

    return input
  }

  /**
   * Retrieve a payment.
   */
  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    this.logger_.debug(`RobokassaBase.retrievePayment input:\n${JSON.stringify(input, null, 2)}`)

    const invId = input.data?.id as string
    const raw = [
      this.options_.merchantLogin,
      invId,
      this.options_.isTest ? this.options_.test_password2 : this.options_.password2
    ].join(":")
    const signature = md5(raw)
    const params = new URLSearchParams({
      MerchantLogin: this.options_.merchantLogin,
      InvoiceID: invId,
      Signature: signature,
    }).toString()

    const url = `${this.requestUrl_}/${this.opStateExt_}?${params}`

    try {
      const { data: xml } = await axios.post(url)
      // 100 captured
      //const testXml = `<? xml version = "1.0" encoding = "utf-8" ?> <OperationStateResponse xmlns="http://auth.robokassa.ru/Merchant/WebService/" > <Result> <Code>0</Code> <Description>успешно</Description> </Result> <State> <Code>100</Code> <RequestDate>03.07.2025</RequestDate> <StateDate>03.07.2025</StateDate> </State> <Info> <IncCurrLabel>string</IncCurrLabel> <IncSum>decimal</IncSum> <IncAccount>string</IncAccount> <PaymentMethod> <Code>string</Code> <Description>string</Description> </PaymentMethod> <OutCurrLabel>string</OutCurrLabel> <OutSum>decimal</OutSum> <OpKey>string</OpKey> <BankCardRRN>string</BankCardRRN> </Info> <UserField> <Field> <Name>string</Name> <Value>string</Value> </Field> </UserField> </OperationStateResponse>`
      // 5 authorized
      //const testXml = `<? xml version = "1.0" encoding = "utf-8" ?> <OperationStateResponse xmlns="http://auth.robokassa.ru/Merchant/WebService/" > <Result> <Code>0</Code> <Description>успешно</Description> </Result> <State> <Code>5</Code> <RequestDate>03.07.2025</RequestDate> <StateDate>03.07.2025</StateDate> </State> <Info> <IncCurrLabel>string</IncCurrLabel> <IncSum>decimal</IncSum> <IncAccount>string</IncAccount> <PaymentMethod> <Code>string</Code> <Description>string</Description> </PaymentMethod> <OutCurrLabel>string</OutCurrLabel> <OutSum>decimal</OutSum> <OpKey>string</OpKey> <BankCardRRN>string</BankCardRRN> </Info> <UserField> <Field> <Name>string</Name> <Value>string</Value> </Field> </UserField> </OperationStateResponse>`

      const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: "@_",
      })

      const parsed = parser.parse(xml)
      const response = parsed['OperationStateResponse']

      return {
        data: {
          ...input.data,
          response: response
        }
      }
    } catch (e) {
      throw this.buildError("An error occurred in getPaymentStatus", e)
    }
  }

  /**
   * Retrieve payment status and map it to Medusa status.
   */
  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    this.logger_.debug(
      `RobokassaBase.getPaymentStatus input:\n${JSON.stringify(input, null, 2)}`
    )
    try {
      const response = (await this.retrievePayment(input)).data?.response as { Result: { Code: string, Description: string }, State: { Code: string } }
      if (!response || !response.Result || !response.State) {
        throw new Error("Invalid response structure from Robokassa")
      }

      const result = response.Result as { Code: string, Description: string }
      const state = response.State as { Code: string }

      const resultCode = parseInt(result.Code, 10)
      const resultDescription = result.Description
      if (resultCode !== 0) {
        throw new Error(`Robokassa error ${resultCode}: ${resultDescription}`)
      }
      const paymentState = parseInt(state.Code, 10)

      switch (paymentState) {
        case 5:
          return {
            status: PaymentSessionStatus.AUTHORIZED, data: {
              ...input.data,
              response: response
            }}
        case 10:
          return { status: PaymentSessionStatus.CANCELED, data: {
              ...input.data,
              response: response
            }}
        case 20:
        case 50:
          return { status: PaymentSessionStatus.PENDING, data: {
              ...input.data,
              response: response
            }}
        case 80:
          return { status: PaymentSessionStatus.REQUIRES_MORE, data: {
              ...input.data,
              response: response
            }}
        case 60:
        case 1000:
          return { status: PaymentSessionStatus.ERROR, data: {
              ...input.data,
              response: response
            }}
        case 100:
          return { status: PaymentSessionStatus.CAPTURED, data: {
              ...input.data,
              response: response
            }}
        default:
          return { status: PaymentSessionStatus.ERROR, data: {
              ...input.data,
              response: response
            }}
      }
    } catch (e) {
      throw this.buildError("An error occurred in getPaymentStatus", e)
    }
  }

  // TODO: Webhooks
  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    this.logger_.debug(
      `RobokassaBase.getWebhookActionAndData payload:\n${JSON.stringify(payload, null, 2)}`
    )

    const invId = payload.data.InvId as string
    const session_id = payload.data.Shp_sessionid as string
    const outSum =  Number(payload.data.OutSum)

    const data = { data: {id: invId}}

    const status = await (await this.getPaymentStatus(data)).status

    switch (status) {
      case PaymentSessionStatus.AUTHORIZED:
        return {
          action: PaymentActions.AUTHORIZED,
          data: { session_id: session_id, amount: outSum}
        }
      case PaymentSessionStatus.CANCELED:
        return {
          action: PaymentActions.CANCELED,
          data: { session_id: session_id, amount: outSum}
        }
      case PaymentSessionStatus.PENDING:
        return {
          action: PaymentActions.PENDING,
          data: { session_id: session_id, amount: outSum}
        }
      case PaymentSessionStatus.REQUIRES_MORE:
        return {
          action: PaymentActions.REQUIRES_MORE,
          data: { session_id: session_id, amount: outSum}
        }
      case PaymentSessionStatus.ERROR:
        return {
          action: PaymentActions.FAILED,
          data: { session_id: session_id, amount: outSum}
        }
      case PaymentSessionStatus.CAPTURED:
        return {
          action: PaymentActions.SUCCESSFUL,
          data: { session_id: session_id, amount: outSum}
        }
      default:
        return { action: PaymentActions.NOT_SUPPORTED }
    }
  }

  /**
   * Helper to build errors with additional context.
   */
  protected buildError(message: string, error: Error | AxiosError): Error {
    if (axios.isAxiosError(error)) {
      return new Error(
        `${message}: ${error.response?.status} ${error.response?.data?.code} - ${error.response?.data?.description}`.trim()
      )
    }
    return new Error(
      `${message}: ${error.message}`.trim()
    )
  }
}

export default RobokassaBase

