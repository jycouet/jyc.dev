---
title: The Switch to Remult
---

I've been using [Remult](https://remult.dev) for a while now and I'm really happy with it.
Let me walk you through the switch and why I did it.

## Introduction

First of all, what is Remult? It's a library that allows you to build your application with a single language: TypeScript.
The main principle is SSoT aka Single Source of Truth. Which means that you can define once and use everywhere (client, server, db, validation, ...).
As a lazy developer, I'm in love with the idea of not having to write the same code twice (and maintain it two times!).

## The Discovery

In february 2023, I was at [ViennaJS](https://viennajs.org) where the creator [Noam Honig](https://twitter.com/noamhonig) gave a talk about his library.
I was really impressed by the fact that in 30 minutes, in a very cozy way, he was able tweak a client ONLY application to a fullstack application with:

- database
- access control
- validation
- ...
  I was like: "Why I spend more time on my side while he can do it so fast? and so reliable? I need to try it!".

## The Decision

Everyone has his prefered stack, so it's hard to see a presentation like that and see that everything is solved when you use Remult!
So you need to start to asses your stack and be open to get away from a few things! But not all because you can include remult step by steps in your app.
It's not a all or nothing decision.

=> You need to be open for good change. Change your habbits! (for the better ;))

## The Migration Process

## Initial Glimp

The cool thing is that you can just add it to your project and that's it! You can start enjoying it...
So, where to start? Where to have the source of truth? How to create my first entity? As I have a prostgres db, you can use `remult-cli` to generate all your entities as a one shot generator to not start from scratch. And it's what I did, after 1 line of code I got my 48 entities in my project, ready to be used!
Already with this step, I'm able to query my db, it's like my ORM now. Without the need to learn a new DSL or a new syntax, it's just typescript!

So in my backend, I can already do:

```ts
import { repo } from "remult";
import { User } from "$shared/entities/user";

const sales = await repo(User).find({
  where: { isSale: true },
});
```

I can also work with relations, like

```ts
const sales = await repo(User).find({
  where: { isSale: true },
  include: { orders: true },
});
```

All this, just from this one shot generator reading from my db schema!

::: tip
I think that it's important to mention that it's a one shot generator, as after my SSoT are my entities, annd everything will be derived from it (including migrations !)
:::

My project was using Prisma, and no I didn't remove prisma in 1 afternoon! In real life project, things takes time... You have complexe queries, you want to make sure everything still work, etc etc... So I had Prisma & Remult in parallel for a few weeks, and it's fine, it's the backend. Like this I'm confident to move step by step.

## Let's take move advantage

Now, let's use also remult in the frontend! On my side, I'm using Svelte, and the thing is that remult works with all frontends, so pick yours!

Let's say, I want to have a list of sales on my page, I will do:

```ts
import { repo } from "remult";
import { User } from "$shared/entities/user";

const sales = await repo(User).find({
  where: { isSale: true },
});
```

Wait what? It's the same code?! Yes!
But here, it will do an api call to the backend that will do an sql query to get the data. And all this typed!

🤯 🤯 🤯

So all new features for my app, I start to use this technique... enhance my entities to give more and more knowledge to the SSoT.
Field caption for example! How many time you have to display the label of a field and you write over and over again "Name of the user" ? With remult, you can define it once and use it everywhere!

Same things for validation, you probably want the name to be required, so in the field name, you can add `required: true` and that's it! You can use it in the backend and in the frontend! (Validation will run in both places). As `required` is verry common, it's a property, but you can also define your own validation function! like:

```ts
	@Fields.string({
		caption: 'Nom',
		validate: (e) => {
			if (e.name.startWith("j")) throw "can't start with j !!! (it's only for jycouet)"
    }
	})
	name!: string
```

You can do this, in my app in reality, I use only already powerfull builtin validation. My favorit is probably:

```ts
@Fields.string({ validate: [Validators.unique()] })
email!: string
```

This one will run only in the backend, to check if the email is unique in the db. And it's only one line of code!

## Deep Dive into Features

### Admin UI

This feature was not present when I started, but now it's a game changer! It's a full admin UI that you can use to manage your entities. It's like a CMS for your entities. You can create, update, delete, search, filter, ... It's a real time saver! And it's also a good way to see if your entities are well defined, as you can see the data in a table, and you can see the relations, etc...

### Lyfecycle hooks

It's so handy to have hooks in your entities & fields! You can do things before or after a save, a delete, a find, ...
for example, making sure email and in lowercase and trimmed:

```ts
	@Fields.string<User>({
		saving: (u) => u.email.trim().toLowerCase(),
	})
	email!: string
```

In a few lines of code, I also implemented `ChangeLogs` in my app. So I can see who did what and when! Ask me if you want to know more about it ;)

### Backend methods

Sometimes, you need to have a very specific data "out of nowhere", here you can use backend methods. You just call this function from the frontend, and it will do the front -> back api call for you. It's so flexbile !

## Benefits Realized

The main benefit is really this SSoT, as it improves my efficiency, maintenance, and scalability for all my projects.

Yesterday, I finished my migration, everything is now running on remult. And I did a small exercise, I did a PR of now to the code before remult => it's divided by 4 !!! (With all the features of before, and some new developped allong the way !)

## Conclusion

As you could read, I'm really happy about my switch.
I'm also contributing to remult project and it's a joy! Tons of new features / ideas a coming, and I'm happy to be part of it.
