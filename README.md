# Chameleon JS

> Business logic and 

## What is Chameleon JS?

Chameleons JS is a library that facilitates the separation of style from content through the use context. The goal of the library is to allow you to write components that are automatically styled correctly, even they are moved to a different part of the app.

For example, you should be able to move a `Title` component unchanged from a jumbotron and into a panel, and have it style itself correctly in both situations. The following should also work:

```jsx
<Heading>This title will be rendered as an h1</Heading>
<Section>
  <Heading>This title will be rendered as an h2</Heading>
</Section>
```

## Why Chameleon JS?



## Quick overview of how to use Chameleon JS

In this quick overview, we'll use Chameleon JS to make a `Section` and `Header` components. By default, the `Header` component will render as an `h1`. However, within a `Section`, it will render as an `h2`. Within two nested sections, it will render as an `h3`, and so on.

* You create your `ContextChanger` by initializing it with a reducer. This package comes with several, out-of-the-box reducers for you to use. However, we're going to make our own:

```js
// StyleContext.js
import { makeContextComponents } from 'chameleon';

const initialContext = {
  sectionDepth: 0,
};
const contextReducer = (previousContext, { type }) => {
  if (type === 'INCREMENT_SECTION_DEPTH') {
    return {
      ...previousContext,
      sectionDepth: previousContext.sectionDepth + 1,
    };
  }
  return previousContext;
};

const { UpdateContext, ContextProvider } = makeContextComponents(contextReducer, initialContext);
export {
  UpdateContext,
  ContextProvider,
};
```

* Let's make a quick section component that wraps `UpdateContext`.

```js
// Section.js
import { UpdateContext } from './StyleContext';

export default ({ children }) => (<UpdateContext type="INCREMENT_SECTION_DEPTH">
  { children }
</UpdateContext>);
```

* Now, let's make a heading component which reads the `sectionDepth` from the context. 

```js
// Header.js
import { ContextProvider } from './StyleContext';

export default const ({ children }) => (<ContextProvider>{style => {
  const HeaderTag = `h${style.sectionDepth + 1}`;
  return <HeaderTag>{ children }</HeaderTag>;
}}</ContextProvider>);
```

* Use them!

```js
const MyArticle = () => (<div>
  <Header>How To Use Chameleon JS</Header>
  <Section>
    <Header>This subheader is an h2</Header>
    <Section>
      <Header>This sub-sub-header is an h3!</Header>
    </Section>
  </Section>
</div>);
```

## That was a silly, contrived example... what else should one use Chameleon JS for?

Chameleon JS can be used to manage anything that's unrelated to the components used. For example:

* Color palette (e.g. "night mode" vs "day mode", or different color schemes for different sections in a marketing site). Pair this with CSS transitions and watch your whole site transition!
* Modify the font size, color, etc. of elements when they exist within a modal or panel, or when nested within two panels!
  * Not just text, 
* Control flex or css grid layout of children.
* Turn off `pointer-events` and modify the `cursor` for a section of the site that is disabled, or which is behind a modal.
  * A more interesting example is preventing click interactions on existing elements to allow the user to specify which element of the website is malfunctioning.
* Padding: use Chameleon JS to control the left-padding of nested comments.
* Manage heading levels, as in the previous example.
* Prevent the selection of text.

## Recommended patterns

For the sake of brevity, the minimal example omits several patterns and advance features.

* Create components that wrap `<UpdateContext>`. In the minimal example, there's no reason to simplify the API. But once you start passing more parameters to `<UpdateContext>`, you will benefit from components like the following:

```js
// Nightmode.js
import React from 'react';
import { UpdateContext } from './StyleContext';
const NightMode = ({ children }) => <UpdateContext
  type="CHANGE_MODE"
  bgColor="black"
  color="white"
  {/* etc */}
>
  { children }
</UpdateContext>
```

Note: You can also consider simplifying your action's API. `type="CHANGE_MODE" mode="NIGHT"` might be sufficient.

* Wrap the context in a class, and have derived setters and getters. Follow immutable-js's pattern: have all setters return a new, modified instance. *Both of these are very important for larger projects.* Example:

```js
// StyleContext.js
class StyleContext {
  constructor(context) {
    // context has the form
    // {
    //   mode: 'NIGHT' | 'DAY',
    //   sectionDepth: number,
    // }
    // In practice, you should use TypeScript, Flow or a runtime type-checker for this.
    this.context = context;
  }

  get foregroundStyleFromMode() {
    return ({
      NIGHT: {
        color: 'white',
      },
      DAY: {
        color: 'black',
      },
    })[this.context.mode];
  }

  get styleFromsectionDepth() {
    return {
      size: 45 - 5 * this.context.sectionDepth,
      lineHeight: '1em',
      fontWeight: 900 - 100 * this.context.sectionDepth,
      marginBottom: 20 - 2 * this.context.sectionDepth,
    };
  }

  get headingStyle() {
    return {
      ...(this.forgegroundStyleFromMode),
      ...(this.styleFromsectionDepth),
    };
  }

  get HeadingComponent() {
    // in practice, you might want all your headings to be span's :)
    return `h${this.context.sectionDepth + 1}`;
  }

  incrementSectionDepth() {
    return new StyleContext({
      ...this.context,
      sectionDepth: this.context.sectionDepth + 1,
    });
  }
}

const contextReducer = (previousContext, action) => {
  switch (action.type) {
    case "INCREMENT_SECTION_DEPTH":
      return previousContext.incrementSectionDepth();
    // ... case "CHANGE_MODE": ...
  }
  return previousContext;
}

// Header
export default ({ children, ...props }) => (<ContextProvider>{ context =>
  // ...props passes on onClick handlers, etc.
  <context.HeadingComponent
    style={context.headingStyle}
    { ...props }
  >
    { children }
  </context.HeadingComponent>;
}</ContextProvider>);
```

* Use the [prop getters](https://blog.kentcdodds.com/how-to-give-rendering-control-to-users-with-prop-getters-549eaef76acf) pattern (not shown in the previous example).
* Use the `updateContextGenerator`. `makeContextComponents` also returns `updateContextGenerator`, which is a convenient wrapper around `UpdateContext`. Example:

```js
const { UpdateContext, updateContextGenerator } = makeContextComponents(contextReducer, initialContext);

// the following are equivalent:
const IncrementSectionDepth = updateContextGenerator({ type: 'INCREMENT_SECTION_DEPTH' });
const IncrementSectionDepth = ({ children }) => (<UpdateContext type="INCREMENT_SECTION_DEPTH">
  { children }
</UpdateContext>);
```

* Conform to redux best practices! Create a `Types` enum, etc.
* For simple projects, you can use the `defaultReducer`, which just updates fields on the context object. It is effectively:

```js
const defaultReducer = (previousContext, action) => {
  ...previousContext,
  ...action,
};
```

## Chameleon JS doesn't need to be for only styles

* You're right, but in my opinion, non-style props (business logic) should probably be passed down explicitly with props.
* Nonetheless, there's nothing stopping you. Do what's right for your project!

## Full API

Throughout this section, we will use `<C>` or `C` to refer to the type of the context, and `<A>` or `A` to refer to the type of the action. If you're not familiar with generics, you can safely ignore those annotations.

### function `makeContextComponents`

Signature: 
```js
(Reducer<C, A>, C) => {
  UpdateContext: UpdateContext<A>,
  ContextProvider: ContextProvider<C>,
  updateContextGenerator: UpdateContextGenerator<A>,
}
```

i.e. a function which takes a reducer and an initial context, and returns a hash.

### type `Reducer<C, A>`

A function, whose signature is:
```js
(C, A) => C
```

i.e. a function of `(oldContext, action) => newContext`

### type `UpdateContext<A>`

A component whose props are of type `<A>` and which renders its children.

### type `ContextProvider<C>`

A render-prop component which passes the current context, of type `C` to its children.

### type `updateContextGenerator<A>`

A wrapper that makes a generic component that always passes the same action `A` to the reducer.

## TODO

* Rewrite README with styled components