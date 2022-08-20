import { DynamicModule, Module, Provider, Scope } from '@nestjs/common';
import { Octokit } from 'octokit';
import {
  OctokitModuleAsyncOptions,
  OctokitModuleOptions,
  OctokitOptionsFactory,
} from './interfaces/octokit-module-options.interface';
import { OCTOKIT, OCTOKIT_OPTIONS } from './octokit.constants';
import { OctokitService } from './octokit.service';

@Module({
  providers: [OctokitService],
  exports: [OctokitService],
})
export class OctokitModule {
  public static forRoot(options: OctokitModuleOptions): DynamicModule {
    return {
      global: options.isGlobal || false,
      module: OctokitModule,
      providers: [
        {
          provide: OCTOKIT,
          scope: options.octokitScope || Scope.DEFAULT,
          useValue: this.instantiateOctokit(options),
        },
      ],
    };
  }

  public static forRootAsync(
    options: OctokitModuleAsyncOptions
  ): DynamicModule {
    const OctokitProvider: Provider = {
      useFactory: (options: OctokitModuleOptions) =>
        this.instantiateOctokit(options),
      provide: OCTOKIT,
      scope: options.octokitScope || Scope.DEFAULT,
      inject: [OCTOKIT_OPTIONS],
    };
    return {
      global: options.isGlobal,
      imports: options.imports || [],
      module: OctokitModule,
      providers: [...this.createAsyncProviders(options), OctokitProvider],
    };
  }

  private static createAsyncProviders(
    optionsAsync: OctokitModuleAsyncOptions
  ): Provider[] {
    if (optionsAsync.useExisting || optionsAsync.useFactory) {
      return [this.createAsyncOptionsProvider(optionsAsync)];
    }
    if (optionsAsync.useClass) {
      return [
        this.createAsyncOptionsProvider(optionsAsync),
        {
          provide: optionsAsync.useClass,
          useClass: optionsAsync.useClass,
        },
      ];
    }
    throw Error(
      'One of useClass, useFactory or useExisting should be provided'
    );
  }
  private static createAsyncOptionsProvider(
    options: OctokitModuleAsyncOptions
  ): Provider {
    if (options.useFactory) {
      return {
        provide: OCTOKIT_OPTIONS,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }

    const provider: Provider = {
      provide: OCTOKIT_OPTIONS,
      useFactory: async (optionsFactory: OctokitOptionsFactory) =>
        await optionsFactory.createOctokitOptions(),
    };
    if (options.useExisting) provider.inject = [options.useExisting];
    if (options.useClass) provider.inject = [options.useClass];
    return provider;
  }

  private static instantiateOctokit(options: OctokitModuleOptions): Octokit {
    let MyOctokit = Octokit;

    if (options.plugins) {
      MyOctokit = MyOctokit.plugin(...options.plugins);
    }
    let instanceOptions: OctokitModuleOptions["octokitOptions"] = {...options.octokitOptions};
    if (typeof instanceOptions?.auth === "function") {
      instanceOptions.auth = instanceOptions.auth();
    }
    return new MyOctokit(instanceOptions);
  }
}
