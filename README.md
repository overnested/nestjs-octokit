# NestJS Octokit Module

This module facilitates the usage of [Octokit](https://github.com/octokit/octokit.js) in [NestJS](https://github.com/nestjs/nest).

## Introduction

Octokit is "The all-batteries-included GitHub SDK for Browsers, Node.js, and Deno".
Using `nestjs-octokit` you can register the Octokit module and configure it the way NestJS suggests, then inject it as a standard NestJS injectable.

## Installation

On Yarn:

```shell
yarn add nestjs-octokit
```

On NPM:

```shell
npm install nestjs-octokit
```

## Usage

First register the module:

```ts
@Module({
  imports: [
    OctokitModule.forRoot({
      isGlobal: true,
      octokitOptions: {
        auth: 'my-github-token',
      },
    }),
    // ...
  ],
})
export class AppModule {}
```

Or if want to inject any dependency:

```ts
@Module({
  imports: [
    OctokitModule.forRootAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        octokitOptions: {
          auth: configService.get<string>('GITHUB_AUTH_TOKEN'),
        },
      }),
    }),
    // ...
  ],
})
export class AppModule {}
```

Then you can inject the service:

```ts
@Controller()
export class SomeController {
  constructor(private readonly octokitService: OctokitService) {}

  @Get('/')
  someEndpoint() {
    const response = await this.octokitService.rest.search.repos({
      q: 'nest-js',
    });

    return response.data.items;
  }
}
```
