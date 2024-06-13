---
title: The Power of Less: Streamlining Dependencies with Remult
published: true
series: remult-all-the-things
---

[Read on dev.to](https://dev.to/jycouet/the-power-of-less-streamlining-dependencies-with-remult-55e2)

In my last post, I shared my epic journey switching to Remult, which shrank my codebase by 75% and turbocharged my development power. 💪 If you haven't checked it out, give it a read [here](https://dev.to/jycouet/less-code-75-more-power-with-remult-325m)!

Today, let’s dive deeper into one of the most transformative aspects of my switch: Reducing Dependencies. Streamlining my tech stack not only simplified my workflow but also enhanced my project's maintainability. Let’s break it down:

## Deps Reduction

### Prisma

I've had a soft spot for Prisma; its DSL is user-friendly and learning it is a breeze. But, here's the catch - while it streamlines some processes, it introduces its own things (DSL, Migrations, File management, Syntax, etc.). Plus, I found myself using Aurora to manage multiple Prisma models, which, again, adds up in the stack. This + this + that... It starts to be a lot!

{% details Disclaimer%}
On the day I write this article, Prisma released this "Schema into Multiple Files". Will I switch back to Prisma? **No**! I gained so much with Remult that Prisma is not even coming close ;) even with this new preview feature!
{% enddetails %}

Switching to Remult, I said goodbye to these additional layers. Remult lets me handle everything from entity definitions to database interactions directly within my usual coding environment, eliminating the need for separate DSLs or configuration files. It’s like getting rid of excess baggage - feels great! It's just TypeScript, no more, no less!

Some things I gained that were not possible with Prisma:

- Views: Easily create and manage views in your database.
- Calculated Fields: Simplify your data manipulations by defining fields that are calculated on the fly. You have two flavors of that: `serverExpression` or `sqlExpression`, both are so convenient!
- Stored Procedures: Incorporate complex business logic and operations directly into your database, with migration management included!
- Admin dashboard: A built-in admin dashboard to manage your data and entities. (Working with your authorization system!!! So it's not something that you use only in development, but also in production if you want)
  {% embed https://twitter.com/jycouet/status/1757736965762351227 %}

Note also that AI is REALLLLLLLLY good at raw SQL. And here, we can mix and match raw SQL (in `sqlExpression`) and Remult.

👉 It's a perfect match 🥳

### GraphQL

As a longtime GraphQL enthusiast (shoutout to The Guild), it was hard for me to put this part of my stack into question.

I even built [KitQL](https://www.kitql.dev/), a library to help with client and server for GraphQL! Being so much in it you don't realize all the ceremonies you go through anymore to add a functionality.

**Disclaimer**: KitQL shape changed a lot during the past months. Now, **KitQL** itself is not a library, **it’s “nothing”** but a collection of standalone libraries.

- For GraphQL server, simply use [graphql yoga](https://the-guild.dev/graphql/yoga-server)
- For GraphQL client, simply use [houdini](https://houdinigraphql.com/)

But now, I realize that GraphQL, eventually, is an implementation detail, mainly focusing on the network layer. The second key part of GraphQL is fragments, but also focusing only on network data. And it's here that Remult shines so much: taking advantage of metadata.

I give you 2 examples:

1. metadata. When I was designing a Grid, I had to define columns with headers, then populate the Grid with data coming from the network (GraphQL). So you have to define headers on one side and network data on the other side. With Remult, you define on fields of your entities a property called `caption`. And that's it! Now, I just define columns, and it will bring data & headers, all in one. Also, when the field is used in another place, you can get its `caption`. So you have a single source of truth for your entire application.
2. enums. With GraphQL, you have to define your enums in your schema, and then, you have to define them in your client code. I mean that you will have to have a `caption` displayed for your users instead of the enum value. So it's some code to add somewhere... to organize, to centralize, ... With Remult, you define your enums in your entities field by field, and you can use them everywhere in your application. And you can get the caption of the enum value. So you have a single source of truth for your entire application. **Bonus**: You can have a lot more than just `caption`!

👉 So for now, I just removed GraphQL from my stack! _(it's a big statement for me!)_

**Note 1**: Remult can enable GraphQL in a few lines of code (check it out [here](https://remult.dev/docs/adding-graphql#adding-graphql)). So if you really need it, you can have it 😉 _(it was my first contribution btw)_.

**Note 2**: I'm sure that one day I'll develop a [Houdini Plugin](https://houdinigraphql.com/api/client-plugins), to take advantage of all metadata that Remult can provide + optimize the network layer with this internal detail: GraphQL! _(In my "work work", it's premature optimization)_

### Felte, Vest, Zod

Before Remult, integrating validations into my projects required additional libraries like Felte and/or Vest and/or Zod. Now, validations are an integral part of my entities. This integration reduces the number of dependencies and aligns validation logic tightly with the rest of my application logic.

What else to say? Nothing much! It's again a single source of truth for your entire application, validation frontend and backend in a single place 😍.

## Meta Frameworks and Remult

In the JavaScript world, you have frameworks and meta frameworks...! you might wonder if Remult still has its place? My answer? **An absolute YES**!

Meta Frameworks like SvelteKit, Next.js, and others tend to fragment your code. It's easy to fetch a list of users in one spot, but what about maintaining a single source of truth? With this approach, your business logic starts to be spread across routes and components. Remult, in contrast, keeps this business logic consistent and centralized, significantly tidying up your codebase.

For instance, imagine you are with Prisma and NextJs. Every time you fetch users, you must remember to exclude the disabled ones. Prisma focuses **ONLY** on data retrieval, and the meta framework **ONLY** on serving data, and no one is responsible for the business logic, so you add this logic in a route, in a component, ... somewhere... and everywhere! With Remult, business logic remains consistent and centralized: in the entity definition. So you can be sure that every time you fetch users, the disabled ones are excluded for example!

Meta Frameworks give you tools to build an app, but you still need to do a lot around to have clean and maintainable code. Take validation for example, with Meta Frameworks you have "nothing"... So you can validate data in Actions, but it's your own concern, you have to do it yourself... You will probably add a dependency to help you, you will fragment your code to have frontend and backend validation, ... With Remult, you have it all in one place, and it's so easy to use!

---

Stay tuned for more deep dives into Remult's features and how you can leverage them to supercharge your development process. Next time, we’ll explore advanced features like lifecycle hooks and backend methods which can further refine your coding experience.

Feel free to drop by [⭐️ Remult](https://github.com/remult/remult) and join our growing community.
👉 Let's code smarter, not harder!

If you have a question or suggestion, do not hesitate to write here or DM me.
