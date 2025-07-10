# `@gorgo/medusa-payment-robokassa` example

Examples for the [@gorgo/medusa-payment-robokassa](https://www.npmjs.com/package/@gorgo/medusa-payment-robokassa) plugin.

## Prerequisites

- All the [common prerequisites](../README.md#prerequisites).
- A [Robokassa](https://robokassa.com/) account, a shop identifier `MerchantLogin`, secret passwords `password1`, `password2` and for testing `testPassword1` and `testPassword2`.

## Configuration

Set up environment variables for [`medusa`](./medusa):

```
cd medusa
cp .env.template .env
# and configure your own `ROBOKASSA_MERCHANT_LOGIN`, `ROBOKASSA_HASH_ALGORITHM`, `ROBOKASSA_PASSWORD_1`, `ROBOKASSA_PASSWORD_2`, `ROBOKASSA_TEST_PASSWORD_1` and `ROBOKASSA_TEST_PASSWORD_2` inside .env
```

## Installation & Development

Follow the [common instractions](../README.md#installation-development).
