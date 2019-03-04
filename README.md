# Code ownership extension for Sourcegraph

A [Sourcegraph extension](https://docs.sourcegraph.com/extensions) that shows code owners of the current file.

[**🗃️ Source code**](https://github.com/sourcegraph/sourcegraph-code-ownership)

[**➕ Add to Sourcegraph**](https://sourcegraph.com/extensions/sourcegraph/code-ownership) (see [usage instructions](#usage) for self-hosted Sourcegraph instances)

## Features

Works on [Sourcegraph.com](https://sourcegraph.com), [self-hosted Sourcegraph instances](https://docs.sourcegraph.com/#quickstart), and on code hosts (via the [Sourcegraph browser extension](https://docs.sourcegraph.com/integration/browser_extension)).

- **Code owner of current file** displayed in the file header

Only [`CODEOWNERS` and `.github/CODEOWNERS` files](https://help.github.com/en/articles/about-code-owners) are supported right now. [File an issue](https://github.com/sourcegraph/sourcegraph-code-ownership/issues) if you want need support for another code ownership scheme.

![Screenshot](https://storage.googleapis.com/sourcegraph-assets/code-ownership-extension-0.png)

## Usage

**Note:** Using this extension on private code in the [Sourcegraph browser extension](https://docs.sourcegraph.com/integration/browser_extension) requires a [self-hosted Sourcegraph instance](https://docs.sourcegraph.com/#quickstart) (because it needs access to the repository's files that define code owners).

1. Enable the `sourcegraph/code-ownership` extension:
   - On Sourcegraph.com, visit [https://sourcegraph.com/extensions/sourcegraph/code-ownership](https://sourcegraph.com/extensions/sourcegraph/code-ownership) to enable it.
   - On a self-hosted Sourcegraph instance, select **User menu > Extensions**, search for `sourcegraph/code-ownership`, and enable it.
1. Visit any code file in a repository containing a `CODEOWNERS` or `.github/CODEOWNERS` file.
1. Look in the file header to see the current file's code owner(s).

### On your code host

This extension adds the same features on your code host if you're using the [Sourcegraph browser extension](https://docs.sourcegraph.com/integration/browser_extension). To use it on your code host:

1. Install the [Sourcegraph browser extension](https://docs.sourcegraph.com/integration/browser_extension).
   - If you're using it with a self-hosted Sourcegraph instance, enter the Sourcegraph instance URL into the Sourcegraph browser extension options menu.
1. Follow the [usage steps](#usage) above to enable the `sourcegraph/code-ownership` extension.
1. Visit any code file (on your code host) in a repository containing a `CODEOWNERS` or `.github/CODEOWNERS` file.
1. Look in the file header to see the current file's code owner(s).

![Screenshot on GitHub](https://storage.googleapis.com/sourcegraph-assets/code-ownership-extension-github-0.png)

## Roadmap

- More ways to define code owners (such as by directory-specific CODEOWNERS files, from an external code owners service, etc.)
- Per-repository configuration of how code owners are defined
- Search by code owner (e.g., `codeowner:alice` in a Sourcegraph search query)
- Directory ownership
- Filter a code review to only diffs to files you own
