[***CRUD UI***](../README.md)

# Release log

##### 0.3.0
###### *(2019/10/17)*

- Added *detail view*. This page displays single record on screen.
- Added support for `CUI_MODES`. `simple_table` is the only mode we had in 0.2. `detail_table` is the table view with newly added detail page links. `single_record` is a whole new mode that is suitable if you only have singular record to edit (eg. options). 
- Fixed problem with display of boolean fields
- Refactored the way middlewares are loaded and get their options
- CUI routers now share cookies. CrudUI should now generate only 2-3 cookies regardless of deployment size.
- Numerous bug fixes and internal refactorings. Changes in views might break existing customizations!

##### 0.2.0
###### *(2019/09/16)*

- Added `secret` field (password)
- Added `boolean` field (checkbox)
- Changed the way `editView` and `listView` work. They are now only in charge of rendering. To hide a field from a screen, use `allowList`, `allowEdit`, `allowEditNew` or `allowEditExisting`.
- Separated functionality of `label` and `title` for the field.
- Added custom CSS classes to all elements (for targeting).
- Added title-s to some buttons.
- Added "production mode" (`isProduction`), which triggers loading minimized CSS and JS instead of regular ones.
- Added `tweaks` in options, allowing developer to customize the appearance without overwriting views.
- Added option to disable error summary.
- Added hook for devs to override the CSS and JS file load order.
- Added eslint and switched all files to strict mode.
- Refactored `ctx.options`, now proxying a lot of properties.

##### 0.1.0
###### *(2019/09/15)*

- Added icons to the UI (powered by [Font Awesome](https://fontawesome.com/icons?d=listing&s=solid&m=free)'s free collection). All available icons can be seein in `ICON_NAMES` enum.
- Fixes for CSRF parsing and flow in general
- We now auto-generate field label if one is not provided
- We now default to `id` as record's id field if one is not provided
- Introduced `listView` and `editView` to `CUIField`, allowing you to render custom HTML for a field or hide field from table or editor.
- Added this release log
- Various minor bug-fixes and improvements.

##### 0.0.3
###### *(2019/09/12)*

- Minor bug fixes and stabilization

##### 0.0.1
###### *(2019/09/12)*

- Initial release

