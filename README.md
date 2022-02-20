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
import { OctokitModule } from 'nestjs-octokit';

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
import { OctokitModule } from 'nestjs-octokit';

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
import { OctokitService } from 'octokit-nestjs';

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

## Plugins

To use plugins:

```ts
import { OctokitModule } from 'octokit-nestjs';
import { throttling } from '@octokit/plugin-throttling';

@Module({
  imports: [
    OctokitModule.forRoot({
      isGlobal: true,
      plugins: [throttling], // Pass them here
      octokitOptions: {
        // Plugin options:
        throttle: {
          onRateLimit: (retryAfter, options, octokit) => {
            octokit.log.warn(
              `Request quota exhausted for request ${options.method} ${options.url}`
            );
          },
          onAbuseLimit: (retryAfter, options, octokit) => {
            octokit.log.warn(
              `Abuse detected for request ${options.method} ${options.url}`
            );
          },
        },
      },
    }),
  ],
})
export class AppModule {}
```

## TODO

- [ ] Make `octokit` a peer dependency
