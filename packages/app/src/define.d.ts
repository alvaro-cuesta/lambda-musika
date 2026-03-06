// eslint-disable-next-line @typescript-eslint/consistent-type-definitions -- we are merging into an interface
interface ImportMetaEnv {
  readonly GIT_COMMIT_SHORT_SHA: string;
  readonly PACKAGE_DESCRIPTION: string;
  readonly PACKAGE_HOMEPAGE: string;
  readonly PACKAGE_CONFIG_NAME: string;
  readonly PACKAGE_CONFIG_SHORT_NAME: string;
  readonly PACKAGE_CONFIG_DESCRIPTION: string;
  readonly PACKAGE_CONFIG_AUTHOR: string;
  readonly PACKAGE_CONFIG_THEME_COLOR: string;
  readonly PACKAGE_CONFIG_URL: string;
  readonly PACKAGE_CONFIG_PUBLIC_URL_BASE: string;
  readonly PACKAGE_CONFIG_REPOSITORY_URL: string;
}
