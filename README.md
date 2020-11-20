# publish-monorepo-packages

Tool to make easier publish packages in monorepo to the registry.

## TODO

- [x] Ensure working directory is clean before publishing
- [ ] Ensure current branch is up-to-date with remote before publishing
- [ ] Detect lerna config and offer to migrate the config
- [ ] Require config file with allowed branch name specified
- [ ] Test if user is logged in to npm first, so we don't fail when publishing
- [x] Build dependency tree by taking dependencies, optionalDependencies, devDependencies, peerDependencies into account
- [ ] Lint the package.json to make sure that files specified in main, types, typings, module, react-native field etc. actually exist
- [ ] Determine which packages have changed since last release by diffing built files
- [ ] If a dist tag is specified in the config file, fetch the packages for that dist tag, if it's not published, then fetch latest
- [ ] When diffing, remove `devDependencies` from `package.json`
- [ ] Generate changelog by diffing with last release using conventional-changelog
- [ ] Ensure that changelog points to correct git repository
- [ ] If a changelog could not be derived from the commits, prompt for one
- [ ] Let the user modify the changelog files before proceeding
- [ ] Write changelogs to each package directory and merge with existing changelogs
- [ ] Before publish, bump version of packages according to semver
- [ ] Before publish, Bump version of devDependencies and peerDependencies for workspace packages
- [ ] Create separate git tags for each package and version
- [ ] Commit all the changes and push with tags to remote before publishing
- [ ] Publish the packages in correct order
- [ ] If a publish failed, abort publishing packages dependent on it as well, but ask the user whether to continue to publish other packages
- [ ] If a publish failed, allow user to roll back the changes made for the specific package and delete the tags locally and remote

## Development workflow

To get started with the project, run `yarn` in the root directory to install the required dependencies:

```sh
yarn
```

When developing, run watch mode to recompile any files when they change:

```sh
yarn watch
```

When making changes, make sure your code passes TypeScript and ESLint. Run the following to verify:

```sh
yarn lint
yarn typescript
```

To fix formatting errors, run the following:

```sh
yarn lint --fix
```

While developing, you can run the typescript type-checker in watch mode:

```sh
yarn typescript --watch
```

Remember to add tests for your change if possible. Run the unit tests by:

```sh
yarn test
```

While developing, you can run the tests in watch mode:

```sh
yarn test --watch
```

### Commit message convention

We follow the [conventional commits specification](https://www.conventionalcommits.org/en) for our commit messages:

- `fix`: bug fixes, e.g. fix crash due to deprecated method.
- `feat`: new features, e.g. add new method to the module.
- `refactor`: code refactor, e.g. migrate from class components to hooks.
- `docs`: changes into documentation, e.g. add usage example for the module..
- `test`: adding or updating tests, eg add integration tests using detox.
- `chore`: tooling changes, e.g. change CI config.

Our pre-commit hooks verify that your commit message matches this format when committing.

### Linting and tests

[ESLint](https://eslint.org/), [Prettier](https://prettier.io/), [TypeScript](https://www.typescriptlang.org/)

We use [TypeScript](https://www.typescriptlang.org/) for type checking, [ESLint](https://eslint.org/) with [Prettier](https://prettier.io/) for linting and formatting the code, and [Jest](https://jestjs.io/) for testing.

Our pre-commit hooks verify that the linter and tests pass when committing.
