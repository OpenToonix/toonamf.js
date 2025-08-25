# toonamf.js

AMF (Action Message Format) library for Node.js based on https://github.com/Pyrodash/libamf.

## Requirements

- **[Node.js](https://nodejs.org/) -** version 22.18 or higher

### For Development

- **[PNPM](https://pnpm.io/) -** Version 10.15.0 or higher

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
