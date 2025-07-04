export interface RobokassaOptions {
  merchantLogin: string
  alg: string
  password1: string
  password2: string
  testPassword1?: string
  testPassword2?: string
  capture: boolean,
  isTest?: boolean
}

export interface PaymentOptions {
}

export interface RobokassaEvent {
  // TODO: bring types
}

export const PaymentProviderKeys = {
  ROBOKASSA: "robokassa",
}
