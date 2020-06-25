# openapi-builder

> builder for openapi files

Editing large or very large yaml files is for the real masters of the api-verse.

If you prefer to have some smaller files in folders which shall construct the later,
this project might be for you.

It allows to create the component references in individual files, together with mixins.

## Installation

```
npm i -g openapi-builder
```

## Usage

create a new environment

```bash
mkdir examples mixins paths parameters responseBodies responses schemas securitySchemes
touch main.yaml
openapi-builder init
```

This creates a `.openapi-builder.json` configuration file in this folder.

Please take a look at the [example](./example) folder. Watch out for `$schemas$`, `$mixins` or `$mixin` tags.

Will try to complete the docs later...

build the final openapi yaml file with

```bash
openapi-builder
```

## License

Source code is [MIT](./LICENSE) licensed

The example uses the well known swagger [petstore](https://editor.swagger.io) which is licensed under Apache 2.0
