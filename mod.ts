/**
 * Fedify: a fediverse server framework
 * ====================================
 *
 * Fedify is a TypeScript library for building federated server apps
 * powered by [ActivityPub] and other standards, which is so-called [fediverse].
 * It aims to eliminate the complexity and redundant boilerplate code when
 * building a federated server app, so that you can focus on your business
 * logic and user experience.
 *
 * Currently, Fedify provides the following features out of the box:
 *
 * - Type-safe objects for [Activity Vocabulary] (including some vendor-specific
 *   extensions)
 * - [WebFinger] client and server
 * - [HTTP Signatures]
 * - Middlewares for handling webhooks
 * - [NodeInfo] protocol
 * - Special touch for interoperability with Mastodon and few other popular
 *   fediverse software
 * - CLI toolchain for testing and debugging
 *
 * If you want to know more about the project, please take a look at the
 * following resources:
 *
 * - [GitHub](https://github.com/dahlia/fedify)
 * - [Tutorial](https://fedify.dev/tutorial)
 * - [Examples](https://github.com/dahlia/fedify/tree/main/examples)
 *
 * [ActivityPub]: https://www.w3.org/TR/activitypub/
 * [fediverse]: https://en.wikipedia.org/wiki/Fediverse
 * [Activity Vocabulary]: https://www.w3.org/TR/activitystreams-vocabulary/
 * [WebFinger]: https://datatracker.ietf.org/doc/html/rfc7033
 * [HTTP Signatures]: https://tools.ietf.org/html/draft-cavage-http-signatures-12
 * [NodeInfo]: https://nodeinfo.diaspora.software/
 *
 * @module
 */
export * from "./federation/mod.ts";
export { sign, verify, type VerifyOptions } from "./httpsig/mod.ts";
export * from "./nodeinfo/mod.ts";
export * from "./runtime/mod.ts";
export * from "./sig/mod.ts";
export * from "./vocab/mod.ts";
export { lookupWebFinger, type ResourceDescriptor } from "./webfinger/mod.ts";
