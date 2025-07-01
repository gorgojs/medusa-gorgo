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

abstract class TkassaBase extends AbstractPaymentProvider<RobokassaProviderOptions> {
  static identifier = "robokassa"
  protected options_: RobokassaProviderOptions
  protected logger_: Logger
  protected serverUrl_ = "https://auth.robokassa.ru/Merchant/Index.aspx"

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
      `TkassaBase.initiatePayment input:\n${JSON.stringify(input, null, 2)}`
    )

    const { amount, context = {} } = input
    const invId = this.stringToNumberHash(context.idempotency_key as string).toString()
    const outSum = Number(amount).toFixed(2)
    console.log("account_holder", context.account_holder)
    console.log("customer", context.customer)
    const raw = [
      this.options_.merchantLogin,
      outSum,
      invId,
      this.options_.password1
    ].join(":")
    const signature = md5(raw)

    console.log("signature", signature)

    const params = new URLSearchParams({
      MrchLogin: this.options_.merchantLogin,
      OutSum: outSum,
      InvId: invId,
      SignatureValue: signature,
      ...(this.options_.isTest ? {IsTest: "1"} : {})
    }).toString()

    console.log("params", params)

    const url = `${this.serverUrl_}?${params}`

    console.log("url", url)

    return {
      id: invId,
      data: { confirmation_url: url }
    }
  }

  /**
   * Capture an existing payment.
   */
  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    this.logger_.debug(`TkassaBase.capturePayment input:\n${JSON.stringify(input, null, 2)}`)

  }

  /**
   * Authorize a payment by retrieving its status.
   */
  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    this.logger_.debug(`TkassaBase.authorizePayment input:\n${JSON.stringify(input, null, 2)}`)

  }

  /**
   * Delete a payment.
   * Payment delete is not supported by T-Kassa.
   */
  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    this.logger_.debug(`TkassaBase.deletePayment input:\n${JSON.stringify(input, null, 2)}`)

    return input
  }

  /**
   * Update a payment.
   * Payment update is not supported by T-Kassa.
   */
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    this.logger_.debug(`TkassaBase.updatePayment input:\n${JSON.stringify(input, null, 2)}`)

    return input
  }

  /**
   * Refund a payment.
   */
  async refundPayment({
    amount,
    data,
  }: RefundPaymentInput): Promise<RefundPaymentOutput> {
    this.logger_.debug(`TkassaBase.refundPayment input:\n${JSON.stringify({ amount, data }, null, 2)}`)

  }

  /**
   * Cancel an existing payment.
   */
  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    this.logger_.debug(`TkassaBase.cancelPayment input:\n${JSON.stringify(input, null, 2)}`)

  }

  /**
   * Retrieve a payment.
   */
  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    this.logger_.debug(`TkassaBase.retrievePayment input:\n${JSON.stringify(input, null, 2)}`)

  }

  /**
   * Retrieve payment status and map it to Medusa status.
   */
  async getPaymentStatus(
    input: GetPaymentStatusInput
  ): Promise<GetPaymentStatusOutput> {
    this.logger_.debug(
      `TkassaProvider.getPaymentStatus input:\n${JSON.stringify(input, null, 2)}`
    )

  }


  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    this.logger_.debug(
      `TkassaProvider.getWebhookActionAndData payload:\n${JSON.stringify(payload, null, 2)}`
    )

  }

  protected async isWebhookEventValid(payload: ProviderWebhookPayload["payload"]): Promise<boolean> {

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

export default TkassaBase
