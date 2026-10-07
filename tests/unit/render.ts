import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

let container: AstroContainer | undefined;

export async function render(component: AstroComponentFactory, props: Record<string, unknown> = {}, slots?: Record<string, string>) {
  container ??= await AstroContainer.create();
  return container.renderToString(component, { props, slots });
}
