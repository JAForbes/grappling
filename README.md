Save the state of the entire game.

```js
quickSave2 = _( E() )
  .omit('Screen')
  .cloneDeep()
```

Reload a save

```js
_.extend(E.components,_.cloneDeep(quickSave))
```

Disconnect all grappling hooks

```js
delete E.components.GrapplingHookConnection
```

Disconnect a single grappling hook


```js
delete E.components.GrapplingHookConnection[4]
```

Reconnect the grappling hook, to where it was at save time.

```js
E(4, 'GrapplingHookConnection', quickSave.GrapplingHookConnection[4])
```

Turn off state being drawn to the screen
```js
delete E.components.StateDrawable
```

Reinstate it again

```js
E.components.StateDrawable = quickSave.StateDrawable
```
