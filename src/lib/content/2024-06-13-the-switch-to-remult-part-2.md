---
title: The Power of Less: Streamlining Dependencies with Remult
---

TODO
[Read on dev.to](https://dev.to/jycouet/less-code-75-more-power-with-remult-325m)

In my last post, I shared my epic journey switching to Remult, which slashed my codebase by 75% and turbocharged my development power. 💪 If you haven't checked it out, give it a read here!

Today, let’s dive deeper into one of the most transformative aspects of my switch: Reducing Dependencies. Streamlining my tech stack not only simplified my workflow but also enhanced my project's maintainability. Let’s break it down:

# Deps Reduction

## Prisma

I've had a soft spot for Prisma; its DSL is user-friendly and learning it is a breeze. But, here's the catch - while it streamlines some processes, it introduces its own complexities (think migrations, file management, etc.). Plus, I found myself using Aurora to manage multiple Prisma configurations, which, again adds up in the stack. _This + this + that... It starts to be a lot!_

Switching to Remult, I said goodbye to these additional layers. Remult lets me handle everything from entity definitions to database interactions directly within my usual coding environment, eliminating the need for separate DSLs or configuration files. It’s like getting rid of excess baggage - feels great!

// TODO: Things that I gained that was not possible with Prisma:

- Views
- Calculated Fields
- Store Procedures! (With migration management!!!)

## GraphQL

// TODO: Need to rewrite
As a longtime GraphQL enthusiast (shoutout to The Guild!), transitioning away wasn't easy. I even built KitQL, aiding both client and server-side operations, but the ceremony of setting up resolvers and modules felt increasingly cumbersome.

What I adore about Remult is its ability to natively handle data operations that GraphQL manages through resolvers. Plus, Remult retains metadata, which is typically lost in GraphQL's focus on data values. Though Remult supports GraphQL, it treats it as an internal detail, perfect for optimizing the network layer without losing sight of the metadata richness.

## Felte, Vest, Zod

Before Remult, integrating validations into my projects required additional libraries like Felte and/or Vest and/or Zod. Now, validations are an integral part of my entities within Remult. This integration reduces the number of dependencies and aligns validation logic tightly with the rest of my application logic.

# Meta Frameworks and Remult

In a world swarming with meta frameworks, you might wonder if Remult still has its place. My answer? An absolute yes!

Frameworks like use server tend to fragment your code. It's easy to fetch a list of users in one spot, but what about maintaining a single source of truth? Now, your business logic starts to be across routes and components. Remult, in contrast, keeps this logic consistent and centralized, significantly tidying up your codebase.

For instance, imagine you’re juggling Prisma and use server. Every time you fetch users, you must remember to exclude the disabled ones. Prisma focuses solely on data retrieval, and use server on serving data, with neither taking responsibility for the business logic. With Remult, business logic remains consistent and centralized, a stark improvement over the ORM-only approach.

In the end, Remult not only simplifies your tech stack but also enriches it, ensuring that all parts of your application speak the same language - efficiency.

Stay tuned for more deep dives into Remult's features and how you can leverage them to supercharge your development process. Next time, we’ll explore advanced features like lifecycle hooks and backend methods which can further refine your coding experience.

Looking forward to seeing you streamline and energize your projects with Remult! 🚀

Feel free to drop by ⭐️ Remult and join our growing community. Let's code smarter, not harder!

If you have a question / suggestion, do not hesitate to write here or DM me.
