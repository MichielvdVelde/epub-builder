# Renderers

A `Renderer` is a function that takes a view and returns a promise that resolves
to a string. The view is an object that contains the data to be rendered.

```ts
type Renderer<View> = (view: View) => Promise<string>;
```

This is an agnostic interface that can be implemented with different templating
engines.

## Supported Renderers

Currently, the following renderers are supported:

- [EJS](#ejs)
- [Mustache](#mustache)

### EJS

EJS is a simple templating language that lets you generate HTML markup with
plain JavaScript.

```ts
import { createRenderer } from "./renderers/ejs.js";

// Create a renderer for an EJS template
const render = createRenderer({ template: "<h1><%= title %></h1>" });

// Example usage
const data = { title: "Hello, World!" };
const html = render(data);
console.log(html); // <h1>Hello, World!</h1>
```

### Mustache

Mustache is a logic-less template syntax.

```ts
import { createRenderer } from "./renderers/mustache.js";

// Create a renderer for a Mustache template
const render = createRenderer({ template: "<h1>{{title}}</h1>" });

// Example usage
const data = { title: "Hello, World!" };
const html = render(data);
console.log(html); // <h1>Hello, World!</h1>
```
