---
description: >-
  You can register an actor dispatcher so that Fedify can dispatch
  an appropriate actor by its bare handle.  This section explains
  how to register an actor dispatcher and the key properties of an actor.
prev:
  text: Vocabulary
  link: ./vocab.md
next:
  text: Inbox listeners
  link: ./inbox.md
---

Actor dispatcher
================

In ActivityPub, [actors] are entities that can perform [activities].  You can
register an actor dispatcher so that Fedify can dispatch an appropriate actor
by its bare handle (i.e., handle without @ prefix and domain suffix).
Since the actor dispatcher is the most significant part of the Fedify,
it is the first thing you need to do to make Fedify work.

An actor dispatcher is a callback function that takes a `Context` object and
a bare handle, and returns an actor object.  The actor object can be one of
the following:

 -  `Application`
 -  `Group`
 -  `Organization`
 -  `Person`
 -  `Service`

The below example shows how to register an actor dispatcher:

~~~~ typescript{7-15}
import { Federation, Person } from "@fedify/fedify";

const federation = new Federation({
  // Omitted for brevity; see the related section for details.
});

federation.setActorDispatcher("/users/{handle}", async (ctx, handle) => {
  // Work with the database to find the actor by the handle.
  if (user == null) return null;  // Return null if the actor is not found.
  return new Person({
    id: ctx.getActorUri(handle),
    preferredUsername: handle,
    // Many more properties; see the next section for details.
  });
});
~~~~

In the above example, the `~Federation.setActorDispatcher()` method registers
an actor dispatcher for the `/users/{handle}` path.  This pattern syntax
follows the [URI Template] specification.

> [!TIP]
> By registering the actor dispatcher, `Federation.handle()` automatically
> deals with [WebFinger] requests for the actor.

[actors]: https://www.w3.org/TR/activitystreams-core/#actors
[activities]: https://www.w3.org/TR/activitystreams-core/#activities
[URI Template]: https://datatracker.ietf.org/doc/html/rfc6570
[WebFinger]: https://datatracker.ietf.org/doc/html/rfc7033


Key properties of an `Actor`
----------------------------

Despite ActivityPub declares every property of an actor as optional,
in practice, you need to set some of them to make the actor work properly
with the existing ActivityPub implementations.  The following shows
the key properties of an `Actor` object:

### `id`

The `~Object.id` property is the URI of the actor.  It is a required property
in ActivityPub.  You can use the `Context.getActorUri()` method to generate
the dereferenceable URI of the actor by its bare handle.

### `preferredUsername`

The `preferredUsername` property is the bare handle of the actor.  For the most
cases, it is okay to set the `preferredUsername` property to the string taken
from the `handle` parameter of the actor dispatcher.

### `name`

The `~Object.name` property is the full name of the actor.

### `summary`

The `~Object.summary` property is usually a short biography of the actor.

### `url`

The `~Object.url` property usually refers to the actor's profile page.

### `published`

The `~Object.published` property is the date and time when the actor was
created.  Note that Fedify represents the date and time in
the [`Temporal.Instant`] value.

[`Temporal.Instant`]: https://tc39.es/proposal-temporal/docs/instant.html

### `inbox`

The `inbox` property is the URI of the actor's inbox.  You can use
the `Context.getInboxUri()` method to generate the URI of the actor's
inbox.

See the [*Inbox listeners*](./inbox.md) section for details.

### `outbox`

The `outbox` property is the URI of the actor's outbox.  You can use
the `Context.getOutboxUri()` method to generate the URI of the actor's
outbox.

### `followers`

The `followers` property is the URI of the actor's followers collection.
You can use the `Context.getFollowersUri()` method to generate the URI of
the actor's followers collection.

### `following`

The `following` property is the URI of the actor's following collection.
You can use the `Context.getFollowingUri()` method to generate the URI of
the actor's following collection.

### `publicKeys`

The `publicKeys` property contains the public keys of the actor.  It is
an array of `CryptographicKey` instances.

See the [next section](#public-keys-of-an-actor) for details.


Public keys of an `Actor`
-------------------------

In order to sign and verify the activities, you need to set the `publicKeys`
property of the actor.  The `publicKeys` property contains an array of
`CryptographicKey` instances, and usually you don't have to create it manually.
Instead, you can register a key pairs dispatcher through
the `~ActorCallbackSetters.setKeyPairsDispatcher()` method so that Fedify can
dispatch appropriate key pairs by the actor's bare handle:

~~~~ typescript{7-9,12-17}
federation.setActorDispatcher("/users/{handle}", async (ctx, handle) => {
  // Work with the database to find the actor by the handle.
  if (user == null) return null;  // Return null if the actor is not found.
  return new Person({
    id: ctx.getActorUri(handle),
    preferredUsername: handle,
    // Context.getActorKeyPairs() method dispatches the key pairs of an actor
    // by the handle, and returns an array of key pairs in various formats.
    // In this example, we only use the CryptographicKey instances.
    publicKey: (await ctx.getActorKeyPairs(handle))
      .map(keyPair => keyPair.cryptographicKey),
    // Many more properties; see the previous section for details.
  });
})
  .setKeyPairsDispatcher(async (ctxData, handle) => {
    // Work with the database to find the key pair by the handle.
    if (user == null) return [];  // Return null if the key pair is not found.
    // Return the loaded key pair.  See the below example for details.
    return [{ publicKey, privateKey }];
  });
~~~~

In the above example, the `~ActorCallbackSetters.setKeyPairsDispatcher()` method
registers a key pairs dispatcher.  The key pairs dispatcher is a callback
function that takes context data and a bare handle, and returns an array of
[`CryptoKeyPair`] object which is defined in the Web Cryptography API.

Usually, you need to generate key pairs for each actor when the actor is
created (i.e., when a new user is signed up), and securely store an actor's key
pairs in the database.  The key pairs dispatcher should load the key pairs from
the database and return them.

How to generate key pairs and store them in the database is out of the scope of
this document, but here's a simple example of how to generate a key pair and
store it in a [Deno KV] database in form of JWK:

~~~~ typescript
import { generateCryptoKeyPair, exportJwk } from "@fedify/fedify";

const kv = await Deno.openKv();
const { privateKey, publicKey } =
  await generateCryptoKeyPair("RSASSA-PKCS1-v1_5");
await kv.set(["keypair", handle], {
  privateKey: await exportJwk(privateKey),
  publicKey: await exportJwk(publicKey),
});
~~~~

Here's an example of how to load a key pair from the database too:

~~~~ typescript{8-16}
import { importJwk } from "@fedify/fedify";

federation
  .setActorDispatcher("/users/{handle}", async (ctx, handle) => {
    // Omitted for brevity; see the previous example for details.
  })
  .setKeyPairsDispatcher(async (ctxData, handle) => {
    const kv = await Deno.openKv();
    const entry = await kv.get<{ privateKey: JsonWebKey; publicKey: JsonWebKey }>(
      ["keypair", handle],
    );
    if (entry == null || entry.value == null) return [];
    return [
      {
        privateKey: await importJwk(entry.value.privateKey, "private"),
        publicKey: await importJwk(entry.value.publicKey, "public"),
      }
    ];
  });
~~~~

[`CryptoKeyPair`]: https://developer.mozilla.org/en-US/docs/Web/API/CryptoKeyPair
[Deno KV]: https://deno.com/kv
