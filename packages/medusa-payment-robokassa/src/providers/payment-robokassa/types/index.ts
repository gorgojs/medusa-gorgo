export interface RobokassaOptions {
  merchantLogin: string
  hashAlgorithm: string
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
  out_summ: string
  OutSum: string
  inv_id: string
  InvId: string
  crc: string
  SignatureValue: string
  PaymentMethod: string
  IncSum: string
  IncCurrLabel: string
  EMAil: string
  Fee: string
  Shp_SessionID: string
}

export const PaymentProviderKeys = {
  ROBOKASSA: "robokassa",
}
