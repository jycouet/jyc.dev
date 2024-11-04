import { describe, expect, it } from 'vitest'

import { determineCategory } from './determineCategory'

describe('determineCategory', () => {
  it('no posts', () => {
    expect(
      determineCategory({
        nbPostStared: 1,
        nbPostRepliesToAStartedOne: 0,
        nbPostRepliesToOthers: 0,
        kindOfEmbed: [],
      }).emoji,
    ).toMatchInlineSnapshot(`"🦥"`)
  })

  it('https://jyc.dev/at/sarah11918.rainsberger.ca', () => {
    expect(
      determineCategory({
        nbPostStared: 9,
        nbPostRepliesToAStartedOne: 3,
        nbPostRepliesToOthers: 4,
        kindOfEmbed: [],
      }).emoji,
    ).toMatchInlineSnapshot(`"🦉"`)
  })

  it('https://jyc.dev/at/rich-harris.dev', () => {
    expect(
      determineCategory({
        nbPostStared: 7,
        nbPostRepliesToAStartedOne: 36,
        nbPostRepliesToOthers: 13,
        kindOfEmbed: [],
      }).emoji,
    ).toMatchInlineSnapshot(`"🦚"`)
  })

  it('https://jyc.dev/at/jyc.dev', () => {
    expect(
      determineCategory({
        nbPostStared: 22,
        nbPostRepliesToAStartedOne: 32,
        nbPostRepliesToOthers: 68,
        kindOfEmbed: [],
      }).emoji,
    ).toMatchInlineSnapshot(`"🦋"`)
  })

  it('https://jyc.dev/at/afaikfyi.bsky.social', () => {
    expect(
      determineCategory({
        nbPostStared: 15,
        nbPostRepliesToAStartedOne: 8,
        nbPostRepliesToOthers: 22,
        kindOfEmbed: [],
      }).emoji,
    ).toMatchInlineSnapshot(`"🐝"`)
  })

  it('https://jyc.dev/at/lucasoe.bsky.social', () => {
    expect(
      determineCategory({
        nbPostStared: 7,
        nbPostRepliesToAStartedOne: 4,
        nbPostRepliesToOthers: 5,
        kindOfEmbed: [],
      }).emoji,
    ).toMatchInlineSnapshot(`"🕷️"`)
  })

  it('should categorize as Curious Cat when mostly replying to others', () => {
    expect(
      determineCategory({
        nbPostStared: 5,
        nbPostRepliesToAStartedOne: 3,
        nbPostRepliesToOthers: 12,
        kindOfEmbed: [],
      }).emoji,
    ).toMatchInlineSnapshot(`"🐱"`)
  })
})
