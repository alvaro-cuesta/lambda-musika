import { JSDOM } from 'jsdom';
import type { Application, TypeDocOptions } from 'typedoc';

type GithubWidgetPluginOptions = {
  href: string;
  label: string;
  target?: string;
};

function githubWidgetPlugin(options: GithubWidgetPluginOptions) {
  return function (app: Application) {
    app.renderer.on('endPage', (event) => {
      if (!event.contents) {
        app.logger.warn('No contents to modify for GitHub widget');
        return;
      }

      const dom = new JSDOM(event.contents);
      const window = dom.window;
      const document = window.document;

      const searchWidget = document.querySelector(
        'header.tsd-page-toolbar > div.tsd-toolbar-contents > button#tsd-search-trigger',
      );

      if (!searchWidget) {
        app.logger.error(
          'Could not find search widget to insert GitHub widget',
        );
        return;
      }

      const anchor = document.createElement('a');

      anchor.classList.add('tsd-widget');
      anchor.classList.add('github-widget');

      anchor.setAttribute('href', options.href);
      anchor.setAttribute('aria-label', options.label);
      if (options.target) {
        anchor.setAttribute('target', options.target);
      }

      anchor.innerHTML = `<svg width="20" height="20" style="transform: translateY(8px);" viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="var(--color-text)"/></svg>`;

      searchWidget.before(anchor);

      event.contents = dom.serialize();
    });
  };
}

const config: Partial<TypeDocOptions> = {
  out: 'docs',
  tsconfig: 'tsconfig.package.json',
  includeVersion: true,
  useFirstParagraphOfCommentAsSummary: true,
  githubPages: false,
  headings: {
    readme: false,
  },
  navigationLinks: {
    'Lambda Musika': 'https://lambda.cuesta.dev',
  },
  cleanOutputDir: true,
  cacheBust: true,
  searchInComments: true,
  searchInDocuments: true,
  plugin: [
    githubWidgetPlugin({
      href: 'https://github.com/alvaro-cuesta/lambda-musika/',
      label: 'Lambda Musika @ GitHub',
    }),
  ],
};

export default config;
