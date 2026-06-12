# toonamf.js

AMF (Action Message Format) library for Node.js based on https://github.com/Pyrodash/libamf.

## The Reason

Although the `libamf` library is pretty good for small applications, there are some issues
that we're looking to address by creating this library. Some of them are:

- **Security:** We take security seriously. Because of this, we decided
  to mark all dependencies from `libamf` as peer dependencies,
  allowing users of `toonamf.js` to update all of them in demand,
  without needing to wait for us to update them and create new releases.
- **Modularity:** Something we really love is the ability to reuse useful code.
  Because of this, we decided to separate all dependencies from `libamf`,
  so users of `toonamf.js` can install only what they need,
  instead of just installing all parts of the library, including the ones
  they don't really need.
- **Type safety:** You may have developed applications using type-flexible
  languages like JavaScript or Python. We have too! Because of this,
  we know it can be very easy to develop applications using type-flexible
  languages, but they come with a cost: If you don't handle types correctly,
  you surely will find many issues when running your applications
  in production environments.

  To avoid this, we decided to rewrite `libamf` using **TypeScript**,
  so it becomes harder to introduce type-flexible related issues
  in production environments.

## Requirements

- **[Node.js](https://nodejs.org/) -** version 24.11.1 or higher

### For Development

- **[PNPM](https://pnpm.io/) -** Version 11.1.3 or higher

## Installing

Before installing, it's highly recommended to execute the commands in this guide
from the root directory of the project.

### For Development

1. Clone the repository
2. Install dependencies

    ```bash
    pnpm install
    ```

3. Since this project uses workspaces,
   you can run scripts from the root directory using the command
   `pnpm run --filter @toonamfjs/<package-name> <script>`.

    In this order of ideas, you can run the following commands:

    - `pnpm run --filter @toonamfjs/client test` to test the client
    - `pnpm run --filter @toonamfjs/server test` to test the server
