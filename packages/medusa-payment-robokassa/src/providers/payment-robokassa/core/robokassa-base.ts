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
import crypto from "crypto"
import { RobokassaProviderOptions } from "../types"
import axios, { AxiosError } from "axios"
import {
  getSmallestUnit,
} from "../utils/get-smallest-unit"
import jwt from "jsonwebtoken"
import { generateInvoiceJWT } from "./utils"

abstract class TkassaBase extends AbstractPaymentProvider<RobokassaProviderOptions> {
  static identifier = "robokassa"
  protected options_: RobokassaProviderOptions
  protected logger_: Logger
  protected serverUrl_ = "https://services.robokassa.ru/InvoiceServiceWebApi/api/CreateInvoice"
  protected test_serverUrl_ = "https://test.robokassa.ru/InvoiceServiceWebApi/api/CreateInvoice"

  constructor(container: { logger: Logger }, options: RobokassaProviderOptions) {
    super(container, options)
    this.options_ = options
    this.logger_ = container.logger
  }

  /**
   * Initiate a new payment.
   */
  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    this.logger_.debug(`TkassaBase.initiatePayment input:\n${JSON.stringify(input, null, 2)}`)

    const { amount, context = {}, currency_code } = input
    const invId = context.idempotency_key as string
    console.log("options_", this.options_)
    try {
      const response = await generateInvoiceJWT(
        this.options_,
        invId,
        Number(amount),
        "order payment",
        this.options_.isTest ? this.serverUrl_ : this.test_serverUrl_
      )
      const invoiceId = String(response.InvoiceId)
      return { id: invoiceId, data: { confirmation_url: response.ConfirmationUrl } }
    } catch (e) {
      throw this.buildError("An error occurred in initiatePayment", e)
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
