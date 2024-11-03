---
title: Less Code (-75%) & More Power (💪) with Remult
---

[Read on dev.to](https://dev.to/jycouet/less-code-75-more-power-with-remult-325m)

I've been using [Remult](https://remult.dev) for a while now and I'm really happy with it. Let me
walk you through why I made the switch and how it went.

![Switch to remult PR](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/jvfghhbvkymbgakpn5ck.png)

## Introduction

First off, what is "Remult"? It's a library that lets you build applications entirely in TypeScript.
The main concept here is SSoT—Single Source of Truth. This means you can define everything just once
and use it everywhere (client, server, db, validation, etc.). As someone who appreciates efficiency
_(OK, I'm lazy)_, I love not having to write **and maintain** the same code twice.

## The Discovery

Back in February 2023, I attended [ViennaJS](https://viennajs.org) where
[Noam Honig](https://twitter.com/noamhonig), the creator of Remult, was speaking. His presentation
was eye-opening. In just 30 minutes, he transformed a client-only application into a full-stack
application complete with:

- Database integration
- Access control
- Validation
- Even deployment !

I thought to myself:

> "Why am I spending more time then him doing similar things? I need to try this asap!!!"

At [confrontjs](https://twitter.com/confrontjs) this year:
{% embed https://twitter.com/TejasKumar_/status/1778777683452694637 %}

## The Decision

We all have our preferred tech stacks, and it's tough to see a demo like that and believe that one
tool can solve all your problems. So you need a step back, breath, and assess your current stack and
be open to letting go some parts.

=> Be open to good changes. Change your habits for the better! ;)

_You know what is the best part? It's not an all-or-nothing decision, you can add remult
step-by-step 🎉_

## The Migration Process

### Initial Glimpse

The cool thing is that you can simply add Remult to your project and start enjoying its benefits.
So, where do you start? Where to set up your source of truth? How to create your first entity? _it
can be overwhelming to start, but no worries._

Since I have a PostgreSQL database, I used `remult-cli` to generate all my entities in one go, so I
didn't have to start from scratch. Just like that, with one line of code, I had 48 entities in my
project, ready to be used. From this point, I could already query my database. It became my ORM
without needing to learn a new DSL or syntax.

In my backend, I can now do things like:

```ts
import { repo } from 'remult'

import { User } from '$shared/entities/user'

const sales = await repo(User).find({
  where: { isSale: true }
})
```

I can also work with relations, like

```ts
const sales = await repo(User).find({
  where: { isSale: true },
  include: { orders: true }
})
```

All this, just from this one shot generator reading from my db schema!

_Note:_

> I think that it's important to mention that it's a one shot generator, as after my SSoT are my
> entities, and everything will be derived from it (including migrations!)

My project was using Prisma, and no I didn't remove Prisma in one afternoon! In real life projects,
things take time... You have complex queries, you want to make sure everything still works, etc.,
etc. So I had Prisma & Remult running in parallel for a few weeks, and it's fine, it's the backend.
Like this I'm confident to move step by step.

## Let's take more advantage

Now, let's also use Remult in the frontend! On my side, I'm using Svelte, _(the thing is that Remult
works with all frontends, so pick yours! 🧡)_

Let's say, I want to have a list of sales on my page, I will do:

```ts
import { repo } from 'remult'

import { User } from '$shared/entities/user'

const sales = await repo(User).find({
  where: { isSale: true }
})
```

Wait what? It's the same code as before?! **Yes!** But here, it will do:
`page -> API call -> backend -> db`. And all this... typed!

🤯 🤯 🤯

So all new features for my app, I start to use this technique... enhance my entities to give more
and more knowledge to the SSoT.

Field caption for example! How many times have you had to display the label of a field and you write
over and over again "Name of the user"? With Remult, you can define it once and use it everywhere!

Same things for validation, you probably want the name to be required, so in the field name, you can
add `required: true` and that's it! You can use it in the backend and in the frontend! _(Validation
will run in both places)_. As required is very common, it's a property, but you can also define your
own validation function! Like:

```ts
@Fields.string({
  caption: 'Nom',
  validate: (e) => {
    if (e.name.startWith("jyc"))
      throw "can't start with j !!! (it's only for me 😉)"
  }
})
name!: string
```

You can do this; in my app, in reality, I use only already powerful built-in validation. My favorite
is probably:

```ts
@Fields.string({ validate: [Validators.unique()] })
email!: string
```

This one will run only in the backend, to check if the email is unique in the db. Soooo handy!

## Deep Dive into Features

### Admin UI

This feature was not present when I started, but now it's a game-changer! It's a full admin UI that
you can use to manage your entities. It's like a CMS for your entities. You can create, update,
delete, search, filter, ... It's a real time saver!

{% embed https://twitter.com/jycouet/status/1757736965762351227 %}

It's also a perfect way to browse your data **and its relations** with the context _thx to nested
tables_.

As it's using the normal remult api, all security is fully functional.

Example:

```ts
@Entity('salaries', {
  // All users authenticated can see salaries
  allowApiRead: Allow.authenticated,
  // SUPER_ADMIN can edit salaries (so better be friend with SUPER_ADMIN!)
  allowApiCrud: Role.SUPER_ADMIN
})
export class Salary {
  // ...
}
```

### Lifecycle hooks

It's so handy to have hooks in your entities & fields! You can do things before or after a save, a
delete, a find... for example, making sure the email is in lowercase and trimmed:

```ts
@Fields.string<User>({
  saving: (u) => u.email.trim().toLowerCase(),
})
email!: string
```

In a few lines of code, I also implemented ChangeLogs in my app. So I can see who did what and when!
Ask me if you want to know more about it ;)

### Backend methods

Sometimes, you need to have a very specific data "out of nowhere"; here, you can use backend
methods. You just call this function from the frontend, and it will do the front -> back API call
for you. It's so flexible!

## Benefits Realized

The main benefit is really this SSoT, as it improves my efficiency, maintenance, and scalability for
all my projects.

Yesterday, I finished my migration; everything is now running on Remult 🥳. And I did a small
exercise, a PR to compare `now` vs `before Remult`:
![Switch to remult PR](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/jvfghhbvkymbgakpn5ck.png)

<center>Yes, there is 4 times less code 🥳 🥳 🥳 !!!</center>
_(With all the features of before, and some new developed along the way!)_

## Conclusion

If you couldn't tell, I'm more than just a bit excited about my switch to Remult. I'm absolutely
thrilled! The way it improved my projects by cutting down unnecessary complexity and reducing code
bloat is just phenomenal. And guess what? My adventure didn't stop at just using Remult; I've dived
deeper and am now actively contributing.

I’m really pumped to see where we can take Remult next, and I’d love for you to join us on this
journey. Whether you're tweaking your current projects or kickstarting new ones, Remult has
something to offer. Come and see how it can transform your development experience—let’s code better,
faster, and smarter, together!

Come and say hi [⭐️ Remult](https://github.com/remult/remult)
