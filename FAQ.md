# Chameleon FAQ

## Why update context with reducers?

* Reducers are a great way to handle multiple updates to a single model (the context), without knowing everything about the context up until that point. For example, in the following component tree:

```js
<UpdateContext type="INCREMENT_SECTION_DEPTH">
  <UpdateContext type="INVERT_COLORS">
    1
  </UpdateContext>
</UpdateContext>
```

Both calls to the component reducer only need to know how to do their specific update, rather than having knowledge of all of the context.

* In addition, reducers allow us to cache intermediate results, resulting in efficiency gains. In the following component tree:

```js
<UpdateContext type="INCREMENT_SECTION_DEPTH">
  <UpdateContext type="INVERT_COLORS">
    1
  </UpdateContext>
  <UpdateContext type="MAKE_EVERYTHING_BACKWARDS">
    2
  </UpdateContext>
</UpdateContext>
```

The context at 1 is:

```js
contextReducer(
  contextReducer(initialContext, { type: 'INCREMENT_SECTION_DEPTH'}),
  { type: 'INVERT_COLORS' }
)
```

and the context at 2 is:

```js
contextReducer(
  contextReducer(initialContext, { type: 'INCREMENT_SECTION_DEPTH'}),
  { type: 'MAKE_EVERYTHING_BACKWARDS' }
)
```

`contextReducer(initialContext, { type: 'INCREMENT_SECTION_DEPTH'})` is reused in both cases, and Chameleon makes sure to reuse that intermediate result!
