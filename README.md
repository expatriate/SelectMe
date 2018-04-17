# SelectMe
Custom select jQuery plugin with aria-roles and keyboard navigation

# Initialise
Plugin can initialise from default syntax markup or from object with options

# Default syntax:
```
<div class="select">
  <input>
  <div class="select__arrow">
  </div>
  <div class="select__value">
  </div>
  <div class="select__body">
  </div>
</div>
```

# Options
1. `aria` `true|false` - Include aria-roles. Default **true**
2. `confirm` `true|false` - Confirm mode. Default **false**
3. `fromMarkup` `true|false` - When true, plugin uses setted markup. False - draw new markup. Default **false**
4. `scroll` `true|false` - Using scroll in options list. Default **false**
5. `arrow` `true|false` - Added arrow on select field. Default **false**
6. `arrowPath` `*String*` - Path to arrow SVG. Default ''
7. `items` `[{ID:__, NAME:__},{ID:__, NAME:__},{ID:__, NAME:__}...]` - Set of options. Default []
8. `selectClass` `className` - Additional classes to select block. Can be multiple. Default ''
9. `optionClass` `className` - Additional classes to options block. Can be multiple. Default ''
10. `inputClass` `className` - Additional classes to input block. Can be multiple. Default ''
11. `wrapClass` `className` - Additional classes to wrapper block. Can be multiple. Default ''
12. `arrowClass` `className` - Additional classes to arrow. Can be multiple. Default ''
13. `lang` `ru|en` - Language option. Default **ru**

# Scope variables
```
scope = {
    value: '', // Selected option value
    opened: false, // Is opened state 
    optionsCount: 0, // Options count
    id: '', // Select element ID
    valid: true // Validation elements
}
```

# Callbacks:
1. `onSelectedValue` - Runs after select event is triggered, returns value of checked element
2. `onListClosed` - Runs after options list is closed
3. `onListOpened` - Runs after options list is opened
4. `onInitEnd` - Runs after full initialise
5. `beforeInit` - Runs before init function

# Example
1.`$('.select').SelectMe({items:[{ID:1, NAME:'NUM1'},{ID:2, NAME:'NUM2'}]})`

from
```
<div class="select"><div>
```
2.`$('.select').SelectMe({fromMarkup: true})`

from
```
<div class="select">
  <input type="hidden">
  <div class="select__arrow">
  </div>
  <div class="select__value">
    Choose item
  </div>
  <div class="select__body">
    <div class="select__item" data-id="1">NUM1</div>
    <div class="select__item" data-id="2">NUM2</div>
  </div>
</div>
```
