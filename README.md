<div align="center">
  <h1>
  	SMS Gateway
  </h1>
  <p>
  	Wrapper service for sending, logging and testing Short Message Service(SMS)
  </p>
  <p>
    <!-- github -->
    <a href="https://github.com/aasaam/sms-gateway/blob/main/LICENSE"><img alt="License" src="https://img.shields.io/github/license/aasaam/sms-gateway"></a>
    <!-- gitlab -->
    <a href="https://gitlab.com/aasaam/sms-gateway/-/pipelines"><img alt="CI Pipeline" src="https://gitlab.com/aasaam/sms-gateway/badges/master/pipeline.svg"></a>
    <a href="https://gitlab.com/aasaam/sms-gateway/"><img alt="Code Coverage" src="https://gitlab.com/aasaam/spa-fullstack-app-demo/badges/master/coverage.svg"></a>
  </p>
</div>

## Why

- Increase development productivity.
- Log independent of application layer.
- Failover.

## Adapters

| Name        | Key           | Description                                     |
| ----------- | ------------- | ----------------------------------------------- |
| Local       | `local`       | For testing purpose                             |
| MeliPayamak | `melipayamak` | [melipayamak.com](https://www.melipayamak.com/) |

## Features

- Send local for testing during application development.
- One interface rule them all.
- Administrator Web UI

## Configurations

| Name                            | Type      | Description                                                                                              | Default               |
| ------------------------------- | --------- | -------------------------------------------------------------------------------------------------------- | --------------------- |
| ASM_PM_ID                       | `number`  | PM2 process identifier                                                                                   | `0`                   |
| ASM_PUBLIC_APP_TITLE            | `string`  | Application title                                                                                        | `SMS Gateway`         |
| ASM_ADMIN_USERNAME              | `string`  | Administrator user name                                                                                  | `root`                |
| ASM_DEFAULT_USERNAME            | `string`  | Default user name                                                                                        | `default`             |
| ASM_PUBLIC_APP_TEST             | `boolean` | Application is in testing mode                                                                           | `false`               |
| ASM_PUBLIC_LOCAL_FAILED_CHANCE  | `number`  | How is chance between 1 to n to fails will be simulate. If 10, so 1/10 equal 10 percent chance of failed | `10`                  |
| ASM_PUBLIC_ADAPTERS             | `string`  | List of possible adapters                                                                                | `local,melipayamak`   |
| ASM_PUBLIC_BASE_URL             | `string`  | Base URL of application. Example: `/` or `/base-path/`                                                   | `/`                   |
| ASM_PUBLIC_AUTH_COOKIE          | `string`  | Authentication cookie name                                                                               | `__Host-AuthToken`    |
| ASM_PUBLIC_AUTH_COOKIE_LIFETIME | `number`  | Lifetime of authentication token/cookie                                                                  | `14400`               |
| ASM_AUTH_HMAC_ALG               | `string`  | Application authentication HMAC algorithm                                                                | `HS256`               |
| ASM_AUTH_HMAC_SECRET            | `string`  | Application authentication HMAC secret                                                                   | `0`                   |
| ASM_PUBLIC_AUTH_USER_API_KEY    | `string`  | Header that carry the stored user token.                                                                 | `x-user-api-key`      |
| ASM_APP_PORT                    | `number`  | Application HTTP port                                                                                    | `3001`                |
| ASM_APP_INSTANCE                | `number`  | Application cluster number                                                                               | `2`                   |
| ASM_MYSQL_DATABASE              | `string`  | MariaDB database                                                                                         | `mariadb-db`          |
| ASM_MYSQL_USER                  | `string`  | MariaDB username                                                                                         | `mariadb-user`        |
| ASM_MYSQL_PASSWORD              | `string`  | MariaDB password                                                                                         | `mariadb-password`    |
| ASM_MYSQL_HOST                  | `string`  | MariaDB host                                                                                             | `sms-gateway-mariadb` |
| ASM_MELIPAYAMAK_NUMBER          | `string`  | MeliPayamak send number                                                                                  | `undefined`           |
| ASM_MELIPAYAMAK_USERNAME        | `string`  | MeliPayamak username                                                                                     | `undefined`           |
| ASM_MELIPAYAMAK_PASSWORD        | `string`  | MeliPayamak password                                                                                     | `undefined`           |
| ASM_MELIPAYAMAK_PRIORITY        | `string`  | MeliPayamak priority over other adapters                                                                 | `undefined`           |
| ASM_MELIPAYAMAK_COUNTRIES       | `string`  | MeliPayamak allowed send country                                                                         | `IR`                  |

<div>
  <p align="center">
    <img alt="aasaam software development group" width="64" src="https://raw.githubusercontent.com/aasaam/information/master/logo/aasaam.svg">
    <br />
    aasaam software development group
  </p>
</div>
