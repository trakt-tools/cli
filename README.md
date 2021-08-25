# @trakt-tools/cli

A CLI helper for trakt-tools.

### How to Use

- To install and use:

```
npm install --save-dev @trakt-tools/cli
npx trakt-tools
```

- To use without installing:

```
npx @trakt-tools/cli
```

### Commands

**If command options aren't provided as arguments, an interactive prompt is used to retrieve them.**

**Use `[command] --help` to see all the options.**

- `dev`: Helper tools for development

  - `create-service`: Create a new streaming service

    Example:

    ```
    npx trakt-tools dev create-service --name "Netflix" --id "netflix" --home-page "netflix.com" --has-sync --has-auto-sync
    ```

  - `update-service`: Update an existing streaming service (to add a scrobble/sync function)

    Example:

    ```
    npx trakt-tools dev update-service --id "netflix" --add-scrobbler
    ```

  - `update-readme`: Updates the README

    Example:

    ```
    npx trakt-tools dev update-readme
    ```
