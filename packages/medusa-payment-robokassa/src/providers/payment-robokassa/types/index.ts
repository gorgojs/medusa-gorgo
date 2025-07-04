export interface RobokassaProviderOptions {
  merchantLogin: string
  alg: string
  password1: string
  password2: string
  test_password1?: string
  test_password2?: string
  capture: boolean,
  isTest?: boolean
}

export interface PaymentOptions {
}

export interface RobokassaWebhookEvent {
}

export const PaymentProviderKeys = {
  ROBOKASSA: "robokassa",
}
